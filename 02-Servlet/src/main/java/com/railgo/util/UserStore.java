package com.railgo.util;

import com.railgo.dao.UserDao;
import com.railgo.model.User;
import java.sql.SQLException;
import java.util.Locale;
import java.util.Optional;

public final class UserStore {

  private static final UserDao DAO = new UserDao();

  private UserStore() {}

  public static boolean register(
    String fullName,
    String email,
    String mobile,
    String password
  ) {
    String normalizedEmail = normalizeEmail(email);
    User user = new User(
      0,
      fullName,
      normalizedEmail,
      mobile,
      PasswordHasher.hash(password)
    );
    try {
      return DAO.create(user);
    } catch (SQLException exception) {
      throw new IllegalStateException(
        "Database account operation failed.",
        exception
      );
    }
  }

  public static Optional<User> authenticate(String email, String password) {
    try {
      Optional<User> user = DAO.findByEmail(normalizeEmail(email));
      if (
        user.isEmpty() ||
        !PasswordHasher.verify(password, user.get().passwordHash())
      ) {
        return Optional.empty();
      }
      return user;
    } catch (SQLException exception) {
      throw new IllegalStateException(
        "Database login operation failed.",
        exception
      );
    }
  }

  public static String normalizeEmail(String email) {
    return email.trim().toLowerCase(Locale.ROOT);
  }
}
