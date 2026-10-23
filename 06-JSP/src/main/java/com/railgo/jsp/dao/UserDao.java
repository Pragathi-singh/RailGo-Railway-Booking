package com.railgo.jsp.dao;

import com.railgo.jsp.model.User;
import com.railgo.jsp.util.Database;
import java.sql.*;

public class UserDao {
    public User findByEmail(String email) throws SQLException {
        String sql = "SELECT id,full_name,email,mobile,password_hash FROM users WHERE email = ?";
        try (Connection c = Database.connection(); PreparedStatement p = c.prepareStatement(sql)) {
            p.setString(1, email.toLowerCase()); try (ResultSet r = p.executeQuery()) { return r.next() ? map(r) : null; }
        }
    }
    public User create(String name, String email, String mobile, String hash) throws SQLException {
        String sql = "INSERT INTO users(full_name,email,mobile,password_hash) VALUES(?,?,?,?)";
        try (Connection c = Database.connection(); PreparedStatement p = c.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            p.setString(1, name); p.setString(2, email.toLowerCase()); p.setString(3, mobile); p.setString(4, hash); p.executeUpdate();
            try (ResultSet r = p.getGeneratedKeys()) { r.next(); return new User(r.getLong(1), name, email.toLowerCase(), mobile, hash); }
        }
    }
    public boolean updateProfile(long id, String name, String mobile) throws SQLException {
        try (Connection c = Database.connection(); PreparedStatement p = c.prepareStatement("UPDATE users SET full_name=?,mobile=? WHERE id=?")) {
            p.setString(1, name); p.setString(2, mobile); p.setLong(3, id); return p.executeUpdate() == 1;
        }
    }
    private User map(ResultSet r) throws SQLException { return new User(r.getLong("id"), r.getString("full_name"), r.getString("email"), r.getString("mobile"), r.getString("password_hash")); }
}
