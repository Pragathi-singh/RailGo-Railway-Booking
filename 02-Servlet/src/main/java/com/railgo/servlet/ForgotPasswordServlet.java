package com.railgo.servlet;

import com.railgo.util.DatabaseConnection;
import com.railgo.util.PnrGenerator;
import com.railgo.util.WebSupport;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.security.MessageDigest;
import java.util.HexFormat;

@WebServlet("/forgot-password")
public class ForgotPasswordServlet extends HttpServlet {

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
    throws ServletException, IOException {
    WebSupport.prepareView(request);
    request
      .getRequestDispatcher("/WEB-INF/views/forgot-password.jsp")
      .forward(request, response);
  }

  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response)
    throws ServletException, IOException {
    if (!WebSupport.validCsrf(request)) {
      WebSupport.invalidCsrf(request, response);
      return;
    }
    String email = WebSupport.value(request, "email").toLowerCase();
    if (email.isBlank()) {
      request.setAttribute("resetMessage", "Enter an account email.");
      doGet(request, response);
      return;
    }
    try (
      Connection connection = DatabaseConnection.getConnection();
      PreparedStatement find = connection.prepareStatement(
        "SELECT id FROM users WHERE email=?"
      )
    ) {
      find.setString(1, email);
      try (ResultSet result = find.executeQuery()) {
        if (result.next()) {
          String token = PnrGenerator.generate() +
            java.util.UUID.randomUUID().toString().replace("-", "");
          String hash = HexFormat.of().formatHex(
            MessageDigest.getInstance("SHA-256")
              .digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8))
          );
          try (
            PreparedStatement insert = connection.prepareStatement(
              "INSERT INTO password_reset_tokens " +
              "(user_id,token_hash,expires_at) " +
              "VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 MINUTE))"
            )
          ) {
            insert.setLong(1, result.getLong("id"));
            insert.setString(2, hash);
            insert.executeUpdate();
          }
          request.setAttribute("demoResetToken", token);
        }
      }
      request.setAttribute(
        "resetMessage",
        "If the account exists, a local demo reset link was prepared."
      );
    } catch (Exception exception) {
      request.getServletContext().log(
        "RailGo password reset request failed.",
        exception
      );
      request.setAttribute(
        "resetMessage",
        "Password help is temporarily unavailable."
      );
    }
    doGet(request, response);
  }
}
