package com.jjapartments.backend.mappers;
import org.springframework.jdbc.core.RowMapper;

import com.jjapartments.backend.models.SubTenant;
import org.springframework.lang.NonNull;

import java.sql.ResultSet;
import java.sql.SQLException;

public class SubTenantRowMapper implements RowMapper<SubTenant> {
    @Override
    public SubTenant mapRow(@NonNull ResultSet rs, int rowNum) throws SQLException {
        SubTenant subTenant = new SubTenant();
        subTenant.setId(rs.getInt("id"));
        subTenant.setLastName(rs.getString("last_name"));
        subTenant.setFirstName(rs.getString("first_name"));
        subTenant.setMiddleInitial(rs.getString("middle_initial"));
        subTenant.setPhoneNumber(rs.getString("phone_number"));
        subTenant.setMessengerLink(rs.getString("messenger_link"));
        subTenant.setMainTenantId(rs.getInt("main_tenant_id"));
        return subTenant;
    }
}