package com.jjapartments.backend.controllers;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.jjapartments.backend.dto.TenantWithUnitDTO;
import com.jjapartments.backend.dto.UnitTenantsDTO;
import com.jjapartments.backend.exception.ErrorException;
import com.jjapartments.backend.models.SubTenant;
import com.jjapartments.backend.models.Tenant;
import com.jjapartments.backend.models.Unit;
import com.jjapartments.backend.repository.SubTenantRepository;
import com.jjapartments.backend.repository.TenantRepository;
import com.jjapartments.backend.repository.UnitRepository;

@RestController
@RequestMapping("/api/tenants")
public class TenantController {
    @Autowired
    private TenantRepository tenantRepository;
    @Autowired
    private SubTenantRepository subTenantRepository;
    @Autowired
    private UnitRepository unitRepository;

    // Create
    @PostMapping("/add")
    public ResponseEntity<?> addTenant(@RequestBody Tenant tenant) {
        try {
            Tenant newTenant = tenantRepository.add(tenant);
            Unit associatedUnit = unitRepository.findById(newTenant.getUnitId());
            TenantWithUnitDTO response = mapToTenantWithUnitDTO(newTenant, associatedUnit);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (ErrorException e) {
            String errorMessage = e.getMessage();

            // Determine appropriate HTTP status based on error message
            if (errorMessage.contains("not found") || errorMessage.contains("Unit not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", errorMessage));
            } else if (errorMessage.contains("occupied") ||
                    errorMessage.contains("required") ||
                    errorMessage.contains("Invalid") ||
                    errorMessage.contains("already taken") ||
                    errorMessage.contains("already registered")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", errorMessage));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", errorMessage));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An internal server error occurred while creating the tenant."));
        }
    }

    private TenantWithUnitDTO mapToTenantWithUnitDTO(Tenant tenant, Unit unit) {
        TenantWithUnitDTO response = new TenantWithUnitDTO();
        response.setId(tenant.getId());
        response.setLastName(tenant.getLastName());
        response.setFirstName(tenant.getFirstName());
        response.setMiddleInitial(tenant.getMiddleInitial());
        response.setEmail(tenant.getEmail());
        response.setPhoneNumber(tenant.getPhoneNumber());
        response.setMessengerLink(tenant.getMessengerLink());
        response.setUnitId(tenant.getUnitId());
        response.setMoveInDate(tenant.getMoveInDate());
        response.setMoveOutDate(tenant.getMoveOutDate());
        response.setUnit(unit);
        return response;
    }

    // Get all
    @GetMapping
    public ResponseEntity<List<Tenant>> getAllTenants() {
        try {
            List<Tenant> tenants = tenantRepository.findAll();
            return ResponseEntity.ok(tenants);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTenant(@PathVariable int id) {
        try {
            int rowsAffected = tenantRepository.delete(id);
            if (rowsAffected > 0) {
                return ResponseEntity.ok("Tenant deleted successfully.");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Tenant not found");
            }
        } catch (ErrorException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An internal server error occurred while deleting the tenant.");
        }
    }

    // Update
    @PatchMapping("/update/{id}")
    public ResponseEntity<?> updateTenant(@PathVariable int id, @RequestBody Tenant tenant) {
        try {
            tenantRepository.update(id, tenant);
            return ResponseEntity.ok(tenantRepository.findById(id));
        } catch (ErrorException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An internal server error occurred while updating the tenant."));
        }
    }

    @PatchMapping("/{id}/move-out")
    public ResponseEntity<?> moveOutTenant(
            @PathVariable int id,
            @RequestBody Map<String, String> payload) {
        try {
            String moveOutDateStr = payload.get("move_out_date");
            if (moveOutDateStr == null || moveOutDateStr.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "move_out_date is required"));
            }

            LocalDate moveOutDate;
            try {
                moveOutDate = LocalDate.parse(moveOutDateStr);
            } catch (DateTimeParseException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid date format. Use ISO 8601 format"));
            }

            // Validate move-out date is not in the future
            if (moveOutDate.isAfter(LocalDate.now())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Move-out date cannot be in the future"));
            }

            Tenant updatedTenant = tenantRepository.updateMoveOut(id, moveOutDate);
            return ResponseEntity.ok(updatedTenant);
        } catch (ErrorException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process move-out: " + e.getMessage()));
        }
    }

    @GetMapping("/unit/{unitId}")
    public ResponseEntity<?> getAllTenantsForUnit(@PathVariable int unitId) {
        try {
            List<Tenant> mainTenants = tenantRepository.findByUnitId(unitId);
            List<SubTenant> subTenants = subTenantRepository.findByUnitId(unitId);

            UnitTenantsDTO response = new UnitTenantsDTO(mainTenants, subTenants);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Get all moved-in (active) tenants
    @GetMapping("/moved-in")
    public ResponseEntity<List<Tenant>> getMovedInTenants() {
        try {
            List<Tenant> tenants = tenantRepository.findAllMovedIn();
            return ResponseEntity.ok(tenants);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Get all moved-out tenants
    @GetMapping("/moved-out")
    public ResponseEntity<List<Tenant>> getMovedOutTenants() {
        try {
            List<Tenant> tenants = tenantRepository.findAllMovedOut();
            return ResponseEntity.ok(tenants);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
