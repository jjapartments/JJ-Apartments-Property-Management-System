package com.jjapartments.backend.repository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Repository;

import com.jjapartments.backend.models.Tenant;
import com.jjapartments.backend.exception.ErrorException;
import com.jjapartments.backend.mappers.TenantRowMapper;

@Repository
public class TenantRepository {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Transactional(readOnly = true)
    public List<Tenant> findAll() {
        String sql = "SELECT * FROM tenants";
        return jdbcTemplate.query(sql, new TenantRowMapper());
    }

    @Transactional(readOnly = true)
    public List<Tenant> findByUnitId(int unitId) {
        String sql = "SELECT * FROM tenants WHERE units_id = ?";
        return jdbcTemplate.query(sql, new TenantRowMapper(), unitId);
    }

    // Method to update unit occupant count based on actual tenant count
    private void updateUnitOccupantCount(int unitId) {
        String countSql = "SELECT COUNT(*) FROM tenants WHERE units_id = ?";
        Integer tenantCount = jdbcTemplate.queryForObject(countSql, Integer.class, unitId);

        String updateSql = "UPDATE units SET num_occupants = ? WHERE id = ?";
        jdbcTemplate.update(updateSql, tenantCount != null ? tenantCount : 0, unitId);
    }

    // for creating
    public String duplicateExists(Tenant tenant) {
        String sqlChecker = "SELECT COUNT(*) FROM tenants WHERE email = ?";
        Integer count = jdbcTemplate.queryForObject(sqlChecker, Integer.class, tenant.getEmail());
        if (count != null && count > 0) {
            return "email";
        }
        String sqlChecker2 = "SELECT COUNT(*) FROM tenants WHERE phone_number = ?";
        Integer count2 = jdbcTemplate.queryForObject(sqlChecker2, Integer.class, tenant.getPhoneNumber());
        if (count2 != null && count2 > 0) {
            return "phone";
        }

        return null;
    }

    // for updating
    public String duplicateExists(Tenant tenant, int excludeId) {
        String sqlChecker = "SELECT COUNT(*) FROM tenants WHERE email = ? AND id != ?";
        Integer count = jdbcTemplate.queryForObject(sqlChecker, Integer.class, tenant.getEmail(), excludeId);
        if (count != null && count > 0) {
            return "email";
        }
        String sqlChecker2 = "SELECT COUNT(*) FROM tenants WHERE phone_number = ? AND id != ?";
        Integer count2 = jdbcTemplate.queryForObject(sqlChecker2, Integer.class, tenant.getPhoneNumber(), excludeId);
        if (count2 != null && count2 > 0) {
            return "phone";
        }

        return null;
    }

    public Tenant add(Tenant tenant) {
        String duplicateField = duplicateExists(tenant);
        if (duplicateField != null) {
            switch (duplicateField) {
                case "email":
                    throw new ErrorException("The email is already taken.");
                case "phone":
                    throw new ErrorException("The phone number is already taken.");
                default:
                    throw new ErrorException("The tenant is already registered.");

            }
        }
        String sql = "INSERT INTO tenants(last_name, first_name, middle_initial, email, phone_number, messenger_link, units_id, move_in_date, move_out_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql, tenant.getLastName(), tenant.getFirstName(), tenant.getMiddleInitial(),
                tenant.getEmail(), tenant.getPhoneNumber(), tenant.getMessengerLink(), tenant.getUnitId(),
                tenant.getMoveInDate(), tenant.getMoveOutDate());

        // Update unit occupant count after adding tenant
        updateUnitOccupantCount(tenant.getUnitId());

        String fetchSql = """
                    SELECT * FROM tenants
                    WHERE last_name = ?
                    AND first_name = ?
                    AND middle_initial = ?
                    AND email = ?
                    AND phone_number = ?
                    AND messenger_link <=> ?
                    AND units_id = ?
                    AND move_in_date <=> ?
                    AND move_out_date <=> ?
                    ORDER BY id DESC
                    LIMIT 1
                """;

        return jdbcTemplate.queryForObject(
                fetchSql,
                new TenantRowMapper(),
                tenant.getLastName(),
                tenant.getFirstName(),
                tenant.getMiddleInitial(),
                tenant.getEmail(),
                tenant.getPhoneNumber(),
                tenant.getMessengerLink(),
                tenant.getUnitId(),
                tenant.getMoveInDate(),
                tenant.getMoveOutDate());
    }

    public int delete(int id) {
        // Get the unit ID before deleting the tenant
        Tenant tenant = findById(id);
        int unitId = tenant.getUnitId();

        String sql = "DELETE FROM tenants WHERE id = ?";
        int result = jdbcTemplate.update(sql, id);

        // Update unit occupant count after deleting tenant
        if (result > 0) {
            updateUnitOccupantCount(unitId);
        }

        return result;
    }

    public Tenant findById(int id) {
        String sql = "SELECT * FROM tenants WHERE id = ?";
        try {
            return jdbcTemplate.queryForObject(sql, new TenantRowMapper(), id);
        } catch (EmptyResultDataAccessException e) {
            throw new ErrorException("Tenant with id " + id + " not found.");
        }
    }

    public int update(int id, Tenant tenant) {
        Tenant existingTenant = findById(id);
        int oldUnitId = existingTenant.getUnitId();
        int newUnitId = tenant.getUnitId();

        String duplicateField = duplicateExists(tenant, existingTenant.getId());
        if (duplicateField != null) {
            switch (duplicateField) {
                case "email":
                    throw new ErrorException("The email is already taken.");
                case "phone":
                    throw new ErrorException("The phone number is already taken.");
                default:
                    throw new ErrorException("The tenant is already registered.");

            }
        }
        String sql = "UPDATE tenants SET last_name = ?, first_name = ?, middle_initial = ?, email = ?, phone_number = ?, messenger_link = ?, units_id = ?, move_in_date = ?, move_out_date = ? WHERE id = ?";
        int result = jdbcTemplate.update(sql, tenant.getLastName(), tenant.getFirstName(), tenant.getMiddleInitial(),
                tenant.getEmail(), tenant.getPhoneNumber(), tenant.getMessengerLink(), tenant.getUnitId(),
                tenant.getMoveInDate(), tenant.getMoveOutDate(), id);

        // Update occupant counts for both old and new units if tenant moved
        if (result > 0) {
            if (oldUnitId != newUnitId) {
                // Update both old and new unit occupant counts
                updateUnitOccupantCount(oldUnitId);
                updateUnitOccupantCount(newUnitId);
            } else {
                // Update current unit occupant count
                updateUnitOccupantCount(newUnitId);
            }
        }

        return result;
    }
}