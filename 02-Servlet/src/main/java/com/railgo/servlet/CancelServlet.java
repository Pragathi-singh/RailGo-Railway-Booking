package com.railgo.servlet;

import com.railgo.model.Booking;
import com.railgo.model.PublicUser;
import com.railgo.service.BookingService;
import com.railgo.util.WebSupport;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/cancel")
public class CancelServlet extends HttpServlet {

  private final BookingService bookingService = new BookingService();

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
    throws ServletException, IOException
  {
    PublicUser user = BookingServlet.signedInUser(request);
    if (user == null) {
      response.sendRedirect(request.getContextPath() + "/login");
      return;
    }
    String value = request.getParameter("bookingId");
    try {
      long bookingId = Long.parseLong(value);
      Booking booking = bookingService.ownedBooking(bookingId, user.id());
      if (booking == null) {
        response.sendError(404, "Booking not found or access denied.");
        return;
      }
      request.setAttribute("booking", booking);
      WebSupport.prepareView(request);
      request
        .getRequestDispatcher("/WEB-INF/views/cancel.jsp")
        .forward(request, response);
    } catch (Exception exception) {
      getServletContext().log("RailGo cancellation lookup failed.", exception);
      response.sendError(
        500,
        "The cancellation request could not be loaded."
      );
    }
  }

  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response)
    throws ServletException, IOException
  {
    PublicUser user = BookingServlet.signedInUser(request);
    if (user == null) {
      response.sendRedirect(request.getContextPath() + "/login");
      return;
    }
    if (!WebSupport.validCsrf(request)) {
      WebSupport.invalidCsrf(request, response);
      return;
    }
    try {
      long bookingId = Long.parseLong(
        WebSupport.value(request, "bookingId")
      );
      boolean cancelled = bookingService.cancel(bookingId, user.id());
      WebSupport.flash(
        request.getSession(),
        cancelled ? "success" : "error",
        cancelled
          ? "Booking cancelled and seats restored."
          : "This booking is already cancelled or could not be found."
      );
      response.sendRedirect(request.getContextPath() + "/history");
    } catch (Exception exception) {
      getServletContext().log("RailGo cancellation failed.", exception);
      WebSupport.flash(
        request.getSession(),
        "error",
        "The booking could not be cancelled."
      );
      response.sendRedirect(request.getContextPath() + "/history");
    }
  }
}
