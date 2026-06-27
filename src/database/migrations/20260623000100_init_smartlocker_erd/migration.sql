-- Create tables
CREATE TABLE stations (
  id VARCHAR(191) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type ENUM('mall', 'office', 'residential') NOT NULL,
  city VARCHAR(191) NOT NULL,
  address VARCHAR(255) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE lockers (
  id VARCHAR(191) NOT NULL,
  station_id VARCHAR(191) NOT NULL,
  size ENUM('small', 'medium', 'large') NOT NULL,
  status ENUM('available', 'occupied') NOT NULL DEFAULT 'available',
  label VARCHAR(191) NOT NULL,
  version INT NOT NULL DEFAULT 1,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  INDEX idx_lockers_station_id (station_id),
  INDEX idx_lockers_status (status),
  CONSTRAINT lockers_station_id_fkey
    FOREIGN KEY (station_id)
    REFERENCES stations(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE users (
  id VARCHAR(191) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(191) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE INDEX users_email_key (email)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE packages (
  id VARCHAR(191) NOT NULL,
  locker_id VARCHAR(191) NOT NULL,
  user_id VARCHAR(191) NOT NULL,
  package_size ENUM('small', 'medium', 'large') NOT NULL,
  delivery_status ENUM('ASSIGNED_TO_AGENT', 'READY_TO_PICK', 'PICKED') NOT NULL,
  pickup_code VARCHAR(191) NULL,
  customer_name VARCHAR(255) NOT NULL,
  assigned_at DATETIME(3) NOT NULL,
  stored_at DATETIME(3) NULL,
  pickup_at DATETIME(3) NULL,
  retrieved_at DATETIME(3) NULL,
  storage_price DECIMAL(6, 2) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE INDEX packages_pickup_code_key (pickup_code),
  INDEX idx_packages_locker_id (locker_id),
  INDEX idx_packages_user_id (user_id),
  INDEX idx_packages_delivery_status (delivery_status),
  CONSTRAINT packages_locker_id_fkey
    FOREIGN KEY (locker_id)
    REFERENCES lockers(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT packages_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE notifications (
  id VARCHAR(191) NOT NULL,
  user_id VARCHAR(191) NOT NULL,
  package_id VARCHAR(191) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  locker_label VARCHAR(191) NOT NULL,
  pickup_code VARCHAR(191) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  INDEX idx_notifications_user_id (user_id),
  INDEX idx_notifications_package_id (package_id),
  CONSTRAINT notifications_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT notifications_package_id_fkey
    FOREIGN KEY (package_id)
    REFERENCES packages(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Optional filtering indexes used by station search
CREATE INDEX idx_stations_type ON stations(type);
CREATE INDEX idx_stations_city ON stations(city);
