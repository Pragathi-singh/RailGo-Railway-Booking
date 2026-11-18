"use strict";

const bcrypt = require("bcryptjs");
const crypto = require("node:crypto");
const { pool, publicUser } = require("./database");

const BCRYPT_ROUNDS = 12;

class UserStore {
  constructor() {
    this.users = new Map();
    this.databaseEnabled =
      process.env.NODE_ENV !== "test" && process.env.RAILGO_USE_MYSQL === "1";
  }

  async create({ fullName, email, mobile, password }) {
    const normalizedEmail = UserStore.normalizeEmail(email);
    if (this.databaseEnabled) {
      const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
      try {
        const [result] = await pool.query(
          "INSERT INTO users (full_name, email, mobile, password_hash) VALUES (?,?,?,?)",
          [fullName.trim(), normalizedEmail, mobile.trim(), passwordHash],
        );
        return Boolean(result.insertId);
      } catch (error) {
        if (error.code === "ER_DUP_ENTRY") return false;
        throw error;
      }
    }
    if (this.users.has(normalizedEmail)) {
      return false;
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    if (this.users.has(normalizedEmail)) {
      return false;
    }
    this.users.set(
      normalizedEmail,
      Object.freeze({
        id: crypto.randomUUID(),
        fullName,
        email: normalizedEmail,
        mobile,
        passwordHash,
      }),
    );
    return true;
  }

  async authenticate(email, password) {
    if (this.databaseEnabled) {
      const [rows] = await pool.query(
        "SELECT * FROM users WHERE email = ? LIMIT 1",
        [UserStore.normalizeEmail(email)],
      );
      if (
        !rows.length ||
        !(await bcrypt.compare(password, rows[0].password_hash))
      )
        return null;
      return publicUser(rows[0]);
    }
    const user = this.users.get(UserStore.normalizeEmail(email));
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return null;
    }
    const { passwordHash, ...publicUser } = user;
    return publicUser;
  }

  static normalizeEmail(email) {
    return email.trim().toLowerCase();
  }
}

module.exports = { UserStore };
