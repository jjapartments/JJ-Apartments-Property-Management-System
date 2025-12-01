package com.jjapartments.backend.repository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Repository;

import com.jjapartments.backend.models.SubTenant;
import com.jjapartments.backend.exception.ErrorException;
import com.jjapartments.backend.mappers.SubTenantRowMapper;

@Repository
public class SubTenantRepository {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Transactional(readOnly = true)
    public List<SubTenant> findAll() {
        String sql = "SELECT * FROM sub_tenants";
        return jdbcTemplate.query(sql, new SubTenantRowMapper());
    }

    public SubTenant add(SubTenant subTenant) {
        String sql = "INSERT INTO sub_tenants(last_name, first_name, middle_initial, phone_number, messenger_link, main_tenant_id) VALUES (?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql, subTenant.getLastName(), subTenant.getFirstName(), subTenant.getMiddleInitial(),
                subTenant.getPhoneNumber(), subTenant.getMessengerLink(), subTenant.getMainTenantId());

        String fetchSql = """
                    SELECT * FROM sub_tenants
                    WHERE last_name = ?
                    AND first_name = ?
                    AND middle_initial <=> ?
                    AND phone_number = ?
                    AND messenger_link <=> ?
                    AND main_tenant_id = ?
                    ORDER BY id DESC
                    LIMIT 1
                """;

        return jdbcTemplate.queryForObject(
                fetchSql,
                new SubTenantRowMapper(),
                subTenant.getLastName(),
                subTenant.getFirstName(),
                subTenant.getMiddleInitial(),
                subTenant.getPhoneNumber(),
                subTenant.getMessengerLink(),
                subTenant.getMainTenantId());
    }

    public int delete(int id) {
        String sql = "DELETE FROM sub_tenants WHERE id = ?";
        return jdbcTemplate.update(sql, id);
    }

    public SubTenant findById(int id) {
        String sql = "SELECT * FROM sub_tenants WHERE id = ?";
        try {
            return jdbcTemplate.queryForObject(sql, new SubTenantRowMapper(), id);
        } catch (EmptyResultDataAccessException e) {
            throw new ErrorException("Sub-tenant with id " + id + " not found.");
        }
    }

    public int update(int id, SubTenant subTenant) {
        String sql = "UPDATE sub_tenants SET last_name = ?, first_name = ?, middle_initial = ?, phone_number = ?, messenger_link = ?, main_tenant_id = ? WHERE id = ?";
        return jdbcTemplate.update(sql, subTenant.getLastName(), subTenant.getFirstName(), subTenant.getMiddleInitial(),
                subTenant.getPhoneNumber(), subTenant.getMessengerLink(), subTenant.getMainTenantId(), id);
    }

    @Transactional(readOnly = true)
    public List<SubTenant> findByMainTenantId(int mainTenantId) {
        String sql = "SELECT * FROM sub_tenants WHERE main_tenant_id = ?";
        return jdbcTemplate.query(sql, new SubTenantRowMapper(), mainTenantId);
    }

    @Transactional(readOnly = true)
    public List<SubTenant> findByUnitId(int unitId) {
        String sql = """
                    SELECT st.*
                    FROM sub_tenants st
                    INNER JOIN tenants t ON st.main_tenant_id = t.id
                    WHERE t.units_id = ?
                """;
        return jdbcTemplate.query(sql, new SubTenantRowMapper(), unitId);
    }
}