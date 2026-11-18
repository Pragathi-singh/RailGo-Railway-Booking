package com.railgo.servlet;

import com.railgo.model.PublicUser;
import com.railgo.service.BookingService;
import com.railgo.util.WebSupport;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;

@WebServlet("/dashboard")
public class DashboardServlet extends HttpServlet {

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
    throws ServletException, IOException
  {
    HttpSession session = request.getSession(false);
    if (
      session == null ||
      !(session.getAttribute("currentUser") instanceof PublicUser)
    ) {
      response.sendRedirect(request.getContextPath() + "/login");
      return;
    }
    WebSupport.consumeFlash(request);
    WebSupport.prepareView(request);
    try {
      PublicUser user = (PublicUser) session.getAttribute("currentUser");
      request.setAttribute("bookings", new BookingService().history(user.id()));
    } catch (Exception exception) {
      request.setAttribute("bookings", java.util.List.of());
    }
    request
      .getRequestDispatcher("/WEB-INF/views/dashboard.jsp")
      .forward(request, response);
  }
}
