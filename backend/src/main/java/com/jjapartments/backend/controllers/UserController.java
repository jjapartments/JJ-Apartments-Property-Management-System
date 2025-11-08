package com.jjapartments.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.jjapartments.backend.models.User;
import com.jjapartments.backend.exception.ErrorException;
import com.jjapartments.backend.repository.UserRepository;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // Create
    @PostMapping("/add")
    public ResponseEntity<?> addUser(@RequestBody User user) {
        try {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            userRepository.add(user);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "User created successfully"));
        } catch (ErrorException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Get all users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    // Get user by id
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable int id) {
        User user = userRepository.findById(id);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable int id) {
        int rowsAffected = userRepository.delete(id);
        if (rowsAffected > 0) {
            return ResponseEntity.ok(Map.of("message", "User deleted successfully."));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
        }
    }

    // Update
    @PatchMapping("/update/{id}")
    public ResponseEntity<?> updateUser(@PathVariable int id, @RequestBody User user) {
        try {
            userRepository.update(id, user);
            return ResponseEntity.ok(userRepository.findById(id));
        } catch (ErrorException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Add login endpoint
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        try {
            User existingUser = userRepository.findByUsername(user.getUsername());

            if (existingUser == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "ACCOUNT_NOT_FOUND"));
            }

            if (!passwordEncoder.matches(user.getPassword(), existingUser.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "INVALID_PASSWORD"));
            }

            // Success: remove password before sending
            existingUser.setPassword(null);
            return ResponseEntity.ok(existingUser);

        } catch (ErrorException e) {
            // This catches the "User with username X not found" from repository
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "ACCOUNT_NOT_FOUND"));
        }
    }
}
