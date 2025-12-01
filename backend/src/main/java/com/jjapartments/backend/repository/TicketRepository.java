package com.jjapartments.backend.repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.List;

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

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private boolean duplicateExists(Ticket ticket) {
        String sql = """
                SELECT COUNT(*) FROM tickets
                WHERE phone_number = ? AND subject = ? AND status = ?
                """;
        Integer count = jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                ticket.getPhoneNumber(),
                ticket.getSubject(),
                Status.PENDING.getLabel());
        return count != null && count > 0;
    }

    @Transactional
    public int add(Ticket ticket) {
        if (ticket == null) {
            throw new ErrorException("Ticket payload is required.");
        }
        if (duplicateExists(ticket)) {
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
                ps.setObject(13, null);
                return ps;
            }, keyHolder);
        } catch (DataAccessException e) {
            throw new ErrorException("Database error while creating ticket.");
        }

        Number key = keyHolder.getKey();
        if (key == null) {
            throw new ErrorException("Failed to retrieve generated ticket ID.");
        }
        return key.intValue();
    }

    @Transactional
    public int delete(int id) {
        try {
            return jdbcTemplate.update("DELETE FROM tickets WHERE id = ?", id);
        } catch (DataAccessException e) {
            throw new ErrorException("Database error while deleting ticket.");
        }
    }

    @Transactional(readOnly = true)
    public List<Ticket> findAll() {
        try {
            return jdbcTemplate.query("SELECT * FROM tickets ORDER BY submitted_at DESC", new TicketRowMapper());
        } catch (DataAccessException e) {
            throw new ErrorException("Database error while fetching tickets.");
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
            throw new ErrorException("Database error while fetching tickets by status.");
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
            throw new ErrorException("Database error while fetching ticket by id.");
        }
    }

    @Transactional
    public int updateStatus(int id, Status status, String statusUpdatedAt, String statusUpdatedBy) {
        if (status == null) {
            throw new ErrorException("Status is required.");
        }
        Timestamp statusUpdatedAtTs = toTimestamp(statusUpdatedAt, "statusUpdatedAt");
        String sql = "UPDATE tickets SET status = ?, status_updated_at = ?, status_updated_by = ? WHERE id = ?";
        try {
            return jdbcTemplate.update(sql, status.getLabel(), statusUpdatedAtTs, statusUpdatedBy, id);
        } catch (DataAccessException e) {
            throw new ErrorException("Database error while updating ticket status.");
        }
    }

    private Timestamp toTimestamp(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        try {
            return Timestamp.from(Instant.parse(value));
        } catch (DateTimeParseException e) {
            throw new ErrorException("Invalid timestamp format for " + fieldName + ".");
        }
    }
}
