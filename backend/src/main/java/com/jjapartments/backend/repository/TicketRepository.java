package com.jjapartments.backend.repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.jjapartments.backend.exception.ErrorException;
import com.jjapartments.backend.mappers.TicketRowMapper;
import com.jjapartments.backend.models.Status;
import com.jjapartments.backend.models.Ticket;

@Repository
public class TicketRepository {

    private static final Logger logger = LoggerFactory.getLogger(TicketRepository.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private boolean duplicateExists(Ticket ticket) {
        String sql = """
                SELECT COUNT(*) FROM tickets
                WHERE phone_number = ? AND subject = ? AND status = ?
                """;
        try {
            Integer count = jdbcTemplate.queryForObject(
                    sql,
                    Integer.class,
                    ticket.getPhoneNumber(),
                    ticket.getSubject(),
                    Status.PENDING.getLabel());
            return count != null && count > 0;
        } catch (DataAccessException e) {
            logger.error("Error checking for duplicate ticket", e);
            throw new ErrorException("Database error while checking for duplicate ticket: " + e.getMessage());
        }
    }

    @Transactional
    public int add(Ticket ticket) {
        if (ticket == null) {
            logger.error("Ticket payload is null");
            throw new ErrorException("Ticket payload is required.");
        }

        if (duplicateExists(ticket)) {
            logger.warn("Duplicate ticket detected - subject: {}", ticket.getSubject());
            throw new ErrorException("A pending ticket with the same phone number and subject already exists.");
        }

        String sql = """
                INSERT INTO tickets (
                    unit_number,
                    apartment_name,
                    name,
                    phone_number,
                    email,
                    messenger_link,
                    category,
                    subject,
                    body,
                    status,
                    submitted_at,
                    status_updated_at,
                    status_updated_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;

        String categoryLabel = ticket.getCategory() != null ? ticket.getCategory().getLabel() : null;
        String statusLabel = ticket.getStatus() != null ? ticket.getStatus().getLabel() : Status.PENDING.getLabel();

        Timestamp submittedAt = toTimestamp(ticket.getSubmittedAt(), "submittedAt");
        final Timestamp statusUpdatedAt = toTimestamp(ticket.getStatusUpdatedAt(), "statusUpdatedAt");
        final Timestamp resolvedStatusUpdatedAt = statusUpdatedAt != null ? statusUpdatedAt : submittedAt;

        KeyHolder keyHolder = new GeneratedKeyHolder();
        try {
            jdbcTemplate.update(con -> {
                PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
                ps.setString(1, ticket.getUnitNumber());
                ps.setString(2, ticket.getApartmentName());
                ps.setString(3, ticket.getName());
                ps.setString(4, ticket.getPhoneNumber());
                ps.setString(5, ticket.getEmail());
                ps.setString(6, ticket.getMessengerLink());
                ps.setString(7, categoryLabel);
                ps.setString(8, ticket.getSubject());
                ps.setString(9, ticket.getBody());
                ps.setString(10, statusLabel);
                ps.setTimestamp(11, submittedAt);
                ps.setTimestamp(12, resolvedStatusUpdatedAt);
                ps.setString(13, "SYSTEM");
                return ps;
            }, keyHolder);

        } catch (DataAccessException e) {
            logger.error("Database error while creating ticket - Error: {}", e.getMessage());
            throw new ErrorException("Database error while creating ticket: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error while creating ticket - Type: {}, Message: {}",
                    e.getClass().getName(), e.getMessage());
            throw new ErrorException("Unexpected error while creating ticket: " + e.getMessage());
        }

        Number key = keyHolder.getKey();
        if (key == null) {
            logger.error("Generated key is null after insert");
            throw new ErrorException("Failed to retrieve generated ticket ID.");
        }

        int generatedId = key.intValue();
        logger.info("Ticket created successfully - ID: {}", generatedId);
        return generatedId;
    }

    @Transactional
    public int delete(int id) {
        try {
            int rowsAffected = jdbcTemplate.update("DELETE FROM tickets WHERE id = ?", id);
            logger.info("Ticket deleted - ID: {}", id);
            return rowsAffected;
        } catch (DataAccessException e) {
            logger.error("Error deleting ticket id: {}", id, e);
            throw new ErrorException("Database error while deleting ticket: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<Ticket> findAll() {
        try {
            return jdbcTemplate.query("SELECT * FROM tickets ORDER BY submitted_at DESC",
                    new TicketRowMapper());
        } catch (DataAccessException e) {
            logger.error("Error fetching all tickets", e);
            throw new ErrorException("Database error while fetching tickets: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<Ticket> findByStatus(Status status) {
        if (status == null) {
            return findAll();
        }
        String sql = "SELECT * FROM tickets WHERE status = ? ORDER BY submitted_at DESC";
        try {
            return jdbcTemplate.query(sql, new TicketRowMapper(), status.getLabel());
        } catch (DataAccessException e) {
            logger.error("Error fetching tickets by status: {}", status, e);
            throw new ErrorException("Database error while fetching tickets by status: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Ticket findById(int id) {
        String sql = "SELECT * FROM tickets WHERE id = ?";
        try {
            return jdbcTemplate.queryForObject(sql, new TicketRowMapper(), id);
        } catch (EmptyResultDataAccessException e) {
            return null;
        } catch (DataAccessException e) {
            logger.error("Error fetching ticket by id: {}", id, e);
            throw new ErrorException("Database error while fetching ticket by id: " + e.getMessage());
        }
    }

    @Transactional
    public int updateStatus(int id, Status status, String statusUpdatedAt, String statusUpdatedBy) {
        if (status == null) {
            logger.error("Status is null");
            throw new ErrorException("Status is required.");
        }
        Timestamp statusUpdatedAtTs = toTimestamp(statusUpdatedAt, "statusUpdatedAt");
        String sql = "UPDATE tickets SET status = ?, status_updated_at = ?, status_updated_by = ? WHERE id = ?";
        try {
            int rowsAffected = jdbcTemplate.update(sql, status.getLabel(), statusUpdatedAtTs, statusUpdatedBy, id);
            logger.info("Ticket status updated - ID: {}, Status: {}", id, status);
            return rowsAffected;
        } catch (DataAccessException e) {
            logger.error("Error updating ticket status for id: {}", id, e);
            throw new ErrorException("Database error while updating ticket status: " + e.getMessage());
        }
    }

    private Timestamp toTimestamp(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        try {
            return Timestamp.from(Instant.parse(value));
        } catch (DateTimeParseException e) {
            logger.error("Invalid timestamp format for {}: {}", fieldName, value);
            throw new ErrorException("Invalid timestamp format for " + fieldName + ": " + value);
        }
    }
}