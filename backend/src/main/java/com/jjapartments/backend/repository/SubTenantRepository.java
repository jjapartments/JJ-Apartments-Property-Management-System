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

    // for creating
    public String duplicateExists(SubTenant subTenant) {
        String sqlChecker = "SELECT COUNT(*) FROM sub_tenants WHERE phone_number = ?";
        Integer count = jdbcTemplate.queryForObject(sqlChecker, Integer.class, subTenant.getPhoneNumber());
        if (count != null && count > 0) {
            return "phone";
        }

        if (subTenant.getMessengerLink() != null && !subTenant.getMessengerLink().isEmpty()) {
            String sqlChecker2 = "SELECT COUNT(*) FROM sub_tenants WHERE messenger_link = ?";
            Integer count2 = jdbcTemplate.queryForObject(sqlChecker2, Integer.class, subTenant.getMessengerLink());
            if (count2 != null && count2 > 0) {
                return "messenger";
            }
        }

        return null;
    }

    // for updating
    public String duplicateExists(SubTenant subTenant, int excludeId) {
        String sqlChecker = "SELECT COUNT(*) FROM sub_tenants WHERE phone_number = ? AND id != ?";
        Integer count = jdbcTemplate.queryForObject(sqlChecker, Integer.class, subTenant.getPhoneNumber(), excludeId);
        if (count != null && count > 0) {
            return "phone";
        }

        if (subTenant.getMessengerLink() != null && !subTenant.getMessengerLink().isEmpty()) {
            String sqlChecker2 = "SELECT COUNT(*) FROM sub_tenants WHERE messenger_link = ? AND id != ?";
            Integer count2 = jdbcTemplate.queryForObject(sqlChecker2, Integer.class, subTenant.getMessengerLink(), excludeId);
            if (count2 != null && count2 > 0) {
                return "messenger";
            }
        }

        return null;
    }

    public SubTenant add(SubTenant subTenant) {
        String duplicateField = duplicateExists(subTenant);
        if (duplicateField != null) {
            switch (duplicateField) {
                case "phone":
                    throw new ErrorException("The phone number is already taken.");
                case "messenger":
                    throw new ErrorException("The messenger link is already taken.");
                default:
                    throw new ErrorException("The sub-tenant is already registered.");
            }
        }

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
            subTenant.getMainTenantId()
        );
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
        SubTenant existingSubTenant = findById(id);

        String duplicateField = duplicateExists(subTenant, existingSubTenant.getId());
        if (duplicateField != null) {
            switch (duplicateField) {
                case "phone":
                    throw new ErrorException("The phone number is already taken.");
                case "messenger":
                    throw new ErrorException("The messenger link is already taken.");
                default:
                    throw new ErrorException("The sub-tenant is already registered.");
            }
        }

        String sql = "UPDATE sub_tenants SET last_name = ?, first_name = ?, middle_initial = ?, phone_number = ?, messenger_link = ?, main_tenant_id = ? WHERE id = ?";
        return jdbcTemplate.update(sql, subTenant.getLastName(), subTenant.getFirstName(), subTenant.getMiddleInitial(), 
                                  subTenant.getPhoneNumber(), subTenant.getMessengerLink(), subTenant.getMainTenantId(), id);
    }

    @Transactional(readOnly = true)
    public List<SubTenant> findByMainTenantId(int mainTenantId) {
        String sql = "SELECT * FROM sub_tenants WHERE main_tenant_id = ?";
        return jdbcTemplate.query(sql, new SubTenantRowMapper(), mainTenantId);
    }
}