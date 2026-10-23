package com.railgo.servlet;

import com.railgo.util.UserStore;
import com.railgo.util.WebSupport;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.regex.Pattern;

@WebServlet("/signup")
public class SignupServlet extends HttpServlet {
    private static final Pattern MOBILE = Pattern.compile("^[6-9][0-9]{9}$");
    private static final Pattern PASSWORD = Pattern.compile("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$");

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
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

        String name = WebSupport.value(request, "fullName");
        String email = WebSupport.value(request, "email");
        String mobile = WebSupport.value(request, "mobile").replaceAll("[\\s()-]", "");
        String password = request.getParameter("password");
        password = password == null ? "" : password;

        request.setAttribute("fullName", name);
        request.setAttribute("email", email);
        request.setAttribute("mobile", WebSupport.value(request, "mobile"));

        if (name.isBlank() || name.length() > 100) {
            request.setAttribute("nameError", "Enter your name (up to 100 characters).");
        }
        if (email.length() > 254 || !email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            request.setAttribute("emailError", "Enter a valid email address.");
        }
        if (!MOBILE.matcher(mobile).matches()) {
            request.setAttribute("mobileError", "Enter a valid 10-digit Indian mobile number.");
        }
        if (!PASSWORD.matcher(password).matches()) {
            request.setAttribute("passwordError", "Use at least 8 characters, including uppercase, lowercase, and a number.");
        }
        if (!password.equals(request.getParameter("confirmPassword"))) {
            request.setAttribute("confirmError", "Your passwords do not match.");
        }
        if (!"yes".equals(request.getParameter("terms"))) {
            request.setAttribute("termsError", "Please accept the terms and conditions to create an account.");
        }

        if (hasValidationErrors(request)) {
            showPage(request, response);
            return;
        }

        boolean registered;
        try {
            registered = UserStore.register(name, email, mobile, password);
        } catch (IllegalStateException exception) {
            getServletContext().log("RailGo account could not be created.", exception);
            request.setAttribute("formError", "Account creation is temporarily unavailable. Please try again.");
            showPage(request, response);
            return;
        }
        if (!registered) {
            request.setAttribute("emailError", "An account with this email already exists. Try logging in.");
            showPage(request, response);
            return;
        }

        WebSupport.flash(request.getSession(), "success", "Your RailGo account is ready. Please sign in.");
        response.sendRedirect(request.getContextPath() + "/login");
    }

    private boolean hasValidationErrors(HttpServletRequest request) {
        return request.getAttribute("nameError") != null
                || request.getAttribute("emailError") != null
                || request.getAttribute("mobileError") != null
                || request.getAttribute("passwordError") != null
                || request.getAttribute("confirmError") != null
                || request.getAttribute("termsError") != null;
    }

    private void showPage(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        WebSupport.prepareView(request);
        request.getRequestDispatcher("/WEB-INF/views/signup.jsp").forward(request, response);
    }
}
