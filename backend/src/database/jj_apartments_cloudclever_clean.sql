-- Disable checks temporarily (for safe table creation with foreign keys)
SET @OLD_UNIQUE_CHECKS = @@UNIQUE_CHECKS, UNIQUE_CHECKS = 0;
SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS = 0;
SET @OLD_SQL_MODE = @@SQL_MODE, SQL_MODE = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Table: users
-- -----------------------------------------------------
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
CREATE TABLE IF NOT EXISTS units (
  id INT NOT NULL AUTO_INCREMENT,
  unit_number VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(150) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  num_occupants INT NOT NULL,
  active_tenant_id INT NULL,
  PRIMARY KEY (id)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table: tenants
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS tenants (
  id INT NOT NULL AUTO_INCREMENT,
  last_name VARCHAR(45) NOT NULL,
  first_name VARCHAR(45) NOT NULL,
  middle_initial VARCHAR(1) NULL DEFAULT NULL,
  email VARCHAR(45) NOT NULL,
  phone_number VARCHAR(15) NOT NULL,
  messenger_link VARCHAR(512) NULL,
  units_id INT NOT NULL,
  move_in_date DATE NULL,
  move_out_date DATE NULL,
  PRIMARY KEY (id),
  INDEX fk_tenants_units1_idx (units_id ASC),
  CONSTRAINT fk_tenants_units1
    FOREIGN KEY (units_id)
    REFERENCES units (id)
    ON DELETE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Add FK: units.active_tenant_id → tenants.id
-- -----------------------------------------------------
ALTER TABLE units
  ADD INDEX fk_units_active_tenant_idx (active_tenant_id ASC),
  ADD CONSTRAINT fk_units_active_tenant
    FOREIGN KEY (active_tenant_id)
    REFERENCES tenants (id)
    ON DELETE SET NULL;

-- -----------------------------------------------------
-- Table: sub_tenants
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS sub_tenants (
  id INT NOT NULL AUTO_INCREMENT,
  last_name VARCHAR(45) NOT NULL,
  first_name VARCHAR(45) NOT NULL,
  middle_initial VARCHAR(1) NULL,
  phone_number VARCHAR(15) NOT NULL,
  messenger_link VARCHAR(512) NULL,
  main_tenant_id INT NOT NULL,
  PRIMARY KEY (id),
  INDEX main_tenant_id_idx (main_tenant_id ASC),
  CONSTRAINT main_tenant_id
    FOREIGN KEY (main_tenant_id)
    REFERENCES tenants (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table: payments
-- -----------------------------------------------------
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
  CONSTRAINT units_id FOREIGN KEY (units_id)
    REFERENCES units (id)
    ON DELETE SET NULL
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table: rates
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS rates (
  id INT NOT NULL AUTO_INCREMENT,
  type VARCHAR(45) NOT NULL,
  rate DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  PRIMARY KEY (id)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table: utilities
-- -----------------------------------------------------
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
  CONSTRAINT fk_utilities_units1 FOREIGN KEY (units_id) 
    REFERENCES units (id)
    ON DELETE SET NULL,
  CONSTRAINT fk_utilities_rates1 FOREIGN KEY (rates_id) 
    REFERENCES rates (id)
    ON DELETE SET NULL
) ENGINE = InnoDB;

-- Re-enable checks
SET SQL_MODE = @OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS = @OLD_UNIQUE_CHECKS;
