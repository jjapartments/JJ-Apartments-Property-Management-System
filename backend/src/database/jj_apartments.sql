-- Create and use database
CREATE SCHEMA IF NOT EXISTS `jj_apartments` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `jj_apartments` ;


-- Disable checks temporarily (for safe table creation with foreign keys)
SET @OLD_UNIQUE_CHECKS = @@UNIQUE_CHECKS, UNIQUE_CHECKS = 0;
SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS = 0;
SET @OLD_SQL_MODE = @@SQL_MODE, SQL_MODE = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -------------------------
-- Table: users
-- -------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(45) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE INDEX username_UNIQUE (username ASC)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table: units
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jj_apartments`.`units` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `unit_number` VARCHAR(12) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(100) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `num_occupants` INT NOT NULL,
  `active_tenant_id` INT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

-- Insert units without active_tenant_id first
INSERT INTO units (unit_number, name, description, price, num_occupants, active_tenant_id)
VALUES 
('A', 'Maple Residences', 'Studio Apartment', 12000.00, 1, NULL),
('B', 'Maple Residences', '1 Bedroom', 15000.00, 2, NULL),
('C', 'Palm Grove Towers', '2 Bedroom', 18000.00, 3, NULL),
('D', 'Palm Grove Towers', 'Studio Apartment', 12500.00, 1, NULL),
('E', 'Sunrise Villas', '1 Bedroom', 15500.00, 2, NULL),
('F', 'Sunrise Villas', '2 Bedroom', 16500.00, 3, NULL),
('G', 'Sunrise Villas', 'Studio Apartment', 13000.00, 1, NULL),
('H', 'Palm Grove Towers', '3 Bedroom', 20000.00, 4, NULL),
('I', 'Palm Grove Towers', '1 Bedroom', 15000.00, 2, NULL),
('J', 'Palm Grove Towers', 'Penthouse', 30000.00, 5, NULL),
('K', 'Maple Residences', '3 Bedroom', 22000.00, 4, NULL),
('L', 'Maple Residences', '1 Bedroom', 15500.00, 2, NULL),
('M', 'Sunrise Villas', '2 Bedroom', 17000.00, 3, NULL),
('N', 'Sunrise Villas', '3 Bedroom', 19000.00, 4, NULL),
('O', 'Palm Grove Towers', 'Studio Apartment', 14000.00, 1, NULL),
('P', 'Palm Grove Towers', '1 Bedroom', 16000.00, 2, NULL),
('Q', 'Maple Residences', 'Penthouse', 28000.00, 5, NULL),
('R', 'Sunrise Villas', '1 Bedroom', 15500.00, 2, NULL),
('S', 'Palm Grove Towers', 'Studio Apartment', 13500.00, 1, NULL);

-- -------------------------
-- Table: tenants
-- -------------------------
CREATE TABLE IF NOT EXISTS `jj_apartments`.`tenants` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `last_name` VARCHAR(45) NOT NULL,
  `first_name` VARCHAR(45) NOT NULL,
  `middle_initial` VARCHAR(1) NULL DEFAULT NULL,
  `email` VARCHAR(45) NOT NULL,
  `phone_number` VARCHAR(15) NOT NULL,
  `messenger_link` VARCHAR(512) NULL,
  `units_id` INT NOT NULL,
  `move_in_date` DATE NULL,
  `move_out_date` DATE NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE,
  UNIQUE INDEX `phone_number_UNIQUE` (`phone_number` ASC) VISIBLE,
  INDEX `fk_tenants_units1_idx` (`units_id` ASC) VISIBLE,
  CONSTRAINT `fk_tenants_units1`
    FOREIGN KEY (`units_id`)
    REFERENCES `jj_apartments`.`units` (`id`)
    ON DELETE CASCADE
) ENGINE = InnoDB;

INSERT INTO `jj_apartments`.`tenants` 
(`last_name`, `first_name`, `middle_initial`, `email`, `phone_number`, `messenger_link`, `units_id`) 
VALUES
('Dela Cruz', 'Juan', 'R', 'juan.delacruz@example.com', '09171234567', 'https://m.me/juan.delacruz', 1),
('Santos', 'Maria', 'L', 'maria.santos@example.com', '09181234567', 'https://facebook.com/maria.santos', 3),
('Reyes', 'Carlos', 'T', 'carlos.reyes@example.com', '09192234567', 'https://m.me/carlos.reyes', 5),
('Cruz', 'Angela', 'M', 'angela.cruz@example.com', '09201234567', 'https://facebook.com/angela.cruz', 7),
('Gomez', 'Joseph', 'P', 'joseph.gomez@example.com', '09211234567', 'https://m.me/joseph.gomez', 9),
('Torres', 'Anna', 'S', 'anna.torres@example.com', '09221234567', 'https://facebook.com/anna.torres', 11),
('Lopez', 'Daniel', 'V', 'daniel.lopez@example.com', '09231234567', 'https://m.me/daniel.lopez', 13),
('Garcia', 'Leah', 'C', 'leah.garcia@example.com', '09241234567', 'https://facebook.com/leah.garcia', 15),
('Navarro', 'Miguel', 'D', 'miguel.navarro@example.com', '09251234567', 'https://m.me/miguel.navarro', 17),
('Ramos', 'Patricia', 'E', 'patricia.ramos@example.com', '09261234567', 'https://facebook.com/patricia.ramos', 19);

-- Foreign key constraint to units table
ALTER TABLE `jj_apartments`.`units`
  ADD INDEX `fk_units_active_tenant_idx` (`active_tenant_id` ASC),
  ADD CONSTRAINT `fk_units_active_tenant`
    FOREIGN KEY (`active_tenant_id`)
    REFERENCES `jj_apartments`.`tenants` (`id`)
    ON DELETE SET NULL;

-- Update units to link active tenants 
UPDATE units SET active_tenant_id = 1 WHERE id = 1;  -- Juan in Unit A
UPDATE units SET active_tenant_id = 2 WHERE id = 3;  -- Maria in Unit C
UPDATE units SET active_tenant_id = 3 WHERE id = 5;  -- Carlos in Unit E
UPDATE units SET active_tenant_id = 4 WHERE id = 7;  -- Angela in Unit G
UPDATE units SET active_tenant_id = 5 WHERE id = 9;  -- Joseph in Unit I
UPDATE units SET active_tenant_id = 6 WHERE id = 11; -- Anna in Unit K
UPDATE units SET active_tenant_id = 7 WHERE id = 13; -- Daniel in Unit M
UPDATE units SET active_tenant_id = 8 WHERE id = 15; -- Leah in Unit O
UPDATE units SET active_tenant_id = 9 WHERE id = 17; -- Miguel in Unit Q
UPDATE units SET active_tenant_id = 10 WHERE id = 19; -- Patricia in Unit S

SELECT * FROM units;
SELECT * FROM tenants;

-- -----------------------------------------------------
-- Table `jj_apartments`.`sub_tenants`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jj_apartments`.`sub_tenants` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `last_name` VARCHAR(45) NOT NULL,
  `first_name` VARCHAR(45) NOT NULL,
  `middle_initial` VARCHAR(1) NULL,
  `phone_number` VARCHAR(15) NOT NULL,
  `messenger_link` VARCHAR(512) NULL,
  `main_tenant_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `main_tenant_id_idx` (`main_tenant_id` ASC) VISIBLE,
  CONSTRAINT `main_tenant_id`
    FOREIGN KEY (`main_tenant_id`)
    REFERENCES `jj_apartments`.`tenants` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

INSERT INTO `jj_apartments`.`sub_tenants` 
(`last_name`, `first_name`, `middle_initial`, `phone_number`, `messenger_link`, `main_tenant_id`) 
VALUES
('Santos', 'Jose', 'M', '09271234567', 'https://m.me/jose.santos', 2),
('Santos', 'Isabel', 'R', '09281234567', 'https://facebook.com/isabel.santos', 2),
('Reyes', 'Sofia', 'L', '09291234567', 'https://m.me/sofia.reyes', 3),
('Torres', 'Rafael', 'D', '09301234567', 'https://facebook.com/rafael.torres', 6),
('Torres', 'Carmen', 'V', '09311234567', 'https://m.me/carmen.torres', 6);

-- -------------------------
-- Table: payments
-- -------------------------
CREATE TABLE IF NOT EXISTS payments (
  id INT NOT NULL AUTO_INCREMENT,
  units_id INT NULL,
  mode_of_payment VARCHAR(45) NULL DEFAULT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NULL DEFAULT NULL,
  month_of_start DATE NULL DEFAULT NULL,
  month_of_end DATE NULL DEFAULT NULL,
  is_paid TINYINT NULL,
  paid_at DATE NULL DEFAULT NULL,
  PRIMARY KEY (id),
  INDEX units_id_idx (units_id ASC),
  CONSTRAINT units_id FOREIGN KEY (units_id) REFERENCES units (id) ON DELETE SET NULL
) ENGINE = InnoDB;

INSERT INTO payments (units_id, mode_of_payment, amount, due_date, month_of_start, month_of_end, is_paid, paid_at)
VALUES 
  (2, 'GCash',         11500.00, '2025-08-01', '2025-08-01', '2025-08-31', TRUE,  '2025-07-28'),
  (3, 'Bank Transfer', 1800.00,  '2025-08-03', '2025-08-01', '2025-08-31', FALSE, NULL),
  (5, 'Cash',          2200.00,  '2025-08-05', '2025-08-01', '2025-08-31', TRUE,  '2025-08-01'),
  (1, 'Online Payment',11000.00, '2025-08-02', '2025-08-01', '2025-08-31', FALSE, NULL),
  (4, 'Cash',          950.00,   '2025-08-06', '2025-08-01', '2025-08-31', TRUE,  '2025-08-06');

-- -------------------------
-- Table: rates
-- -------------------------
CREATE TABLE IF NOT EXISTS rates (
  id INT NOT NULL AUTO_INCREMENT,
  type VARCHAR(45) NOT NULL,
  rate DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  PRIMARY KEY (id)
) ENGINE = InnoDB;

INSERT INTO rates (type, rate, date) VALUES
('Meralco', 15.02, '2025-07-17'),
('Manila Water', 50, '2025-07-17'),
('Meralco', 14.30, '2024-07-17'),
('Manila Water', 45, '2024-07-17');

-- -------------------------
-- Table: utilities
-- -------------------------
CREATE TABLE IF NOT EXISTS utilities (
  id INT NOT NULL AUTO_INCREMENT,
  type VARCHAR(45) NOT NULL,
  previous_reading DECIMAL(10,2) NULL DEFAULT NULL,
  current_reading DECIMAL(10,2) NOT NULL,
  total_meter DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  due_date DATE NULL DEFAULT NULL,
  month_of_start DATE NOT NULL,
  month_of_end DATE NOT NULL,
  is_paid TINYINT NULL,
  paid_at DATE NULL DEFAULT NULL,
  units_id INT NULL,
  rates_id INT NULL,
  PRIMARY KEY (id),
  INDEX fk_utilities_units1_idx (units_id ASC),
  INDEX fk_utilities_rates1_idx (rates_id ASC),
  CONSTRAINT fk_utilities_units1 FOREIGN KEY (units_id) REFERENCES units (id) ON DELETE SET NULL,
  CONSTRAINT fk_utilities_rates1 FOREIGN KEY (rates_id) REFERENCES rates (id) ON DELETE SET NULL
) ENGINE = InnoDB;

INSERT INTO utilities (
  type, previous_reading, current_reading, total_meter, total_amount, 
  due_date, month_of_start, month_of_end, is_paid, paid_at, 
  units_id, rates_id
) VALUES 
('Meralco', 120.0, 145.0, 25.0, 625.00, '2025-07-25', '2025-06-01', '2025-06-30', false, NULL, 1, 1),
('Meralco', 100.0, 122.5, 22.5, 562.50, '2025-07-20', '2025-06-01', '2025-06-30', true, '2025-07-10', 2, 1),
('Manila Water', 30.0, 45.0, 15.0, 300.00, '2025-07-22', '2025-06-01', '2025-06-30', false, NULL, 1, 2),
('Manila Water', 28.0, 40.0, 12.0, 240.00, '2025-07-18', '2025-06-01', '2025-06-30', true, '2025-07-08', 2, 2);

-- -------------------------
-- Table: expenses
-- -------------------------
CREATE TABLE IF NOT EXISTS expenses (
  id INT NOT NULL AUTO_INCREMENT,
  units_id INT NULL,
  amount DECIMAL(10,2) NOT NULL,
  mode_of_payment VARCHAR(45) NULL,
  reason VARCHAR(45) NOT NULL,
  date DATE NOT NULL,
  PRIMARY KEY (id),
  INDEX `fk_expenses_units1_idx` (`units_id` ASC) VISIBLE,
  CONSTRAINT `fk_expenses_units1`
    FOREIGN KEY (`units_id`)
    REFERENCES `jj_apartments`.`units` (`id`)
    ON DELETE SET NULL
) ENGINE = InnoDB;

INSERT INTO expenses (units_id, amount, reason, mode_of_payment, date)
VALUES 
  (1, 1500.00, 'Utility Bills', 'Bank Transfer', '2025-07-01'),
  (3, 2200.00, 'Maintenance',  'GCash', '2025-07-03'),
  (4, 800.00,  'Miscellaneous', 'Cash','2025-07-04'),
  (2, 1750.00, 'Utility Bills', 'Online Payment','2025-07-08'),
  (6, 950.00,  'Miscellaneous', 'Cash','2025-07-12'),
  (2, 3000.00, 'Maintenance',  'GCash', '2025-07-15');

-- -------------------------
-- Table: monthly_reports
-- -------------------------
CREATE TABLE IF NOT EXISTS monthly_reports (
  id INT NOT NULL AUTO_INCREMENT,
  year INT NOT NULL,
  month INT NOT NULL,
  units_id INT NULL,
  monthly_dues DECIMAL(10, 2) NULL,
  utility_bills DECIMAL(10,2) NULL,
  expenses DECIMAL(10,2) NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_unit_year_month (units_id, year, month),
  INDEX fk_monthlyreports_units1_idx (units_id ASC),
  CONSTRAINT fk_monthlyreports_units1 FOREIGN KEY (units_id) REFERENCES units (id) ON DELETE SET NULL
) ENGINE = InnoDB;

INSERT INTO monthly_reports(year, month, units_id, monthly_dues, utility_bills, expenses)
VALUES
(2025, 7, 1, 11000.00, 925.00, 1500.00),
(2025, 7, 2, 11500.00, 802.50, 4750.00),
(2025, 7, 3, 1800.00, 0.00, 2200.00),
(2025, 7, 4, 950.00, 0.00, 800.00),
(2025, 7, 5, 2200.00, 0.00, 0.00),
(2025, 7, 6, NULL, 0.00, 950.00),
(2025, 8, 1, 11000.00, 0.00, 0.00),
(2025, 8, 2, 11500.00, 0.00, 0.00),
(2025, 8, 3, 1800.00, 0.00, 0.00),
(2025, 8, 4, 950.00, 0.00, 0.00),
(2025, 8, 5, 2200.00, 0.00, 0.00);

SELECT * FROM monthly_reports;
SELECT * FROM units;

-- Restore original SQL modes and checks
SET SQL_MODE = @OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS = @OLD_UNIQUE_CHECKS;