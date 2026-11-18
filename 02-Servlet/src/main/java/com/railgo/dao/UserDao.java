package com.railgo.dao;

import com.railgo.model.User;
import com.railgo.util.DatabaseConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;

public final class UserDao {

  public boolean create(User user) throws SQLException {
    String sql =
      "INSERT INTO users (name,email,mobile,password_hash) VALUES (?,?,?,?)";
    try (
      Connection connection = DatabaseConnection.getConnection();
      PreparedStatement statement = connection.prepareStatement(sql)
    ) {
      statement.setString(1, user.fullName());
      statement.setString(2, user.email());
      statement.setString(3, user.mobile());
      statement.setString(4, user.passwordHash());
      return statement.executeUpdate() == 1;
    } catch (java.sql.SQLIntegrityConstraintViolationException exception) {
      return false;
    }
  }

  public Optional<User> findByEmail(String email) throws SQLException {
    String sql =
      "SELECT id,name,email,mobile,password_hash FROM users WHERE email=?";
    try (
      Connection connection = DatabaseConnection.getConnection();
      PreparedStatement statement = connection.prepareStatement(sql)
    ) {
      statement.setString(1, email.trim().toLowerCase());
      try (ResultSet result = statement.executeQuery()) {
        return result.next()
          ? Optional.of(mapUser(result))
          : Optional.empty();
      }
    }
  }

  public Optional<User> findById(long id) throws SQLException {
    String sql =
      "SELECT id,name,email,mobile,password_hash FROM users WHERE id=?";
    try (
      Connection connection = DatabaseConnection.getConnection();
      PreparedStatement statement = connection.prepareStatement(sql)
    ) {
      statement.setLong(1, id);
      try (ResultSet result = statement.executeQuery()) {
        return result.next()
          ? Optional.of(mapUser(result))
          : Optional.empty();
      }
    }
  }

  public boolean updateProfile(long id, String name, String mobile)
    throws SQLException {
    String sql = "UPDATE users SET name=?,mobile=? WHERE id=?";
    try (
      Connection connection = DatabaseConnection.getConnection();
      PreparedStatement statement = connection.prepareStatement(sql)
    ) {
      statement.setString(1, name);
      statement.setString(2, mobile);
      statement.setLong(3, id);
      return statement.executeUpdate() == 1;
    }
  }

  private User mapUser(ResultSet result) throws SQLException {
    return new User(
      result.getLong("id"),
      result.getString("name"),
      result.getString("email"),
      result.getString("mobile"),
      result.getString("password_hash")
    );
  }
}
