CREATE DATABASE IF NOT EXISTS railgo
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE railgo;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    full_name VARCHAR(100) NULL,
    email VARCHAR(254) NOT NULL,
    mobile VARCHAR(10) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    address VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trains (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    train_number VARCHAR(20) NOT NULL,
    train_name VARCHAR(100) NOT NULL,
    source VARCHAR(200) NOT NULL,
    destination VARCHAR(200) NOT NULL,
    departure_time TIME NULL,
    arrival_time TIME NULL,
    duration VARCHAR(30) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_trains_number (train_number),
    KEY idx_trains_route (source, destination)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS train_schedules (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    train_id BIGINT UNSIGNED NOT NULL,
    journey_date DATE NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    duration VARCHAR(30) NOT NULL,
    travel_class VARCHAR(30) NOT NULL,
    total_seats INT UNSIGNED NOT NULL,
    available_seats INT UNSIGNED NOT NULL,
    fare DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_schedule (train_id, journey_date, travel_class),
    KEY idx_schedule_search (journey_date, travel_class, available_seats),
    CONSTRAINT fk_schedule_train
        FOREIGN KEY (train_id) REFERENCES trains(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT chk_schedule_seats
        CHECK (available_seats <= total_seats)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    schedule_id BIGINT UNSIGNED NOT NULL,
    pnr VARCHAR(20) NOT NULL,
    booking_status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_bookings_pnr (pnr),
    KEY idx_bookings_user (user_id, created_at),
    KEY idx_bookings_schedule (schedule_id),
    CONSTRAINT fk_booking_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_booking_schedule
        FOREIGN KEY (schedule_id) REFERENCES train_schedules(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS passengers (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    booking_id BIGINT UNSIGNED NOT NULL,
    passenger_name VARCHAR(100) NOT NULL,
    age TINYINT UNSIGNED NOT NULL,
    gender VARCHAR(20) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_passengers_booking (booking_id),
    CONSTRAINT fk_passenger_booking
        FOREIGN KEY (booking_id) REFERENCES bookings(id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payments (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    booking_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    payment_status VARCHAR(30) NOT NULL,
    transaction_reference VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_payment_reference (transaction_reference),
    KEY idx_payments_booking (booking_id),
    CONSTRAINT fk_payment_booking
        FOREIGN KEY (booking_id) REFERENCES bookings(id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    token_hash CHAR(64) NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_reset_token_hash (token_hash),
    KEY idx_reset_user (user_id),
    CONSTRAINT fk_reset_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
