"use strict";

require("dotenv").config();

const path = require("node:path");
const express = require("express");
const session = require("express-session");
const helmet = require("helmet");
const { csrfSync } = require("csrf-sync");
const authRoutes = require("./routes/auth");
const homeRoutes = require("./routes/home");
const { UserStore } = require("./services/userStore");
const { initializeDatabase } = require("./services/database");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const defaultDevelopmentSecret =
  "railgo-local-demo-secret-change-before-deployment";
const sessionSecret = process.env.SESSION_SECRET;

if (
  process.env.NODE_ENV === "production" &&
  (!sessionSecret || sessionSecret === defaultDevelopmentSecret)
) {
  throw new Error("Set a strong SESSION_SECRET in the production environment.");
}

if (!sessionSecret && process.env.NODE_ENV !== "production") {
  console.warn(
    "RailGo demo: using a development-only session secret. Configure SESSION_SECRET in .env for local use.",
  );
}

function createApp(options = {}) {
  const app = express();
  const userStore = options.userStore || new UserStore();
  const { generateToken, csrfSynchronisedProtection } = csrfSync({
    getTokenFromRequest: (req) => req.body && req.body._csrf,
  });

  app.disable("x-powered-by");
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));
  app.locals.asset = (file) => `/assets/${file.replace(/^\/+/, "")}`;
  app.locals.userStore = userStore;
  app.locals.demoMode = process.env.RAILGO_USE_MYSQL !== "1";
  app.locals.demoSchedules = [
    {
      id: 1,
      train_number: "RG101",
      train_name: "Deccan Coast Express",
      source_station: "Mumbai Central",
      destination_station: "Pune Junction",
      departure_time: "06:15",
      arrival_time: "09:40",
      duration: "3h 25m",
      travel_class: "Sleeper",
      journey_date: new Date().toISOString().slice(0, 10),
      fare: 450,
      available_seats: 72,
      total_seats: 72,
    },
    {
      id: 2,
      train_number: "RG202",
      train_name: "Capital Sunrise",
      source_station: "New Delhi",
      destination_station: "Jaipur Junction",
      departure_time: "07:00",
      arrival_time: "11:35",
      duration: "4h 35m",
      travel_class: "Sleeper",
      journey_date: new Date().toISOString().slice(0, 10),
      fare: 450,
      available_seats: 72,
      total_seats: 72,
    },
  ];
  app.locals.demoBookings = [];

  app.use(helmet());
  app.use(express.urlencoded({ extended: false, limit: "20kb" }));
  app.use(
    "/assets",
    express.static(path.join(__dirname, "public"), {
      index: false,
      maxAge: process.env.NODE_ENV === "production" ? "1h" : 0,
    }),
  );
  app.use(
    session({
      name: "railgo.sid",
      secret:
        options.sessionSecret || sessionSecret || defaultDevelopmentSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 2,
      },
    }),
  );
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Vary", "Origin");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });
  app.use("/api", require("./routes/api"));
  app.use((req, res, next) => {
    res.locals.csrfToken = generateToken(req);
    res.locals.currentUser = req.session.user || null;
    res.locals.flash = req.session.flash || null;
    delete req.session.flash;
    next();
  });
  app.use(csrfSynchronisedProtection);

  app.get("/api/status", (req, res) => {
    res.json({ ok: true, edition: "node", database: "railgo_node" });
  });

  app.use("/", homeRoutes);
  app.use("/", authRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

if (require.main === module) {
  const app = createApp();
  const port = Number.parseInt(process.env.PORT || "3000", 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be a valid port number between 1 and 65535.");
  }
  const ready = app.locals.demoMode ? Promise.resolve() : initializeDatabase();
  ready
    .then(() =>
      app.listen(port, () => {
        console.log(
          `RailGo Node.js demo listening at http://localhost:${port}`,
        );
      }),
    )
    .catch((error) => {
      console.error("RailGo database initialization failed:", error);
      process.exitCode = 1;
    });
}

module.exports = { createApp };
