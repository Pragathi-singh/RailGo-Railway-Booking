"use strict";

const express = require("express");
const crypto = require("node:crypto");
const { validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const { requireAuth } = require("../middleware/auth");
const { searchValidation } = require("../utils/validation");
const { pool, createPnr } = require("../services/database");

const router = express.Router();
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: "Please wait a moment before submitting another search.",
});

router.get("/", (req, res) => res.redirect("/home"));

router.get("/home", (req, res) => {
  res.render("home", {
    title: "Plan your journey",
    search: null,
    errors: {},
    schedules: [],
    searchMessage: null,
    flash:
      req.query.loggedOut === "1"
        ? { type: "success", message: "You have been logged out." }
        : res.locals.flash,
  });
});

router.post(
  "/search",
  searchLimiter,
  searchValidation,
  async (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const errors = {};
      for (const error of result.array()) {
        if (!errors[error.path]) errors[error.path] = error.msg;
      }
      return res.status(422).render("home", {
        title: "Plan your journey",
        search: req.body,
        errors,
        schedules: [],
        searchMessage: null,
      });
    }
    if (process.env.NODE_ENV === "test") {
      return res.render("home", {
        title: "Plan your journey",
        search: req.body,
        errors: {},
        schedules: [],
        searchMessage: `Live train results are not available for ${req.body.from} to ${req.body.to} right now.`,
      });
    }
    if (req.app.locals.demoMode) {
      const schedules = req.app.locals.demoSchedules.filter(
        (schedule) =>
          schedule.source_station.toLowerCase() ===
            req.body.from.toLowerCase() &&
          schedule.destination_station.toLowerCase() ===
            req.body.to.toLowerCase() &&
          schedule.journey_date === req.body.journeyDate &&
          schedule.travel_class === req.body.travelClass,
      );
      return res.render("home", {
        title: "Plan your journey",
        search: req.body,
        errors: {},
        schedules,
        searchMessage: schedules.length
          ? null
          : "No demo trains match this route and date.",
      });
    }

    try {
      const [schedules] = await pool.query(
        `SELECT s.*, t.train_number, t.train_name, t.source_station,
            t.destination_station, t.departure_time, t.arrival_time, t.duration
            FROM train_schedules s JOIN trains t ON t.id=s.train_id
            WHERE LOWER(t.source_station)=LOWER(?) AND LOWER(t.destination_station)=LOWER(?)
            AND s.journey_date=? AND s.travel_class=? AND s.available_seats > 0`,
        [
          req.body.from,
          req.body.to,
          req.body.journeyDate,
          req.body.travelClass || "Sleeper",
        ],
      );
      return res.render("home", {
        title: "Plan your journey",
        search: req.body,
        errors: {},
        schedules,
        searchMessage: schedules.length
          ? null
          : "No demo trains match this route and date.",
      });
    } catch (error) {
      return next(error);
    }
  },
);

router.get("/dashboard", requireAuth, (req, res) => {
  res.render("dashboard", { title: "My RailGo" });
});

router.get("/profile", requireAuth, (req, res) => {
  res.render("profile", { title: "My profile", error: null });
});

router.post("/profile", requireAuth, (req, res) => {
  const fullName = String(req.body.fullName || "").trim();
  const mobile = String(req.body.mobile || "").trim();
  if (fullName.length < 2 || !/^[0-9+() -]{7,20}$/.test(mobile)) {
    return res
      .status(422)
      .render("profile", {
        title: "My profile",
        error: "Enter a valid name and mobile number.",
      });
  }
  req.session.user.fullName = fullName;
  req.session.user.mobile = mobile;
  return res.redirect("/profile");
});

router.get("/history", requireAuth, async (req, res, next) => {
  if (req.app.locals.demoMode) {
    return res.render("history", {
      title: "My bookings",
      bookings: req.app.locals.demoBookings.filter(
        (booking) => booking.userId === req.session.user.id,
      ),
    });
  }
  try {
    const [bookings] = await pool.query(
      "SELECT * FROM bookings WHERE user_id=? ORDER BY created_at DESC",
      [req.session.user.id],
    );
    res.render("history", { title: "My bookings", bookings });
  } catch (error) {
    next(error);
  }
});

