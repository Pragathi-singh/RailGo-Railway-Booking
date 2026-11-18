package com.railgo.servlet;

import com.railgo.service.BookingService;
import com.railgo.util.WebSupport;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/results")
public class ResultsServlet extends HttpServlet {

  protected void doGet(HttpServletRequest r, HttpServletResponse s)
    throws ServletException, IOException
  {
    Object journey = r.getSession().getAttribute("journey");
    if (!(journey instanceof HomeServlet.Journey search)) {
      r.setAttribute("journey", null);
      r.setAttribute("results", java.util.List.of());
    } else {
      r.setAttribute("journey", search);
      try {
        r.setAttribute(
          "results",
          new BookingService().search(
            search.origin(),
            search.destination(),
            search.date(),
            search.travelClass()
          )
        );
      } catch (Exception exception) {
        r.getServletContext().log(
          "RailGo train search failed.",
          exception
        );
        r.setAttribute(
          "searchError",
          "Train search is temporarily unavailable."
        );
        r.setAttribute("results", java.util.List.of());
      }
    }
    WebSupport.prepareView(r);
    r.getRequestDispatcher("/WEB-INF/views/results.jsp").forward(r, s);
  }
}
