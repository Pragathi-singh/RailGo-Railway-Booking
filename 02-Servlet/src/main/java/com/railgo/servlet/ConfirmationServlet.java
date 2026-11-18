package com.railgo.servlet;

import com.railgo.model.Booking;
import com.railgo.model.PublicUser;
import com.railgo.service.BookingService;
import com.railgo.util.WebSupport;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/confirmation")
public class ConfirmationServlet extends HttpServlet {

  protected void doGet(HttpServletRequest r, HttpServletResponse s)
    throws ServletException, IOException
  {
    PublicUser user = BookingServlet.signedInUser(r);
    if (user == null) {
      s.sendRedirect(r.getContextPath() + "/login");
      return;
    }
    String value = r.getParameter("bookingId");
    long bookingId;
    try {
      bookingId = Long.parseLong(value);
    } catch (Exception exception) {
      s.sendRedirect(r.getContextPath() + "/history");
      return;
    }
    try {
      Booking booking = new BookingService().ownedBooking(bookingId, user.id());
      if (booking == null) {
        r.setAttribute("error", "Booking not found or access denied.");
        s.sendError(404);
        return;
      }
      r.setAttribute("booking", booking);
    } catch (Exception exception) {
      r.getServletContext().log("RailGo confirmation failed.", exception);
      r.setAttribute("error", "The ticket could not be loaded.");
    }
    WebSupport.prepareView(r);
    WebSupport.prepareView(r);
    r.getRequestDispatcher("/WEB-INF/views/confirmation.jsp").forward(r, s);
  }
}
