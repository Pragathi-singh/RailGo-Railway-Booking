CREATE DATABASE IF NOT EXISTS railgo_jsp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE railgo_jsp;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(254) NOT NULL UNIQUE,
  mobile VARCHAR(10) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trains (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  train_number VARCHAR(20) NOT NULL UNIQUE,
  train_name VARCHAR(120) NOT NULL,
  source VARCHAR(120) NOT NULL,
  destination VARCHAR(120) NOT NULL
);

CREATE TABLE IF NOT EXISTS train_schedules (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  train_id BIGINT NOT NULL,
  journey_date DATE NOT NULL,
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  duration VARCHAR(30) NOT NULL,
  travel_class VARCHAR(30) NOT NULL,
  total_seats INT UNSIGNED NOT NULL,
  available_seats INT UNSIGNED NOT NULL,
  fare DECIMAL(10,2) NOT NULL,
  UNIQUE KEY uq_jsp_schedule (train_id,journey_date,travel_class),
  CONSTRAINT fk_jsp_schedule_train FOREIGN KEY (train_id) REFERENCES trains(id)
);

CREATE TABLE IF NOT EXISTS bookings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  schedule_id BIGINT NOT NULL,
  pnr VARCHAR(20) NOT NULL UNIQUE,
  booking_status VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED',
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_jsp_booking_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_jsp_booking_schedule FOREIGN KEY (schedule_id) REFERENCES train_schedules(id)
);

CREATE TABLE IF NOT EXISTS passengers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  booking_id BIGINT NOT NULL,
  passenger_name VARCHAR(120) NOT NULL,
  age INT NOT NULL,
  gender VARCHAR(20) NOT NULL,
  CONSTRAINT fk_jsp_passenger_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  booking_id BIGINT NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(30) NOT NULL,
  payment_status VARCHAR(30) NOT NULL,
  transaction_reference VARCHAR(40) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_jsp_payment_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);
