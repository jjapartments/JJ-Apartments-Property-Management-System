package com.jjapartments.backend.controllers;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import com.jjapartments.backend.models.Unit;
import com.jjapartments.backend.repository.UnitRepository;
import com.jjapartments.backend.exception.ErrorException;

@RestController
@RequestMapping("/api/units")
public class UnitController {

    @Autowired
    private UnitRepository unitRepository;

    // Create
    @PostMapping("/add")
    public ResponseEntity<?> addUnit(@RequestBody Unit unit) {
        try {
            Unit newUnit = unitRepository.add(unit);
            return ResponseEntity.status(HttpStatus.CREATED).body(newUnit);
        } catch (ErrorException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    // Get all
    @GetMapping
    public ResponseEntity<List<Unit>> getAllUnits() {
        List<Unit> units = unitRepository.findAll();
        return ResponseEntity.ok(units);
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUnit(@PathVariable int id) {
        int rowsAffected = unitRepository.delete(id);
        if (rowsAffected > 0) {
            return ResponseEntity.ok("Unit deleted successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Unit not found");
        }
    }

    // Update
    @PatchMapping("/update/{id}")
    public ResponseEntity<?> updateUnit(@PathVariable int id, @RequestBody Unit unit) {
        try {
            unitRepository.update(id, unit);
            return ResponseEntity.ok(unitRepository.findById(id));
        } catch (ErrorException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    // Search
    @GetMapping("/search")
    public List<Unit> searchUnits(@RequestParam("q") String query) {
        return unitRepository.searchByKeyword(query);
    }

    @GetMapping("/findUnitId")
    public ResponseEntity<Integer> findUnitId(
            @RequestParam("name") String name,
            @RequestParam("unitNumber") String unitNumber) {
        Optional<Unit> unitOptional = unitRepository.findByNameAndUnitNumber(name, unitNumber);

        if (unitOptional.isPresent()) {
            return ResponseEntity.ok(unitOptional.get().getId());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

}