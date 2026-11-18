package com.railgo.servlet;

import com.railgo.service.BookingService;
import com.railgo.model.PublicUser;
import com.railgo.util.WebSupport;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/history")
public class HistoryServlet extends HttpServlet {

  protected void doGet(HttpServletRequest r, HttpServletResponse s)
    throws ServletException, IOException
  {
    if (
      !(
        r.getSession(false) != null &&
        r.getSession(false).getAttribute("currentUser") instanceof PublicUser
      )
    ) {
      s.sendRedirect(r.getContextPath() + "/login");
      return;
    }
    try {
      PublicUser user = (PublicUser) r.getSession().getAttribute("currentUser");
      r.setAttribute("bookings", new BookingService().history(user.id()));
    } catch (Exception exception) {
      r.getServletContext().log("RailGo history failed.", exception);
      r.setAttribute("historyError", "Booking history is temporarily unavailable.");
      r.setAttribute("bookings", java.util.List.of());
    }
    WebSupport.prepareView(r);
    r.getRequestDispatcher("/WEB-INF/views/history.jsp").forward(r, s);
  }

  protected void doPost(
    HttpServletRequest r,
    HttpServletResponse s
  ) throws IOException {
    if (!WebSupport.validCsrf(r)) {
      WebSupport.invalidCsrf(r, s);
      return;
    }
  }
}
