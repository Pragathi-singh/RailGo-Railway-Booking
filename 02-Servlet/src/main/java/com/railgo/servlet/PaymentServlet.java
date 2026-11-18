package com.railgo.servlet;

import com.railgo.dao.BookingDao;
import com.railgo.model.PublicUser;
import com.railgo.model.TrainSchedule;
import com.railgo.service.BookingService;
import com.railgo.util.WebSupport;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Set;

@WebServlet("/payment")
public class PaymentServlet extends HttpServlet {

  private final BookingService bookingService = new BookingService();

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
    throws ServletException, IOException
  {
    preparePayment(request, response);
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

    String method = WebSupport.value(request, "paymentMethod");
    if (!Set.of("DEMO_UPI", "DEMO_WALLET", "PAY_ON_COUNTER").contains(method)) {
      request.setAttribute("error", "Choose a valid demo payment method.");
      preparePayment(request, response);
      return;
    }

    Object scheduleValue = request.getSession().getAttribute("pendingScheduleId");
    Object countValue = request.getSession().getAttribute("pendingPassengerCount");
    Object passengerValue = request.getSession().getAttribute("pendingPassengers");
    if (
      scheduleValue == null ||
      countValue == null ||
      !(passengerValue instanceof List<?> rawPassengers)
    ) {
      response.sendRedirect(request.getContextPath() + "/search");
      return;
    }

    long scheduleId = ((Number) scheduleValue).longValue();
    int passengerCount = ((Number) countValue).intValue();
    if (rawPassengers.size() != passengerCount) {
      request.setAttribute("error", "Passenger details are incomplete.");
      preparePayment(request, response);
      return;
    }

    List<BookingDao.PassengerInput> passengers = new java.util.ArrayList<>();
    for (Object raw : rawPassengers) {
      if (raw instanceof BookingServlet.PassengerForm passenger) {
        passengers.add(
          new BookingDao.PassengerInput(
            passenger.name(),
            passenger.age(),
            passenger.gender()
          )
        );
      }
    }
    if (passengers.size() != passengerCount) {
      request.setAttribute("error", "Passenger details are incomplete.");
      preparePayment(request, response);
      return;
    }

    try {
      long bookingId = bookingService.createBooking(
        user.id(),
        scheduleId,
        passengers,
        method
      );
      request.getSession().removeAttribute("pendingScheduleId");
      request.getSession().removeAttribute("pendingPassengerCount");
      request.getSession().removeAttribute("pendingPassengers");
      response.sendRedirect(
        request.getContextPath() + "/confirmation?bookingId=" + bookingId
      );
    } catch (Exception exception) {
      getServletContext().log("RailGo booking failed.", exception);
      String message =
        exception.getMessage() != null &&
          exception.getMessage().contains("Insufficient seats")
          ? "There are not enough seats available."
          : "The booking could not be completed. Please try again.";
      request.setAttribute("error", message);
      preparePayment(request, response);
    }
  }

  private void preparePayment(
    HttpServletRequest request,
    HttpServletResponse response
  ) throws ServletException, IOException {
    PublicUser user = BookingServlet.signedInUser(request);
    if (user == null) {
      response.sendRedirect(request.getContextPath() + "/login");
      return;
    }
    Object scheduleValue = request.getSession().getAttribute("pendingScheduleId");
    Object countValue = request.getSession().getAttribute("pendingPassengerCount");
    if (scheduleValue == null || countValue == null) {
      response.sendRedirect(request.getContextPath() + "/search");
      return;
    }
    try {
      TrainSchedule schedule = bookingService.schedule(
        ((Number) scheduleValue).longValue()
      );
      if (schedule == null) {
        response.sendRedirect(request.getContextPath() + "/search");
        return;
      }
      int count = ((Number) countValue).intValue();
      java.math.BigDecimal total =
        schedule.fare().multiply(java.math.BigDecimal.valueOf(count));
      request.setAttribute("schedule", schedule);
      request.setAttribute("passengerCount", count);
      request.setAttribute("totalAmount", total);
    } catch (Exception exception) {
      getServletContext().log("RailGo payment page failed.", exception);
      request.setAttribute("error", "The payment summary is unavailable.");
    }
    WebSupport.prepareView(request);
    request
      .getRequestDispatcher("/WEB-INF/views/payment.jsp")
      .forward(request, response);
  }
}
