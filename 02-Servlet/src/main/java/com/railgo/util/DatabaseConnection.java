package com.railgo.util;

import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public final class DatabaseConnection {

  private DatabaseConnection() {}

  public static Connection getConnection() throws SQLException {
    try {
      Class.forName("com.mysql.cj.jdbc.Driver");
    } catch (ClassNotFoundException exception) {
      throw new SQLException(
        "The MySQL JDBC driver is unavailable.",
        exception
      );
    }
    Properties properties = new Properties();
    String base =
      System.getProperty("railgo.servlet.base");
    if (base == null || base.isBlank()) {
      base = System.getProperty("catalina.base");
    }
    Path envFile =
      base == null || base.isBlank()
        ? Path.of(".env")
        : Path.of(base, "webapps", "RailGoServlet", ".env");
    if (Files.isReadable(envFile)) {
      try (FileInputStream input = new FileInputStream(envFile.toFile())) {
        properties.load(input);
      } catch (IOException exception) {
        throw new SQLException("The local database configuration could not be read.");
      }
    }

    String host = value(properties, "RAILGO_DB_HOST", "127.0.0.1");
    String port = value(properties, "RAILGO_DB_PORT", "3306");
    String database = value(properties, "RAILGO_DB_NAME", "railgo_servlet");
    String username = value(properties, "RAILGO_DB_USERNAME", "railgo_servlet_app");
    String password = value(properties, "RAILGO_DB_PASSWORD", "");

    if (password.isBlank()) {
      throw new SQLException("Database password is not configured.");
    }

    String url =
      "jdbc:mysql://" +
      host +
      ":" +
      port +
      "/" +
      database +
      "?useUnicode=true&characterEncoding=UTF-8&useSSL=false&allowPublicKeyRetrieval=true";
    return DriverManager.getConnection(url, username, password);
  }

  private static String value(
    Properties properties,
    String key,
    String fallback
  ) {
    String system = System.getenv(key);
    if (system == null || system.isBlank()) {
      system = System.getProperty(key);
    }
    if (system == null || system.isBlank()) {
      system = properties.getProperty(key);
    }
    return system == null || system.isBlank() ? fallback : system.trim();
  }
}
