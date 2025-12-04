package com.jjapartments.backend.controllers;

import com.jjapartments.backend.dto.TicketStatusUpdateRequest;
import com.jjapartments.backend.dto.TicketSubmitRequest;
import com.jjapartments.backend.exception.ErrorException;
import com.jjapartments.backend.models.Status;
import com.jjapartments.backend.models.Ticket;
import com.jjapartments.backend.repository.TicketRepository;
import com.jjapartments.backend.util.RecaptchaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private RecaptchaService recaptchaService;

    @PostMapping("/submit")
    public ResponseEntity<?> submit(@RequestBody TicketSubmitRequest payload) {
        try {
            System.out.println("=== TICKET SUBMIT START ===");

            // Skip reCAPTCHA temporarily for testing
            // if (!recaptchaService.verify(recaptchaToken)) {
            // return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            // .body(Map.of("error", "reCAPTCHA verification failed"));
            // }

            Ticket ticket = payload.getTicket();

            System.out.println("=== CALLING REPOSITORY ===");
            int id = ticketRepository.add(ticket);
            System.out.println("=== REPOSITORY RETURNED: " + id + " ===");

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", id));
        } catch (Exception e) {
            System.err.println("=== EXCEPTION IN CONTROLLER ===");
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        int ticketId;
        try {
            ticketId = Integer.parseInt(id);
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid ticket ID"));
        }

        try {
            Ticket ticket = ticketRepository.findById(ticketId);
            if (ticket == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Ticket not found"));
            }

            return ResponseEntity.ok(ticket);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An internal server error occurred while fetching the ticket."));
        }
    }

    @GetMapping("")
    public ResponseEntity<?> getTickets(@RequestParam(required = false) String status) {
        try {

            if (status == null || status.isBlank()) {
                List<Ticket> tickets = ticketRepository.findAll();
                return ResponseEntity.ok(tickets);
            }

            Status enumStatus;
            try {
                enumStatus = Status.valueOf(status.trim().toUpperCase().replace(" ", "_"));
            } catch (IllegalArgumentException ex) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error",
                                "Invalid status. Must be one of: Pending, In Progress, Resolved, Closed"));
            }

            List<Ticket> tickets = ticketRepository.findByStatus(enumStatus);
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Unexpected server error."));
        }
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody TicketStatusUpdateRequest payload) {
        int ticketId;
        try {
            ticketId = Integer.parseInt(id);
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid ticket ID"));
        }

        if (payload == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Request body is required"));
        }

        String statusValue = payload.getStatus();
        if (isBlank(statusValue)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Status is required"));
        }

        Status statusEnum;
        try {
            statusEnum = Status.fromLabel(statusValue.trim());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid status. Must be one of: Pending, In Progress, Resolved, Closed"));
        }

        String statusUpdatedAt = payload.getStatusUpdatedAt();
        if (isBlank(statusUpdatedAt)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Status updated timestamp is required"));
        }
        try {
            Instant.parse(statusUpdatedAt.trim());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid timestamp format for statusUpdatedAt"));
        }

        String statusUpdatedBy = payload.getStatusUpdatedBy();
        if (isBlank(statusUpdatedBy)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Status updated by is required"));
        }

        Ticket existingTicket;
        try {
            existingTicket = ticketRepository.findById(ticketId);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An internal server error occurred while fetching the ticket."));
        }

        if (existingTicket == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Ticket not found"));
        }

        try {
            int updatedRows = ticketRepository.updateStatus(ticketId, statusEnum, statusUpdatedAt.trim(),
                    statusUpdatedBy.trim());
            if (updatedRows == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Ticket not found"));
            }
            Ticket updatedTicket = ticketRepository.findById(ticketId);
            return ResponseEntity.ok(updatedTicket);
        } catch (ErrorException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An internal server error occurred while updating the ticket status."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An internal server error occurred while updating the ticket status."));
        }
    }
}
