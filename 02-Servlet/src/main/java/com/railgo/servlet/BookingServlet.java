package com.railgo.servlet;

import com.railgo.model.PublicUser;
import com.railgo.model.TrainSchedule;
import com.railgo.service.BookingService;
import com.railgo.util.WebSupport;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;

@WebServlet({ "/book", "/booking", "/passenger-details" })
public class BookingServlet extends HttpServlet {

  private final BookingService bookingService = new BookingService();

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
    throws ServletException, IOException
  {
    PublicUser user = signedInUser(request);
    if (user == null) {
      response.sendRedirect(request.getContextPath() + "/login");
      return;
    }
    String scheduleValue = request.getParameter("scheduleId");
    if (scheduleValue == null) {
      Object pending = request.getSession().getAttribute("pendingScheduleId");
      scheduleValue = pending == null ? "" : pending.toString();
    }
    showSchedule(request, response, scheduleValue);
  }

  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response)
    throws ServletException, IOException
  {
    PublicUser user = signedInUser(request);
    if (user == null) {
      response.sendRedirect(request.getContextPath() + "/login");
      return;
    }
    if (!WebSupport.validCsrf(request)) {
      WebSupport.invalidCsrf(request, response);
      return;
    }

    String scheduleValue = WebSupport.value(request, "scheduleId");
    if (scheduleValue.isBlank()) {
      Object pending = request.getSession().getAttribute("pendingScheduleId");
      scheduleValue = pending == null ? "" : pending.toString();
    }
    if (scheduleValue.isBlank()) {
      request.setAttribute("error", "Select a train before entering passengers.");
      showSchedule(request, response, "");
      return;
    }

    long scheduleId;
    try {
      scheduleId = Long.parseLong(scheduleValue);
    } catch (NumberFormatException exception) {
      request.setAttribute("error", "The selected journey is invalid.");
      showSchedule(request, response, "");
      return;
    }

    TrainSchedule schedule = findSchedule(request, response, scheduleId);
    if (schedule == null) {
      return;
    }
    request.getSession().setAttribute("pendingScheduleId", scheduleId);

    String[] names = request.getParameterValues("passengerName");
    String[] ages = request.getParameterValues("passengerAge");
    String[] genders = request.getParameterValues("passengerGender");
    String countValue = WebSupport.value(request, "passengerCount");
    int count;
    try {
      count = Integer.parseInt(countValue.isBlank() ? "1" : countValue);
    } catch (NumberFormatException exception) {
      count = 0;
    }

    if (
      count < 1 ||
      count > 6 ||
      names == null ||
      ages == null ||
      genders == null ||
      names.length < count ||
      ages.length < count ||
      genders.length < count
    ) {
      request.setAttribute("error", "Enter valid passenger details.");
      showSchedule(request, response, String.valueOf(scheduleId));
      return;
    }
    if (schedule.availableSeats() < count) {
      request.setAttribute(
        "error",
        "Only " + schedule.availableSeats() + " seats remain."
      );
      showSchedule(request, response, String.valueOf(scheduleId));
      return;
    }

    java.util.List<PassengerForm> passengers = new java.util.ArrayList<>();
    for (int index = 0; index < count; index++) {
      String name = names[index].trim();
      String ageValue = ages[index].trim();
      String gender = genders[index].trim();
      int age;
      try {
        age = Integer.parseInt(ageValue);
      } catch (NumberFormatException exception) {
        age = 0;
      }
      if (
        name.isBlank() ||
        name.length() > 100 ||
        age < 1 ||
        age > 120 ||
        !java.util.Set.of("Female", "Male", "Other").contains(gender)
      ) {
        request.setAttribute("error", "Enter valid passenger name, age and gender.");
        showSchedule(request, response, String.valueOf(scheduleId));
        return;
      }
      passengers.add(new PassengerForm(name, age, gender));
    }

    request.getSession().setAttribute("pendingPassengerCount", count);
    request.getSession().setAttribute("pendingPassengers", passengers);
    response.sendRedirect(request.getContextPath() + "/payment");
  }

  private void showSchedule(
    HttpServletRequest request,
    HttpServletResponse response,
    String scheduleValue
  ) throws ServletException, IOException {
    if (scheduleValue.isBlank()) {
      request.setAttribute("error", "Select a train before entering passengers.");
      request.setAttribute("schedule", null);
      forward(request, response);
      return;
    }
    try {
      long scheduleId = Long.parseLong(scheduleValue);
      TrainSchedule schedule = bookingService.schedule(scheduleId);
      if (schedule == null) {
        request.setAttribute("error", "The selected journey could not be found.");
        request.setAttribute("schedule", null);
      } else {
        request.setAttribute("schedule", schedule);
      }
    } catch (Exception exception) {
      request.getServletContext().log(
        "RailGo passenger page failed.",
        exception
      );
      request.setAttribute("error", "The journey is temporarily unavailable.");
      request.setAttribute("schedule", null);
    }
    forward(request, response);
  }

  private TrainSchedule findSchedule(
    HttpServletRequest request,
    HttpServletResponse response,
    long scheduleId
  ) throws IOException {
    try {
      TrainSchedule schedule = bookingService.schedule(scheduleId);
      if (schedule == null) {
        request.setAttribute("error", "The selected journey could not be found.");
      }
      return schedule;
    } catch (Exception exception) {
      request.getServletContext().log(
        "RailGo passenger scheduling failed.",
        exception
      );
      request.setAttribute("error", "The journey is temporarily unavailable.");
      return null;
    }
  }

  private void forward(
    HttpServletRequest request,
    HttpServletResponse response
  ) throws ServletException, IOException {
    WebSupport.prepareView(request);
    request
      .getRequestDispatcher("/WEB-INF/views/booking.jsp")
      .forward(request, response);
  }

  public static PublicUser signedInUser(HttpServletRequest request) {
    HttpSession session = request.getSession(false);
    return session != null &&
      session.getAttribute("currentUser") instanceof PublicUser user
      ? user
      : null;
  }

  public record PassengerForm(
    String name,
    int age,
    String gender
  ) implements java.io.Serializable {}
}
