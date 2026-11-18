package com.railgo.jsp.web;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

@WebServlet("/dashboard")
public class DashboardServlet extends BaseServlet {

  protected void doGet(HttpServletRequest r, HttpServletResponse s)
    throws ServletException, java.io.IOException
  {
    r.setAttribute("user", user(r));
    view(r, s, "dashboard.jsp");
  }
}
