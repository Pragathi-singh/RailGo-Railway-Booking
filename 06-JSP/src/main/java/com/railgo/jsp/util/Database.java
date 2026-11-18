package com.railgo.jsp.util;

import java.sql.*;

public final class Database {

  private Database() {}

  public static Connection connection() throws SQLException {
    String url = env(
      "RAILGO_DB_URL",
      "jdbc:mysql://127.0.0.1:3306/railgo_jsp?useSSL=false&serverTimezone=Asia/Kolkata&characterEncoding=UTF-8"
    );
    String user = env("RAILGO_DB_USER", "railgo_phase2");
    String password = System.getenv("RAILGO_DB_PASSWORD");
    return DriverManager.getConnection(url, user, password);
  }

  private static String env(String key, String fallback) {
    String value = System.getenv(key);
    return value == null || value.isBlank() ? fallback : value;
  }
}
