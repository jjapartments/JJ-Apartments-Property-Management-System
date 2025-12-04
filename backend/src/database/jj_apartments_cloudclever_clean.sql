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
CREATE TABLE IF NOT EXISTS `units` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `unit_number` VARCHAR(20) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(150) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `num_occupants` INT NOT NULL,
  `active_tenant_id` INT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

-- -------------------------
-- Table: tenants
-- -------------------------
CREATE TABLE IF NOT EXISTS `tenants` (
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
  INDEX `fk_tenants_units1_idx` (`units_id` ASC) VISIBLE,
  CONSTRAINT `fk_tenants_units1`
    FOREIGN KEY (`units_id`)
    REFERENCES `units` (`id`)
    ON DELETE CASCADE
) ENGINE = InnoDB;

-- Foreign key constraint to units table
ALTER TABLE `units`
  ADD INDEX `fk_units_active_tenant_idx` (`active_tenant_id` ASC),
  ADD CONSTRAINT `fk_units_active_tenant`
    FOREIGN KEY (`active_tenant_id`)
    REFERENCES `tenants` (`id`)
    ON DELETE SET NULL;

-- -----------------------------------------------------
-- Table `sub_tenants`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sub_tenants` (
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
    REFERENCES `tenants` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

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
    REFERENCES `units` (`id`)
    ON DELETE SET NULL
) ENGINE = InnoDB;

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

-- -----------------------------------------------------
-- Table: tickets
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS tickets (
    id INT NOT NULL AUTO_INCREMENT,
    unit_number VARCHAR(20) NOT NULL,
    apartment_name VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    email VARCHAR(255) NULL,
    messenger_link VARCHAR(512) NULL,
    category ENUM(
        'Maintenance & Repairs',
        'Security & Safety',
        'Utilities',
        'Payment & Billing',
        'Amenities & Facilities',
        'Others'
    ) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    status ENUM(
        'Pending',
        'In Progress',
        'Resolved',
        'Closed'
    ) NOT NULL DEFAULT 'Pending',
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status_updated_by VARCHAR(45) NOT NULL,
    PRIMARY KEY (id)
) ENGINE = InnoDB;

-- Restore original SQL modes and checks
SET SQL_MODE = @OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS = @OLD_UNIQUE_CHECKS;