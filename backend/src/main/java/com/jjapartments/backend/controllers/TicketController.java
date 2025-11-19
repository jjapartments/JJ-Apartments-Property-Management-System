package com.jjapartments.backend.controllers;

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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import java.util.Map;
import java.util.List;
import java.util.Optional;

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
            if (payload == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Request body is required"));
            }

            String recaptchaToken = payload.getRecaptchaToken();
            if (!recaptchaService.verify(recaptchaToken)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "reCAPTCHA verification failed"));
            }

            Ticket ticket = payload.getTicket();
            if (ticket == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Ticket payload is required"));
            }

            // validation for required fields
            if (isBlank(ticket.getUnitNumber()) ||
                    isBlank(ticket.getApartmentName()) ||
                    isBlank(ticket.getName()) ||
                    isBlank(ticket.getPhoneNumber()) ||
                    ticket.getCategory() == null ||
                    isBlank(ticket.getSubject()) ||
                    isBlank(ticket.getBody()) ||
                    isBlank(ticket.getSubmittedAt())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Missing required fields"));
            }

            // Default status if not provided
            if (ticket.getStatus() == null) {
                ticket.setStatus(Status.PENDING);
            }

            if (isBlank(ticket.getStatusUpdatedAt())) {
                ticket.setStatusUpdatedAt(ticket.getSubmittedAt());
            }
            ticket.setStatusUpdatedBy(null);

            int id = ticketRepository.add(ticket);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", id));
        } catch (ErrorException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An internal server error occurred while submitting the ticket."));
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
            Optional<Ticket> opt = ticketRepository.findById(ticketId);
            if (opt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Ticket not found"));
            }
            return ResponseEntity.ok(opt.get());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An internal server error occurred while fetching the ticket."));
        }
    }

    @GetMapping("")
    public ResponseEntity<?> getTickets(@RequestParam(required = false) String status) {
        try {
            // No status provided → return all tickets ordered by most recent first
            if (status == null || status.trim().isEmpty()) {
                List<Ticket> tickets = ticketRepository.findAllByOrderBySubmittedAtDesc();
                return ResponseEntity.ok(tickets);
            }

            // Normalize status value
            String normalized = status.trim().toUpperCase().replace(" ", "_");

            // Convert to enum or return 400 if invalid
            Status enumStatus;
            try {
                enumStatus = Status.valueOf(normalized);
            } catch (IllegalArgumentException ex) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Invalid status. Must be one of: Pending, In Progress, Resolved, Closed"));
            }

            // Return filtered and ordered ticket list
            List<Ticket> tickets = ticketRepository.findByStatusOrderBySubmittedAtDesc(enumStatus);
            return ResponseEntity.ok(tickets);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An internal server error occurred while fetching tickets."));
        }
    }


    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
