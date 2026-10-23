package com.railgo.jsp.util;

import java.sql.*;

public final class Database {
    private Database() {}
    public static Connection connection() throws SQLException {
        String url = env("RAILGO_DB_URL", "jdbc:mysql://localhost:3306/railgo?useSSL=false&serverTimezone=Asia/Kolkata");
        String user = env("RAILGO_DB_USER", "railgo_app");
        String password = System.getenv("RAILGO_DB_PASSWORD");
        if (password == null || password.isBlank()) throw new SQLException("RAILGO_DB_PASSWORD is not configured.");
        return DriverManager.getConnection(url, user, password);
    }
    private static String env(String key, String fallback) {
        String value = System.getenv(key);
        return value == null || value.isBlank() ? fallback : value;
    }
}
