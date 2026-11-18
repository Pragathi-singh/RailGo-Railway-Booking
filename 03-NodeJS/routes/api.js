const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("node:crypto");
const { pool, createPnr } = require("../services/database");

const router = express.Router();
router.use(express.json({ limit: "20kb" }));

const publicUser = (row) => ({
  id: row.id,
  fullName: row.full_name,
  email: row.email,
  mobile: row.mobile,
});

router.get("/status", (req, res) => {
  res.json({ ok: true, edition: "node", database: "railgo_node" });
});

router.post("/auth/signup", async (req, res) => {
  try {
    const fullName = String(req.body.fullName || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const mobile = String(req.body.mobile || "").replace(/[\\s()-]/g, "");
    const password = String(req.body.password || "");
    if (fullName.length < 2 || mobile.length !== 10 || password.length < 8) {
      return res.status(422).json({ ok: false, message: "Invalid registration data." });
    }
    const hash = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      "INSERT INTO users (full_name,email,mobile,password_hash) VALUES (?,?,?,?)",
      [fullName, email, mobile, hash],
    );
    res.status(201).json({ ok: true, user: { id: result.insertId, fullName, email, mobile } });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ ok: false, field: "email", message: "Email already exists." });
    }
    res.status(500).json({ ok: false, message: "Account could not be created." });
  }
});

router.post("/auth/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const [rows] = await pool.query("SELECT * FROM users WHERE email=? LIMIT 1", [email]);
  if (!rows.length || !(await bcrypt.compare(password, rows[0].password_hash))) {
    return res.status(401).json({ ok: false, message: "Invalid email or password." });
  }
  req.session.regenerate((error) => {
    if (error) return res.status(500).json({ ok: false, message: "Session could not be created." });
    req.session.user = publicUser(rows[0]);
    res.json({ ok: true, user: req.session.user });
  });
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

router.get("/auth/me", (req, res) => {
  res.json({ ok: true, user: req.session.user || null });
});

router.put("/profile", async (req, res) => {
  if (!req.session.user) return res.status(401).json({ ok: false, message: "Authentication required." });
  const fullName = String(req.body.fullName || "").trim();
  const mobile = String(req.body.mobile || "").replace(/[\\s()-]/g, "");
  await pool.query("UPDATE users SET full_name=?,mobile=? WHERE id=?", [fullName, mobile, req.session.user.id]);
  req.session.user.fullName = fullName;
  req.session.user.mobile = mobile;
  res.json({ ok: true, user: req.session.user });
});

router.post("/search", async (req, res) => {
  const [rows] = await pool.query(
    `SELECT s.*,t.train_number,t.train_name,t.source_station,t.destination_station,t.departure_time,t.arrival_time,t.duration
     FROM train_schedules s JOIN trains t ON t.id=s.train_id
     WHERE LOWER(t.source_station)=LOWER(?) AND LOWER(t.destination_station)=LOWER(?)
       AND s.journey_date=? AND s.travel_class=? AND s.available_seats>0
     ORDER BY s.departure_time`,
    [req.body.from, req.body.to, req.body.journeyDate, req.body.travelClass || "Sleeper"],
  );
  res.json({ ok: true, results: rows });
});

router.post("/bookings", async (req, res) => {
  if (!req.session.user) return res.status(401).json({ ok: false, message: "Authentication required." });
  const scheduleId = Number(req.body.scheduleId);
  const passengers = Array.isArray(req.body.passengers) ? req.body.passengers : [];
  if (!scheduleId || passengers.length < 1 || passengers.length > 6) {
    return res.status(422).json({ ok: false, message: "Invalid passenger details." });
  }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query(
      `SELECT s.*,t.source_station,t.destination_station FROM train_schedules s
       JOIN trains t ON t.id=s.train_id WHERE s.id=? FOR UPDATE`,
      [scheduleId],
    );
    if (!rows.length || rows[0].available_seats < passengers.length) throw new Error("Insufficient seats.");
    const schedule = rows[0];
    const total = Number(schedule.fare) * passengers.length;
    const pnr = createPnr();
    const [booking] = await connection.query(
      `INSERT INTO bookings (pnr,user_id,schedule_id,origin,destination,journey_date,travel_class,passenger_count,total_fare)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [pnr, req.session.user.id, scheduleId, schedule.source_station, schedule.destination_station, schedule.journey_date, schedule.travel_class, passengers.length, total],
    );
    await connection.query("UPDATE train_schedules SET available_seats=available_seats-? WHERE id=?", [passengers.length, scheduleId]);
    for (let i = 0; i < passengers.length; i++) {
      await connection.query(
        "INSERT INTO passengers (booking_id,passenger_name,age,gender,seat_number) VALUES (?,?,?,?,?)",
        [booking.insertId, passengers[i].name, Number(passengers[i].age), passengers[i].gender, `SL-${i + 1}`],
      );
    }
    await connection.query(
      "INSERT INTO payments (booking_id,amount,payment_method,payment_status,transaction_reference) VALUES (?,?,?,?,?)",
      [booking.insertId, total, "DEMO", "DEMO_CONFIRMED", `DEMO-${crypto.randomBytes(6).toString("hex").toUpperCase()}`]);
    await connection.commit();
    res.status(201).json({ ok: true, bookingId: booking.insertId, pnr });
  } catch (error) {
    await connection.rollback();
    res.status(422).json({ ok: false, message: error.message === "Insufficient seats." ? error.message : "Booking failed." });
  } finally {
    connection.release();
  }
});

router.get("/bookings", async (req, res) => {
  if (!req.session.user) return res.status(401).json({ ok: false, message: "Authentication required." });
  const [rows] = await pool.query("SELECT * FROM bookings WHERE user_id=? ORDER BY created_at DESC", [req.session.user.id]);
  res.json({ ok: true, bookings: rows });
});

router.post("/bookings/:id/cancel", async (req, res) => {
  if (!req.session.user) return res.status(401).json({ ok: false, message: "Authentication required." });
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query("SELECT * FROM bookings WHERE id=? AND user_id=? FOR UPDATE", [req.params.id, req.session.user.id]);
    if (!rows.length) throw new Error("Not found.");
    if (rows[0].booking_status === "CONFIRMED") {
      await connection.query("UPDATE train_schedules SET available_seats=available_seats+? WHERE id=?", [rows[0].passenger_count, rows[0].schedule_id]);
      await connection.query("UPDATE bookings SET booking_status='CANCELLED' WHERE id=?", [rows[0].id]);
    }
    await connection.commit();
    res.json({ ok: true });
  } catch (error) {
    await connection.rollback();
    res.status(error.message === "Not found." ? 404 : 422).json({ ok: false, message: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
