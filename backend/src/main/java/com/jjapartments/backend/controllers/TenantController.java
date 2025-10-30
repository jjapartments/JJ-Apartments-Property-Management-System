package com.jjapartments.backend.controllers;

import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.jjapartments.backend.models.SubTenant;
import com.jjapartments.backend.models.Tenant;
import com.jjapartments.backend.repository.TenantRepository;
import com.jjapartments.backend.repository.SubTenantRepository;
import com.jjapartments.backend.dto.UnitTenantsDTO;
import com.jjapartments.backend.exception.ErrorException;

@RestController
@RequestMapping("/api/tenants")
public class TenantController {
    @Autowired
    private TenantRepository tenantRepository;
    @Autowired
    private SubTenantRepository subTenantRepository;

    // Create
    @PostMapping("/add")
    public ResponseEntity<?> addTenant(@RequestBody Tenant tenant) {
        try {
            Tenant newTenant = tenantRepository.add(tenant);
            return ResponseEntity.status(HttpStatus.CREATED).body(newTenant);
        } catch (ErrorException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
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
        int rowsAffected = tenantRepository.delete(id);
        if (rowsAffected > 0) {
            return ResponseEntity.ok("Tenant deleted successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Tenant not found");
        }
    }

    // Update
    @PatchMapping("/update/{id}")
    public ResponseEntity<?> updateTenant(@PathVariable int id, @RequestBody Tenant tenant) {
        try {
            tenantRepository.update(id, tenant);
            return ResponseEntity.ok(tenantRepository.findById(id));
        } catch (ErrorException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
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

            LocalDateTime moveOutDate;
            try {
                moveOutDate = LocalDateTime.parse(moveOutDateStr);
            } catch (DateTimeParseException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid date format. Use ISO 8601 format"));
            }

            // Validate move-out date is not in the future
            if (moveOutDate.isAfter(LocalDateTime.now())) {
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

}