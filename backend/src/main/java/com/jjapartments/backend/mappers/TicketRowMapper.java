package com.jjapartments.backend.mappers;

import org.springframework.jdbc.core.RowMapper;
import com.jjapartments.backend.models.Ticket;
import com.jjapartments.backend.models.Category;
import com.jjapartments.backend.models.Status;
import org.springframework.lang.NonNull;
import java.sql.ResultSet;
import java.sql.SQLException;

public class TicketRowMapper implements RowMapper<Ticket> {
    @Override
    public Ticket mapRow(@NonNull ResultSet rs, int rowNum) throws SQLException {
        Ticket ticket = new Ticket();
        ticket.setId(rs.getInt("id"));
        ticket.setUnitNumber(rs.getString("unit_number"));
        ticket.setApartmentName(rs.getString("apartment_name"));
        ticket.setName(rs.getString("name"));
        ticket.setPhoneNumber(rs.getString("phone_number"));
        ticket.setEmail(rs.getString("email"));
        ticket.setMessengerLink(rs.getString("messenger_link"));
        ticket.setCategory(rs.getString("category"));
        ticket.setSubject(rs.getString("subject"));
        ticket.setBody(rs.getString("body"));
        ticket.setStatus(rs.getString("status"));
        ticket.setSubmittedAt(rs.getString("submitted_at"));
        ticket.setStatusUpdatedAt(rs.getString("status_updated_at"));
        ticket.setStatusUpdatedBy(rs.getString("status_updated_by"));
        return ticket;
    }
}