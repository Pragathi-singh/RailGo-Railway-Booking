package com.railgo.jsp.web;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/results")
public class ResultsServlet extends BaseServlet {

  protected void doGet(HttpServletRequest r, HttpServletResponse s)
    throws ServletException, IOException
  {
    r.setAttribute("journey", r.getSession().getAttribute("journey"));
    view(r, s, "search-results.jsp");
  }
}
