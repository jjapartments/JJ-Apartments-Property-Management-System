package com.jjapartments.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
ork.transaction.annotation.Transactional;
import org.springframework.stereotype.Repository;

import com.jjapartments.backend.models.Unit;
import com.jjapartments.backend.mappers.UnitRowMapper;
import com.jjapartments.backend.exception.ErrorException;

@Repository
public class UnitRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Transactional(readOnly = true)
    public List<Unit> findAll() {
        String sql = """
                    SELECT
                        u.id,
                        u.unit_number,
                        u.name,
                        u.description,
                        u.price,
                        u.num_occupants,
                        (CASE 
                            WHEN u.active_tenant_id IS NULL THEN 0
                            ELSE (
                                1 + (
                                    SELECT COUNT(*)
                                    FROM sub_tenants st
                                    WHERE st.main_tenant_id = u.active_tenant_id
                                )
                            )
                        END) AS curr_occupants
                        u.active_tenant_id
                    FROM units u
                    LEFT JOIN tenants t ON u.active_tenant_id = t.id
                """;

        return jdbcTemplate.query(sql, new UnitRowMapper());
    }

    // for creating
    public boolean unitExists(Unit unit) {
        String sqlChecker = "SELECT COUNT(*) FROM units WHERE unit_number = ? AND name = ?";
        Integer count = jdbcTemplate.queryForObject(sqlChecker, Integer.class, unit.getUnitNumber(), unit.getName());
        return count != null && count > 0;
    }

    // for updating
    public boolean unitExists(Unit unit, int excludeId) {
        String sqlChecker = "SELECT COUNT(*) FROM units WHERE unit_number = ? AND name = ? AND id != ?";
        Integer count = jdbcTemplate.queryForObject(sqlChecker, Integer.class, unit.getUnitNumber(), unit.getName(),
                excludeId);
        return count != null && count > 0;
    }

    public Unit add(Unit unit) {
        if (unitExists(unit)) {
            throw new ErrorException("The unit already exists.");
        } else {
            String sql = "INSERT INTO units(unit_number, name, description, price, num_occupants,active_tenant_id) VALUES (?, ?, ?, ?, ?, ?)";
            jdbcTemplate.update(sql, unit.getUnitNumber(), unit.getName(), unit.getDescription(), unit.getPrice(),
                    unit.getNumOccupants());

            String fetchSql = """
                        SELECT
                            u.id,
                            u.unit_number,
                            u.name,
                            u.description,
                            u.price,
                            u.num_occupants,
                            (CASE 
                                WHEN u.active_tenant_id IS NULL THEN 0
                                ELSE (
                                    1 + (
                                        SELECT COUNT(*)
                                        FROM sub_tenants st
                                        WHERE st.main_tenant_id = u.active_tenant_id
                                    )
                                )
                            END) AS curr_occupants
                            u.active_tenant_id
                        FROM units u
                        LEFT JOIN tenants t ON u.active_tenant_id = t.id
                        WHERE u.unit_number = ?
                            AND u.name = ?
                            AND u.description = ?
                            AND u.price = ?
                            AND u.num_occupants = ?
                        ORDER BY u.id DESC
                        LIMIT 1
                    """;
            return jdbcTemplate.queryForObject(
                    fetchSql,
                    new UnitRowMapper(),
                    unit.getUnitNumber(),
                    unit.getName(),
                    unit.getDescription(),
                    unit.getPrice(),
                    unit.getNumOccupants(),
                    unit.getActiveTenantId() > 0 ? unit.getActiveTenantId() : null 
            );    
        }
    }

    public int delete(int id) {
        String sql = "DELETE FROM units WHERE id = ?";
        return jdbcTemplate.update(sql, id);
    }

    public Unit findById(int id) {
        String sql = """
                    SELECT
                        u.id,
                        u.unit_number,
                        u.name,
                        u.description,
                        u.price,
                        u.num_occupants,
                    (CASE 
                        WHEN u.active_tenant_id IS NULL THEN 0
                        ELSE (
                            1 + (
                                SELECT COUNT(*)
                                FROM sub_tenants st
                                WHERE st.main_tenant_id = u.active_tenant_id
                            )
                        )
                    END) AS curr_occupants
                         u.active_tenant_id  
                    FROM units u
                    LEFT JOIN tenants t ON u.active_tenant_id = t.id
                    WHERE u.id = ?
                """;

        try {
            return jdbcTemplate.queryForObject(sql, new UnitRowMapper(), id);
        } catch (EmptyResultDataAccessException e) {
            throw new ErrorException("Unit with id " + id + " not found.");
        }
    }

    public int update(int id, Unit unit) {
        Unit existingUnit = findById(id);

        if (unitExists(unit, existingUnit.getId())) {
            throw new ErrorException("The unit already exists.");
        }
        String sql = "UPDATE units SET unit_number = ?, name = ?, description = ?, price = ?, num_occupants = ?, active_tenant_id = ? WHERE id = ?";
        return jdbcTemplate.update(sql, unit.getUnitNumber(), unit.getName(), unit.getDescription(), unit.getPrice(),
                unit.getNumOccupants(), id);
    }

    public List<Unit> searchByKeyword(String keyword) {
        String sql = """
                    SELECT
                        u.id,
                        u.unit_number,
                        u.name,
                        u.description,
                        u.price,
                        u.num_occupants,
                        (CASE 
                            WHEN u.active_tenant_id IS NULL THEN 0
                            ELSE (
                                1 + (
                                    SELECT COUNT(*)
                                    FROM sub_tenants st
                                    WHERE st.main_tenant_id = u.active_tenant_id
                                )
                            )
                        END) AS curr_occupants
                        u.active_tenant_id
                    FROM units u
                    LEFT JOIN tenants t ON u.active_tenant_id = t.id
                    WHERE LOWER(u.name) LIKE ?
                       OR LOWER(u.description) LIKE ?
                       OR LOWER(u.unit_number) LIKE ?
                """;

        String likeKeyword = "%" + keyword.toLowerCase() + "%";
        return jdbcTemplate.query(sql, new UnitRowMapper(), likeKeyword, likeKeyword, likeKeyword);
    }

    public Optional<Unit> findByNameAndUnitNumber(String name, String unitNumber) {
        String sql = """
                    SELECT
                        u.id,
                        u.unit_number,
                        u.name,
                        u.description,
                        u.price,
                        u.num_occupants,
                        (CASE 
                            WHEN u.active_tenant_id IS NULL THEN 0
                            ELSE (
                                1 + (
                                    SELECT COUNT(*)
                                    FROM sub_tenants st
                                    WHERE st.main_tenant_id = u.active_tenant_id
                                )
                            )
                        END) AS curr_occupants
                        u.active_tenant_id
                    FROM units u
                    LEFT JOIN tenants t ON u.active_tenant_id = t.id
                    WHERE u.name = ? AND u.unit_number = ?
                """;

        try {
            Unit unit = jdbcTemplate.queryForObject(sql, new UnitRowMapper(), name, unitNumber);
            return Optional.ofNullable(unit);
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return Optional.empty();
        } catch (Exception e) {
            System.err.println("Error finding unit by name and number: " + e.getMessage());
            return Optional.empty();
        }
    }
}
