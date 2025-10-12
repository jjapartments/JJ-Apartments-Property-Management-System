package com.jjapartments.backend.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.jjapartments.backend.models.SubTenant;
import com.jjapartments.backend.repository.SubTenantRepository;
import com.jjapartments.backend.exception.ErrorException;

@RestController
@RequestMapping("/api/subtenants")
public class SubTenantController {
    @Autowired
    private SubTenantRepository subTenantRepository;

    // Create
    @PostMapping("/add")
    public ResponseEntity<?> addSubTenant(@RequestBody SubTenant subTenant) {
        try {
            SubTenant newSubTenant = subTenantRepository.add(subTenant);
            return ResponseEntity.status(HttpStatus.CREATED).body(newSubTenant);
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
    public ResponseEntity<List<SubTenant>> getAllSubTenants() {
        try {
            List<SubTenant> subTenants = subTenantRepository.findAll();
            return ResponseEntity.ok(subTenants);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Get by main tenant ID
    @GetMapping("/tenant/{mainTenantId}")
    public ResponseEntity<List<SubTenant>> getSubTenantsByMainTenantId(@PathVariable int mainTenantId) {
        try {
            List<SubTenant> subTenants = subTenantRepository.findByMainTenantId(mainTenantId);
            return ResponseEntity.ok(subTenants);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteSubTenant(@PathVariable int id) {
        int rowsAffected = subTenantRepository.delete(id);
        if (rowsAffected > 0) {
            return ResponseEntity.ok("Sub-tenant deleted successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Sub-tenant not found");
        }
    }

    // Update
    @PatchMapping("/update/{id}")
    public ResponseEntity<?> updateSubTenant(@PathVariable int id, @RequestBody SubTenant subTenant) {
        try {
            subTenantRepository.update(id, subTenant);
            return ResponseEntity.ok(subTenantRepository.findById(id));
        } catch (ErrorException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}