package com.railgo.jsp.web;

import com.railgo.jsp.dao.BookingDao;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

@WebServlet("/history")
public class HistoryServlet extends BaseServlet {

  protected void doGet(HttpServletRequest r, HttpServletResponse s)
    throws ServletException, java.io.IOException
  {
    r.setAttribute("bookings", BookingServlet.bookings(r.getSession()));
    r.setAttribute("csrf", com.railgo.jsp.util.Csrf.token(r.getSession()));
    view(r, s, "history.jsp");
  }

  protected void doPost(
    HttpServletRequest r,
    HttpServletResponse s
  ) throws java.io.IOException {
    if (!csrf(r)) {
      s.sendError(403);
      return;
    }
    String p = r.getParameter("pnr");
    BookingServlet.bookings(r.getSession()).removeIf(b -> b.pnr().equals(p));
    s.sendRedirect(r.getContextPath() + "/history");
  }
}
