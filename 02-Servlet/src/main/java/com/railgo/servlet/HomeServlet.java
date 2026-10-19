package com.railgo.servlet;

import com.railgo.util.WebSupport;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Set;

@WebServlet("/home")
public class HomeServlet extends HttpServlet {
    private static final Set<String> CLASSES = Set.of(
            "Sleeper", "AC 3 Tier", "AC 2 Tier", "AC First Class", "Chair Car");

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        WebSupport.consumeFlash(request);
        showPage(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        if (!WebSupport.validCsrf(request)) {
            WebSupport.invalidCsrf(request, response);
            return;
        }

        String from = WebSupport.value(request, "from");
        String to = WebSupport.value(request, "to");
        String date = WebSupport.value(request, "journeyDate");
        String travelClass = WebSupport.value(request, "travelClass");
        request.setAttribute("from", from);
        request.setAttribute("to", to);
        request.setAttribute("journeyDate", date);
        request.setAttribute("travelClass", CLASSES.contains(travelClass) ? travelClass : "Sleeper");

        if (from.isBlank() || from.length() > 120) {
            request.setAttribute("fromError", "Enter a departure station (up to 120 characters).");
        }
        if (to.isBlank() || to.length() > 120) {
            request.setAttribute("toError", "Enter a destination station (up to 120 characters).");
        } else if (!from.isBlank() && from.equalsIgnoreCase(to)) {
            request.setAttribute("toError", "Choose a destination different from your departure station.");
        }
        try {
            LocalDate selected = LocalDate.parse(date);
            if (selected.isBefore(LocalDate.now())) {
                request.setAttribute("dateError", "Journey date cannot be in the past.");
            }
        } catch (DateTimeParseException exception) {
            request.setAttribute("dateError", "Choose a valid journey date.");
        }
        if (!CLASSES.contains(travelClass)) {
            request.setAttribute("classError", "Choose a valid travel class.");
        }

        if (request.getAttribute("fromError") == null
                && request.getAttribute("toError") == null
                && request.getAttribute("dateError") == null
                && request.getAttribute("classError") == null) {
            request.setAttribute("searchMessage",
                    "Demo search only: live train availability is not connected, so no train results are shown.");
        }
        showPage(request, response);
    }

    private void showPage(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        WebSupport.prepareView(request);
        request.getRequestDispatcher("/WEB-INF/views/home.jsp").forward(request, response);
    }
}
