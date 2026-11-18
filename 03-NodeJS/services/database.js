"use strict";

const mysql = require("mysql2/promise");
const crypto = require("node:crypto");

const pool = mysql.createPool({
  host: process.env.RAILGO_DB_HOST || "127.0.0.1",
  port: Number(process.env.RAILGO_DB_PORT || 3306),
  database: process.env.RAILGO_DB_NAME || "railgo",
  user: process.env.RAILGO_DB_USER || "railgo_app",
  password: process.env.RAILGO_DB_PASSWORD || "",
  connectionLimit: 5,
  dateStrings: true,
});

async function initializeDatabase() {
  await pool.query(`CREATE TABLE IF NOT EXISTS users (
        id BIGINT PRIMARY KEY AUTO_INCREMENT, full_name VARCHAR(120) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE, mobile VARCHAR(30) NOT NULL,
        password_hash VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS trains (
        id BIGINT PRIMARY KEY AUTO_INCREMENT, train_number VARCHAR(20) UNIQUE NOT NULL,
        train_name VARCHAR(120) NOT NULL, source_station VARCHAR(120) NOT NULL,
        destination_station VARCHAR(120) NOT NULL, departure_time VARCHAR(10) NOT NULL,
        arrival_time VARCHAR(10) NOT NULL, duration VARCHAR(30) NOT NULL,
        running_days VARCHAR(80) NOT NULL
    )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS train_schedules (
        id BIGINT PRIMARY KEY AUTO_INCREMENT, train_id BIGINT NOT NULL, journey_date DATE NOT NULL,
        travel_class VARCHAR(60) NOT NULL, total_seats INT NOT NULL, available_seats INT NOT NULL,
        fare DECIMAL(10,2) NOT NULL, UNIQUE KEY schedule_key (train_id, journey_date, travel_class),
        FOREIGN KEY (train_id) REFERENCES trains(id)
    )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS bookings (
        id BIGINT PRIMARY KEY AUTO_INCREMENT, pnr VARCHAR(20) UNIQUE NOT NULL, user_id BIGINT NOT NULL,
        schedule_id BIGINT NOT NULL, origin VARCHAR(120) NOT NULL, destination VARCHAR(120) NOT NULL,
        journey_date DATE NOT NULL, travel_class VARCHAR(60) NOT NULL, passenger_count INT NOT NULL,
        total_fare DECIMAL(10,2) NOT NULL, booking_status VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (schedule_id) REFERENCES train_schedules(id)
    )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS passengers (
        id BIGINT PRIMARY KEY AUTO_INCREMENT, booking_id BIGINT NOT NULL, passenger_name VARCHAR(120) NOT NULL,
        age INT NOT NULL, gender VARCHAR(20) NOT NULL, seat_number VARCHAR(20) NOT NULL,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
    )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS payments (
        id BIGINT PRIMARY KEY AUTO_INCREMENT, booking_id BIGINT UNIQUE NOT NULL, amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(30) NOT NULL, payment_status VARCHAR(30) NOT NULL,
        transaction_reference VARCHAR(40) UNIQUE NOT NULL, FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
    )`);
  const [trains] = await pool.query("SELECT id FROM trains LIMIT 1");
  if (!trains.length) {
    const routes = [
      [
        "RG101",
        "Deccan Coast Express",
        "Mumbai Central",
        "Pune Junction",
        "06:15",
        "09:40",
        "3h 25m",
      ],
      [
        "RG202",
        "Capital Sunrise",
        "New Delhi",
        "Jaipur Junction",
        "07:00",
        "11:35",
        "4h 35m",
      ],
      [
        "RG303",
        "Southern Breeze",
        "Bengaluru City",
        "Chennai Central",
        "08:30",
        "13:15",
        "4h 45m",
      ],
    ];
    for (const [
      number,
      name,
      source,
      destination,
      departure,
      arrival,
      duration,
    ] of routes) {
      const [result] = await pool.query(
        "INSERT INTO trains (train_number, train_name, source_station, destination_station, departure_time, arrival_time, duration, running_days) VALUES (?,?,?,?,?,?,?,?)",
        [
          number,
          name,
          source,
          destination,
          departure,
          arrival,
          duration,
          "Daily",
        ],
      );
      for (let offset = 0; offset < 31; offset += 1) {
        const journeyDate = new Date(Date.now() + offset * 86400000)
          .toISOString()
          .slice(0, 10);
        for (const [index, travelClass] of [
          "Sleeper",
          "AC 3 Tier",
          "AC 2 Tier",
          "AC First Class",
          "Chair Car",
        ].entries()) {
          await pool.query(
            "INSERT INTO train_schedules (train_id, journey_date, travel_class, total_seats, available_seats, fare) VALUES (?,?,?,?,?,?)",
            [
              result.insertId,
              journeyDate,
              travelClass,
              72,
              72,
              450 + index * 650,
            ],
          );
        }
      }
    }
  }
}

function publicUser(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    mobile: row.mobile,
  };
}

module.exports = {
  pool,
  initializeDatabase,
  publicUser,
  createPnr: () =>
    `RG${new Date().toISOString().slice(2, 10).replace(/-/g, "")}${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
};
