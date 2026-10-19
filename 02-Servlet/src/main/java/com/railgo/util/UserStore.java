package com.railgo.util;

import com.railgo.model.User;

import java.util.Locale;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

public final class UserStore {
    private static final ConcurrentHashMap<String, User> USERS = new ConcurrentHashMap<>();

    private UserStore() {
    }

    public static boolean register(String fullName, String email, String mobile, String password) {
        String normalizedEmail = normalizeEmail(email);
        User user = new User(fullName, normalizedEmail, mobile, PasswordHasher.hash(password));
        return USERS.putIfAbsent(normalizedEmail, user) == null;
    }

    public static Optional<User> authenticate(String email, String password) {
        User user = USERS.get(normalizeEmail(email));
        if (user == null || !PasswordHasher.verify(password, user.passwordHash())) {
            return Optional.empty();
        }
        return Optional.of(user);
    }

    public static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
