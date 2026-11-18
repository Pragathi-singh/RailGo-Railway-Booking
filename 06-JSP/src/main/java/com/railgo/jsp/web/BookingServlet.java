package com.railgo.jsp.web;

import com.railgo.jsp.model.DemoBooking;
import com.railgo.jsp.util.Csrf;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.*;

@WebServlet({ "/book", "/booking" })
public class BookingServlet extends BaseServlet {

  protected void doGet(HttpServletRequest r, HttpServletResponse s)
    throws ServletException, IOException
  {
    r.setAttribute("journey", r.getSession().getAttribute("journey"));
    r.setAttribute("csrf", Csrf.token(r.getSession()));
    view(r, s, "booking.jsp");
  }

  protected void doPost(HttpServletRequest r, HttpServletResponse s)
    throws ServletException, IOException
  {
    if (!csrf(r)) {
      s.sendError(403);
      return;
    }
    String name = val(r, "passengerName"),
      ageText = val(r, "passengerAge"),
      gender = val(r, "passengerGender");
    Object raw = r.getSession().getAttribute("journey");
    boolean ageOk = ageText.matches("\\d+");
    int age = ageOk ? Integer.parseInt(ageText) : 0;
    if (
      !(raw instanceof Journey j) ||
      name.length() < 2 ||
      !ageOk ||
      age < 1 ||
      age > 120 ||
      !Set.of("Female", "Male", "Other").contains(gender)
    ) {
      r.setAttribute("error", "Enter valid passenger details.");
      doGet(r, s);
      return;
    }
    DemoBooking b = new DemoBooking(
      "RG" +
        UUID.randomUUID()
          .toString()
          .replace("-", "")
          .substring(0, 8)
          .toUpperCase(),
      j.origin(),
      j.destination(),
      j.date(),
      j.travelClass(),
      name,
      age,
      gender,
      "CONFIRMED"
    );
    bookings(r.getSession()).add(b);
    r.getSession().setAttribute("lastBooking", b);
    s.sendRedirect(r.getContextPath() + "/confirmation");
  }

  private String val(HttpServletRequest r, String n) {
    String v = r.getParameter(n);
    return v == null ? "" : v.trim();
  }

  @SuppressWarnings("unchecked")
  static List<DemoBooking> bookings(HttpSession s) {
    Object v = s.getAttribute("demoBookings");
    if (v instanceof List<?>) return (List<DemoBooking>) v;
    List<DemoBooking> x = new ArrayList<>();
    s.setAttribute("demoBookings", x);
    return x;
  }

  public record Journey(
    String origin,
    String destination,
    LocalDate date,
    String travelClass
  ) implements Serializable {}
}