router.get("/book/:scheduleId", requireAuth, async (req, res, next) => {
  if (req.app.locals.demoMode) {
    const schedule = req.app.locals.demoSchedules.find(
      (item) => item.id === Number(req.params.scheduleId),
    );
    if (!schedule) return res.status(404).render("404", { title: "Not found" });
    return res.render("booking", {
      title: "Passenger details",
      schedule,
      error: null,
    });
  }
  try {
    const [rows] = await pool.query(
      `SELECT s.*, t.train_number, t.train_name, t.source_station,
            t.destination_station FROM train_schedules s JOIN trains t ON t.id=s.train_id WHERE s.id=?`,
      [req.params.scheduleId],
    );
    if (!rows.length)
      return res.status(404).render("404", { title: "Not found" });
    return res.render("booking", {
      title: "Passenger details",
      schedule: rows[0],
      error: null,
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/book/:scheduleId", requireAuth, async (req, res, next) => {
  if (req.app.locals.demoMode) {
    const schedule = req.app.locals.demoSchedules.find(
      (item) => item.id === Number(req.params.scheduleId),
    );
    const count = Number(req.body.passengerCount);
    const names = [].concat(req.body.passengerName || []).slice(0, count);
    const ages = [].concat(req.body.passengerAge || []).slice(0, count);
    const genders = [].concat(req.body.passengerGender || []).slice(0, count);
    if (
      !schedule ||
      !Number.isInteger(count) ||
      count < 1 ||
      count > 6 ||
      schedule.available_seats < count ||
      names.length !== count ||
      ages.some(
        (age) =>
          !Number.isInteger(Number(age)) ||
          Number(age) < 1 ||
          Number(age) > 120,
      )
    ) {
      return res
        .status(422)
        .render("booking", {
          title: "Passenger details",
          schedule,
          error: "Enter valid passenger details.",
        });
    }
    schedule.available_seats -= count;
    const booking = {
      id: req.app.locals.demoBookings.length + 1,
      userId: req.session.user.id,
      pnr: `RG${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(2).toString("hex").toUpperCase()}`,
      scheduleId: schedule.id,
      origin: schedule.source_station,
      destination: schedule.destination_station,
      journey_date: schedule.journey_date,
      travel_class: schedule.travel_class,
      passenger_count: count,
      total_fare: schedule.fare * count,
      booking_status: "CONFIRMED",
      passengers: names.map((name, index) => ({
        passenger_name: name,
        age: Number(ages[index]),
        gender: genders[index],
        seat_number: `SL-${schedule.total_seats - schedule.available_seats + index}`,
      })),
    };
    req.app.locals.demoBookings.push(booking);
    return res.redirect(`/booking/${booking.id}`);
  }
  const connection = await pool.getConnection();
  try {
    const count = Number(req.body.passengerCount);
    const names = [].concat(req.body.passengerName || []);
    const ages = [].concat(req.body.passengerAge || []);
    const genders = [].concat(req.body.passengerGender || []);
    if (
      !Number.isInteger(count) ||
      count < 1 ||
      count > 6 ||
      names.length !== count ||
      ages.length !== count ||
      genders.length !== count
    ) {
      return res
        .status(422)
        .render("booking", {
          title: "Passenger details",
          schedule: req.body.schedule,
          error: "Enter valid passenger details.",
        });
    }
    await connection.beginTransaction();
    const [rows] = await connection.query(
      "SELECT s.*, t.source_station, t.destination_station FROM train_schedules s JOIN trains t ON t.id=s.train_id WHERE s.id=? FOR UPDATE",
      [req.params.scheduleId],
    );
    const schedule = rows[0];
    if (!schedule || schedule.available_seats < count)
      throw new Error("Not enough seats available.");
    const pnr = createPnr();
    const total = Number(schedule.fare) * count;
    const [booking] = await connection.query(
      "INSERT INTO bookings (pnr,user_id,schedule_id,origin,destination,journey_date,travel_class,passenger_count,total_fare) VALUES (?,?,?,?,?,?,?,?,?)",
      [
        pnr,
        req.session.user.id,
        schedule.id,
        schedule.source_station,
        schedule.destination_station,
        schedule.journey_date,
        schedule.travel_class,
        count,
        total,
      ],
    );
    await connection.query(
      "UPDATE train_schedules SET available_seats=available_seats-? WHERE id=?",
      [count, schedule.id],
    );
    for (let i = 0; i < count; i += 1) {
      await connection.query(
        "INSERT INTO passengers (booking_id,passenger_name,age,gender,seat_number) VALUES (?,?,?,?,?)",
        [
          booking.insertId,
          names[i],
          Number(ages[i]),
          genders[i],
          `${schedule.travel_class.slice(0, 2).toUpperCase()}-${schedule.total_seats - schedule.available_seats + i + 1}`,
        ],
      );
    }
    await connection.query(
      "INSERT INTO payments (booking_id,amount,payment_method,payment_status,transaction_reference) VALUES (?,?,?,?,?)",
      [
        booking.insertId,
        total,
        "DEMO",
        "DEMO_CONFIRMED",
        `DEMO-${crypto.randomBytes(6).toString("hex").toUpperCase()}`,
      ],
    );
    await connection.commit();
    return res.redirect(`/booking/${booking.insertId}`);
  } catch (error) {
    await connection.rollback();
    return next(error);
  } finally {
    connection.release();
  }
});

router.get("/booking/:bookingId", requireAuth, async (req, res, next) => {
  if (req.app.locals.demoMode) {
    const booking = req.app.locals.demoBookings.find(
      (item) =>
        item.id === Number(req.params.bookingId) &&
        item.userId === req.session.user.id,
    );
    if (!booking) return res.status(404).render("404", { title: "Not found" });
    return res.render("confirmation", {
      title: "Booking confirmed",
      booking,
      passengers: booking.passengers,
    });
  }
  try {
    const [rows] = await pool.query(
      "SELECT * FROM bookings WHERE id=? AND user_id=?",
      [req.params.bookingId, req.session.user.id],
    );
    if (!rows.length)
      return res.status(404).render("404", { title: "Not found" });
    const [passengers] = await pool.query(
      "SELECT * FROM passengers WHERE booking_id=?",
      [req.params.bookingId],
    );
    res.render("confirmation", {
      title: "Booking confirmed",
      booking: rows[0],
      passengers,
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/booking/:bookingId/cancel",
  requireAuth,
  async (req, res, next) => {
    if (req.app.locals.demoMode) {
      const booking = req.app.locals.demoBookings.find(
        (item) =>
          item.id === Number(req.params.bookingId) &&
          item.userId === req.session.user.id,
      );
      if (!booking) return res.status(404).end();
      const schedule = req.app.locals.demoSchedules.find(
        (item) => item.id === booking.scheduleId,
      );
      if (booking.booking_status === "CONFIRMED") {
        schedule.available_seats += booking.passenger_count;
        booking.booking_status = "CANCELLED";
      }
      return res.redirect("/history");
    }
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.query(
        "SELECT * FROM bookings WHERE id=? AND user_id=? FOR UPDATE",
        [req.params.bookingId, req.session.user.id],
      );
      if (!rows.length) return res.status(404).end();
      const booking = rows[0];
      if (booking.booking_status === "CONFIRMED") {
        await connection.query(
          "UPDATE train_schedules SET available_seats=available_seats+? WHERE id=?",
          [booking.passenger_count, booking.schedule_id],
        );
        await connection.query(
          'UPDATE bookings SET booking_status="CANCELLED" WHERE id=?',
          [booking.id],
        );
      }
      await connection.commit();
      res.redirect("/history");
    } catch (error) {
      await connection.rollback();
      next(error);
    } finally {
      connection.release();
    }
  },
);

module.exports = router;
