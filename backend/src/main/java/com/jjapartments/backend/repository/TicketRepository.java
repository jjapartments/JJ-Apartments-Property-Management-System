package com.jjapartments.backend.repository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Repository;
import org.springframework.dao.EmptyResultDataAccessException;

import com.jjapartments.backend.models.Ticket;
import com.jjapartments.backend.mappers.TicketRowMapper;
import com.jjapartments.backend.exception.ErrorException;

@Repository
public class TicketRepository {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Transactional(readOnly = true)
    public List<Ticket> findAll() {
        String sql = "SELECT * FROM tickets ORDER BY submitted_at DESC";
        return jdbcTemplate.query(sql, new TicketRowMapper());
    }

    private boolean duplicateExists(Ticket ticket) {
        String sql = "SELECT COUNT(*) FROM tickets WHERE phone_number = ? AND subject = ? AND status = 'Pending'";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, ticket.getPhoneNumber(), ticket.getSubject());
        return count != null && count > 0;
    }

    public int add(Ticket ticket) {
        if (duplicateExists(ticket)) {
            throw new ErrorException("A pending ticket with the same phone number and subject already exists.");
        }

        String sql = "INSERT INTO tickets (unit_number, apartment_name, name, phone_number, email, messenger_link, category, subject, body, status, status_updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)";
        jdbcTemplate.update(
            sql,
            ticket.getUnitNumber(),
            ticket.getApartmentName(),
            ticket.getName(),
            ticket.getPhoneNumber(),
            ticket.getEmail(),
            ticket.getMessengerLink(),
            ticket.getCategory(),
            ticket.getSubject(),
            ticket.getBody(),
            ticket.getStatus() == null ? "Pending" : ticket.getStatus()
        );

        String fetchSql = "SELECT * FROM tickets WHERE unit_number = ? AND apartment_name = ? AND name = ? AND phone_number = ? ORDER BY id DESC LIMIT 1";
        Ticket createdTicket = jdbcTemplate.queryForObject(
            fetchSql,
            new TicketRowMapper(),
            ticket.getUnitNumber(),
            ticket.getApartmentName(),
            ticket.getName(),
            ticket.getPhoneNumber()
        );

        return createdTicket.getId();
    }


    public int delete(int id) {
        String sql = "DELETE FROM tickets WHERE id = ?";
        return jdbcTemplate.update(sql, id);
    }

    public Ticket findById(int id) {
        String sql = "SELECT * FROM tickets WHERE id = ?";
        try {
            return jdbcTemplate.queryForObject(sql, new TicketRowMapper(), id);
        } catch (EmptyResultDataAccessException e) {
            return null; 
        } catch (Exception e) {
            throw new ErrorException("An error occurred while retrieving the ticket: " + e.getMessage());
        }
    }

    public int updateStatus(int id, String status, String statusUpdatedAt, String statusUpdatedBy) {
        Ticket existingTicket = findById(id);
        if (existingTicket == null) {
            throw new ErrorException("Ticket with ID " + id + " not found.");
        }

        String sql = "UPDATE tickets SET status = ?, status_updated_at = ?, status_updated_by = ? WHERE id = ?";
        return jdbcTemplate.update(sql, status, statusUpdatedAt, statusUpdatedBy, id);
    }

    @Transactional(readOnly = true)
    public List<Ticket> findByStatus(String status) {
        String sql = "SELECT * FROM tickets WHERE status = ? ORDER BY submitted_at DESC";
        return jdbcTemplate.query(sql, new TicketRowMapper(), status);
    }
}
