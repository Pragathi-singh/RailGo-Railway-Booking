package com.railgo.servlet;

import com.railgo.util.DatabaseConnection;
import com.railgo.util.PasswordHasher;
import com.railgo.util.WebSupport;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.HexFormat;

@WebServlet("/reset-password")
public class ResetPasswordServlet extends HttpServlet {

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
    throws ServletException, IOException
  {
    request.setAttribute("token", request.getParameter("token"));
    WebSupport.prepareView(request);
    request
      .getRequestDispatcher("/WEB-INF/views/reset-password.jsp")
      .forward(request, response);
  }

  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response)
    throws ServletException, IOException
  {
    if (!WebSupport.validCsrf(request)) {
      WebSupport.invalidCsrf(request, response);
      return;
    }
    String token = WebSupport.value(request, "token");
    String password = request.getParameter("password");
    String confirm = request.getParameter("confirmPassword");
    password = password == null ? "" : password;
    confirm = confirm == null ? "" : confirm;
    if (
      password.length() < 8 ||
      !password.matches("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}")
    ) {
      request.setAttribute("resetError", "Use at least 8 characters with uppercase, lowercase and a number.");
      doGet(request, response);
      return;
    }
    if (!password.equals(confirm)) {
      request.setAttribute("resetError", "The passwords do not match.");
      doGet(request, response);
      return;
    }
    try (Connection connection = DatabaseConnection.getConnection()) {
      connection.setAutoCommit(false);
      String hash = HexFormat.of().formatHex(
        MessageDigest.getInstance("SHA-256")
          .digest(token.getBytes(StandardCharsets.UTF_8))
      );
      long resetId;
      long userId;
      try (
        PreparedStatement lookup = connection.prepareStatement(
          "SELECT id,user_id FROM password_reset_tokens " +
          "WHERE token_hash=? AND used_at IS NULL AND expires_at>=NOW()"
        )
      ) {
        lookup.setString(1, hash);
        try (ResultSet result = lookup.executeQuery()) {
          if (!result.next()) {
            connection.rollback();
            request.setAttribute("resetError", "The reset link is invalid or expired.");
            doGet(request, response);
            return;
          }
          resetId = result.getLong("id");
          userId = result.getLong("user_id");
        }
      }
      try (
        PreparedStatement passwordStatement = connection.prepareStatement(
          "UPDATE users SET password_hash=? WHERE id=?"
        )
      ) {
        passwordStatement.setString(1, PasswordHasher.hash(password));
        passwordStatement.setLong(2, userId);
        passwordStatement.executeUpdate();
      }
      try (
        PreparedStatement usedStatement = connection.prepareStatement(
          "UPDATE password_reset_tokens SET used_at=NOW() WHERE id=?"
        )
      ) {
        usedStatement.setLong(1, resetId);
        usedStatement.executeUpdate();
      }
      connection.commit();
      WebSupport.flash(
        request.getSession(),
        "success",
        "Your password was updated."
      );
      response.sendRedirect(request.getContextPath() + "/login");
    } catch (Exception exception) {
      getServletContext().log("RailGo reset password failed.", exception);
      request.setAttribute("resetError", "Password reset could not be completed.");
      doGet(request, response);
    }
  }
}
