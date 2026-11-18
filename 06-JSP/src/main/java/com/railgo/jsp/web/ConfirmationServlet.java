package com.railgo.jsp.web;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/confirmation")
public class ConfirmationServlet extends BaseServlet {

  protected void doGet(HttpServletRequest r, HttpServletResponse s)
    throws ServletException, IOException
  {
    if (
      r.getSession(false) == null ||
      r.getSession(false).getAttribute("lastBooking") == null
    ) {
      s.sendRedirect(r.getContextPath() + "/history");
      return;
    }
    view(r, s, "confirmation.jsp");
  }
}
