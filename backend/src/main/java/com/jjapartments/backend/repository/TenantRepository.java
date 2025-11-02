package com.jjapartments.backend.repository;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
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
        String sql = "SELECT * FROM tenants ORDER BY move_in_date IS NULL, move_in_date DESC, id DESC";
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

    // check if unit ID exists in database
    public boolean unitExists(int unitId) {
        String sql = "SELECT COUNT(*) FROM units WHERE id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, unitId);
        return count != null && count > 0;
    }

    // check if unit is vacant (no active tenant)
    public boolean isUnitVacant(int unitId) {
        String sql = "SELECT active_tenant_id FROM units WHERE id = ?";
        try {
            Integer activeTenantId = jdbcTemplate.queryForObject(sql, Integer.class, unitId);
            return activeTenantId == null;
        } catch (EmptyResultDataAccessException e) {
            throw new ErrorException("Unit with id " + unitId + " not found.");
        }
    }

    // update unit's active tenant
    private void setActiveTenantonUnit(int unitId, Integer tenantId) {
        String sql = "UPDATE units SET active_tenant_id = ? WHERE id = ?";
        jdbcTemplate.update(sql, tenantId, unitId);
    }

    // validate ISO 8601 date format (YYYY-MM-DD)
    private void validateMoveInDate(String moveInDate) {
        if (moveInDate == null) {
            throw new ErrorException("Move-in date is required.");
        }
        
        String trimmedDate = moveInDate.trim();
        if (trimmedDate.isEmpty()) {
            throw new ErrorException("Move-in date is required.");
        }
        
        try {
            // parse as ISO 8601 DATE string (YYYY-MM-DD)
            LocalDate.parse(trimmedDate, DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (DateTimeParseException e) {
            throw new ErrorException("Invalid move-in date format. Expected ISO 8601 date format (e.g., 2025-10-31).");
        }
    }

    // validate required tenant fields
    private void validateTenantFields(Tenant tenant) {
        if (tenant.getLastName() == null || tenant.getLastName().trim().isEmpty()) {
            throw new ErrorException("Last name is required.");
        }
        if (tenant.getFirstName() == null || tenant.getFirstName().trim().isEmpty()) {
            throw new ErrorException("First name is required.");
        }
        if (tenant.getEmail() == null || tenant.getEmail().trim().isEmpty()) {
            throw new ErrorException("Email is required.");
        }
        if (tenant.getPhoneNumber() == null || tenant.getPhoneNumber().trim().isEmpty()) {
            throw new ErrorException("Phone number is required.");
        }
        if (tenant.getUnitId() <= 0) {
            throw new ErrorException("Valid unit ID is required.");
        }
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

    @Transactional
    public Tenant add(Tenant tenant) {
        validateMoveInDate(tenant.getMoveInDate());
        validateTenantFields(tenant);

        tenant.setMoveOutDate(null);

        if (!unitExists(tenant.getUnitId())) {
            throw new ErrorException("Unit not found.");
        }       
        if (!isUnitVacant(tenant.getUnitId())) {
            throw new ErrorException("Unit is already occupied.");
        }

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
                tenant.getMoveInDate(), null);

        String fetchSql = """
                    SELECT * FROM tenants
                    WHERE last_name = ?
                    AND first_name = ?
                    AND middle_initial <=> ?
                    AND email = ?
                    AND phone_number = ?
                    AND messenger_link <=> ?
                    AND units_id = ?
                    AND move_in_date <=> ?
                    AND move_out_date IS NULL
                    ORDER BY id DESC
                    LIMIT 1
                """;

        Tenant createdTenant = jdbcTemplate.queryForObject(
                fetchSql,
                new TenantRowMapper(),
                tenant.getLastName(),
                tenant.getFirstName(),
                tenant.getMiddleInitial(),
                tenant.getEmail(),
                tenant.getPhoneNumber(),
                tenant.getMessengerLink(),
                tenant.getUnitId(),
                tenant.getMoveInDate());

        if (createdTenant == null) {
            throw new ErrorException("Failed to create tenant record.");
        }

        setActiveTenantonUnit(tenant.getUnitId(), createdTenant.getId());
        updateUnitOccupantCount(tenant.getUnitId());

        return createdTenant;
    }

    @Transactional
    public int delete(int id) {
        // Get the unit ID before deleting the tenant
        Tenant tenant = findById(id);
        int unitId = tenant.getUnitId();

        String sql = "DELETE FROM tenants WHERE id = ?";
        int result = jdbcTemplate.update(sql, id);

        // Update unit occupant count after deleting tenant
        if (result > 0) {
            updateUnitOccupantCount(unitId);

            // if this was an active tenant, clear active_tenant_id
            String checkActiveSql = "SELECT active_tenant_id FROM units WHERE id = ?";
            Integer activeTenantId = jdbcTemplate.queryForObject(checkActiveSql, Integer.class, unitId);
            if (activeTenantId != null && activeTenantId == id) {
                setActiveTenantonUnit(unitId, null);
            }
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

    @Transactional
    public int update(int id, Tenant tenant) {
        Tenant existingTenant = findById(id);
        int oldUnitId = existingTenant.getUnitId();
        int newUnitId = tenant.getUnitId();

        if (oldUnitId != newUnitId) {
            if (!unitExists(newUnitId)) {
                throw new ErrorException("Unit not found.");
            }
            
            // check if new unit is vacant
            if (!isUnitVacant(newUnitId)) {
                throw new ErrorException("Unit is already occupied.");
            }
        }

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
                // Clear active_tenant_id from old unit
                setActiveTenantonUnit(oldUnitId, null);
                // Set active_tenant_id on new unit
                setActiveTenantonUnit(newUnitId, id);
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