package com.jjapartments.backend.controllers;

import com.jjapartments.backend.dto.TicketStatusUpdateRequest;
import com.jjapartments.backend.dto.TicketSubmitRequest;
import com.jjapartments.backend.exception.ErrorException;
import com.jjapartments.backend.models.Status;
import com.jjapartments.backend.models.Ticket;
import com.jjapartments.backend.repository.TicketRepository;
import com.jjapartments.backend.util.RecaptchaService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger logger = LoggerFactory.getLogger(TicketController.class);

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private RecaptchaService recaptchaService;

    @PostMapping("/submit")
    public ResponseEntity<?> submit(@RequestBody TicketSubmitRequest payload) {
        logger.info("=== TICKET SUBMIT REQUEST RECEIVED ===");
        
        try {
            if (payload == null) {
                logger.error("Request body is null");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Request body is required"));
            }

            String recaptchaToken = payload.getRecaptchaToken();
            logger.debug("Recaptcha token present: {}", (recaptchaToken != null && !recaptchaToken.isEmpty()));

            if (!recaptchaService.verify(recaptchaToken)) {
                logger.warn("Recaptcha verification FAILED for token: {}", 
                           recaptchaToken != null ? recaptchaToken.substring(0, Math.min(20, recaptchaToken.length())) + "..." : "null");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "reCAPTCHA verification failed"));
            }

            logger.info("Recaptcha verification PASSED");

            Ticket ticket = payload.getTicket();
            if (ticket == null) {
                logger.error("Ticket payload is null");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Ticket payload is required"));
            }

            // Log ticket data for debugging
            logger.debug("Ticket data - Unit: {}, Apartment: {}, Name: {}, Phone: {}, Category: {}, Subject: {}", 
                        ticket.getUnitNumber(), 
                        ticket.getApartmentName(), 
                        ticket.getName(), 
                        ticket.getPhoneNumber(), 
                        ticket.getCategory(), 
                        ticket.getSubject());

            // Validation for required fields
            if (isBlank(ticket.getUnitNumber()) ||
                    isBlank(ticket.getApartmentName()) ||
                    isBlank(ticket.getName()) ||
                    isBlank(ticket.getPhoneNumber()) ||
                    ticket.getCategory() == null ||
                    isBlank(ticket.getSubject()) ||
                    isBlank(ticket.getBody()) ||
                    isBlank(ticket.getSubmittedAt())) {
                logger.error("Missing required fields - checking each field:");
                logger.error("  unitNumber blank: {}", isBlank(ticket.getUnitNumber()));
                logger.error("  apartmentName blank: {}", isBlank(ticket.getApartmentName()));
                logger.error("  name blank: {}", isBlank(ticket.getName()));
                logger.error("  phoneNumber blank: {}", isBlank(ticket.getPhoneNumber()));
                logger.error("  category null: {}", ticket.getCategory() == null);
                logger.error("  subject blank: {}", isBlank(ticket.getSubject()));
                logger.error("  body blank: {}", isBlank(ticket.getBody()));
                logger.error("  submittedAt blank: {}", isBlank(ticket.getSubmittedAt()));
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Missing required fields"));
            }

            // Default status if not provided
            if (ticket.getStatus() == null) {
                logger.debug("Status not provided, setting to PENDING");
                ticket.setStatus(Status.PENDING);
            }

            if (isBlank(ticket.getStatusUpdatedAt())) {
                logger.debug("StatusUpdatedAt not provided, using submittedAt");
                ticket.setStatusUpdatedAt(ticket.getSubmittedAt());
            }
            ticket.setStatusUpdatedBy(null);

            logger.info("=== CALLING REPOSITORY ADD ===");
            int id = ticketRepository.add(ticket);
            logger.info("=== TICKET CREATED SUCCESSFULLY - ID: {} ===", id);

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", id));

        } catch (ErrorException e) {
            logger.error("=== ErrorException caught in controller ===");
            logger.error("Message: {}", e.getMessage());
            logger.error("Stack trace:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            logger.error("=== Unexpected Exception caught in controller ===");
            logger.error("Type: {}", e.getClass().getName());
            logger.error("Message: {}", e.getMessage());
            logger.error("Stack trace:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An internal server error occurred: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        logger.debug("GET ticket by id: {}", id);
        int ticketId;
        try {
            ticketId = Integer.parseInt(id);
        } catch (NumberFormatException e) {
            logger.error("Invalid ticket ID format: {}", id);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid ticket ID"));
        }

        try {
            Ticket ticket = ticketRepository.findById(ticketId);
            if (ticket == null) {
                logger.warn("Ticket not found with id: {}", ticketId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Ticket not found"));
            }

            logger.debug("Successfully retrieved ticket: {}", ticketId);
            return ResponseEntity.ok(ticket);

        } catch (Exception e) {
            logger.error("Error fetching ticket by id: {}", ticketId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An internal server error occurred while fetching the ticket."));
        }
    }

    @GetMapping("")
    public ResponseEntity<?> getTickets(@RequestParam(required = false) String status) {
        logger.debug("GET tickets with status filter: {}", status);
        try {

            if (status == null || status.isBlank()) {
                logger.debug("Fetching all tickets");
                List<Ticket> tickets = ticketRepository.findAll();
                logger.debug("Retrieved {} tickets", tickets.size());
                return ResponseEntity.ok(tickets);
            }

            Status enumStatus;
            try {
                enumStatus = Status.valueOf(status.trim().toUpperCase().replace(" ", "_"));
            } catch (IllegalArgumentException ex) {
                logger.error("Invalid status value: {}", status);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error",
                                "Invalid status. Must be one of: Pending, In Progress, Resolved, Closed"));
            }

            logger.debug("Fetching tickets with status: {}", enumStatus);
            List<Ticket> tickets = ticketRepository.findByStatus(enumStatus);
            logger.debug("Retrieved {} tickets with status: {}", tickets.size(), enumStatus);
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            logger.error("Error fetching tickets", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Unexpected server error."));
        }
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody TicketStatusUpdateRequest payload) {
        logger.info("PATCH ticket status - id: {}", id);
        int ticketId;
        try {
            ticketId = Integer.parseInt(id);
        } catch (NumberFormatException e) {
            logger.error("Invalid ticket ID format: {}", id);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid ticket ID"));
        }

        if (payload == null) {
            logger.error("Request body is null");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Request body is required"));
        }

        String statusValue = payload.getStatus();
        if (isBlank(statusValue)) {
            logger.error("Status value is blank");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Status is required"));
        }

        Status statusEnum;
        try {
            statusEnum = Status.fromLabel(statusValue.trim());
        } catch (IllegalArgumentException ex) {
            logger.error("Invalid status value: {}", statusValue);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid status. Must be one of: Pending, In Progress, Resolved, Closed"));
        }

        String statusUpdatedAt = payload.getStatusUpdatedAt();
        if (isBlank(statusUpdatedAt)) {
            logger.error("StatusUpdatedAt is blank");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Status updated timestamp is required"));
        }
        try {
            Instant.parse(statusUpdatedAt.trim());
        } catch (Exception e) {
            logger.error("Invalid timestamp format: {}", statusUpdatedAt);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid timestamp format for statusUpdatedAt"));
        }

        String statusUpdatedBy = payload.getStatusUpdatedBy();
        if (isBlank(statusUpdatedBy)) {
            logger.error("StatusUpdatedBy is blank");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Status updated by is required"));
        }

        Ticket existingTicket;
        try {
            existingTicket = ticketRepository.findById(ticketId);
        } catch (Exception e) {
            logger.error("Error checking if ticket exists: {}", ticketId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An internal server error occurred while fetching the ticket."));
        }

        if (existingTicket == null) {
            logger.warn("Ticket not found for status update: {}", ticketId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Ticket not found"));
        }

        try {
            logger.debug("Updating ticket {} status to: {}", ticketId, statusEnum);
            int updatedRows = ticketRepository.updateStatus(ticketId, statusEnum, statusUpdatedAt.trim(),
                    statusUpdatedBy.trim());
            if (updatedRows == 0) {
                logger.warn("No rows updated for ticket: {}", ticketId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Ticket not found"));
            }
            Ticket updatedTicket = ticketRepository.findById(ticketId);
            logger.info("Successfully updated ticket {} status to: {}", ticketId, statusEnum);
            return ResponseEntity.ok(updatedTicket);
        } catch (ErrorException e) {
            logger.error("ErrorException updating ticket status: {}", ticketId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An internal server error occurred while updating the ticket status."));
        } catch (Exception e) {
            logger.error("Unexpected exception updating ticket status: {}", ticketId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An internal server error occurred while updating the ticket status."));
        }
    }
}