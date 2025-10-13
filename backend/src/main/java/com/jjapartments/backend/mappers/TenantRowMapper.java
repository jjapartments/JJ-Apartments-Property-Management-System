package com.jjapartments.backend.mappers;

import org.springframework.jdbc.core.RowMapper;

import com.jjapartments.backend.models.Tenant;
import org.springframework.lang.NonNull;

import java.sql.ResultSet;
import java.sql.SQLException;

public class TenantRowMapper implements RowMapper<Tenant> {
    @Override
    public Tenant mapRow(@NonNull ResultSet rs, int rowNum) throws SQLException {
        Tenant tenant = new Tenant();
        tenant.setId(rs.getInt("id"));
        tenant.setLastName(rs.getString("last_name"));
        tenant.setFirstName(rs.getString("first_name"));
        tenant.setMiddleInitial(rs.getString("middle_initial"));
        tenant.setEmail(rs.getString("email"));
        tenant.setPhoneNumber(rs.getString("phone_number"));
        tenant.setMessengerLink(rs.getString("messenger_link"));
        tenant.setUnitId(rs.getInt("units_id"));
        tenant.setMoveInDate(rs.getString("move_in_date"));
        tenant.setMoveOutDate(rs.getString("move_out_date"));
        return tenant;
    }
}
