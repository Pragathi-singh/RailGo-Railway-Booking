'use strict';

const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');

const BCRYPT_ROUNDS = 12;

class UserStore {
    constructor() {
        this.users = new Map();
    }

    async create({ fullName, email, mobile, password }) {
        const normalizedEmail = UserStore.normalizeEmail(email);
        if (this.users.has(normalizedEmail)) {
            return false;
        }

        const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
        if (this.users.has(normalizedEmail)) {
            return false;
        }
        this.users.set(normalizedEmail, Object.freeze({
            id: crypto.randomUUID(),
            fullName,
            email: normalizedEmail,
            mobile,
            passwordHash
        }));
        return true;
    }

    async authenticate(email, password) {
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
