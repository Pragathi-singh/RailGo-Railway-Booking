package com.railgo.servlet;

import com.railgo.model.User;
import com.railgo.model.PublicUser;
import com.railgo.util.UserStore;
import com.railgo.util.WebSupport;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.util.Optional;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {
    private static final int MAX_ATTEMPTS = 5;
    private static final long WINDOW_MILLIS = 10 * 60 * 1000L;

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

        String email = WebSupport.value(request, "email");
        String password = request.getParameter("password");
        password = password == null ? "" : password;
        request.setAttribute("email", email);

        HttpSession session = request.getSession();
        long now = System.currentTimeMillis();
        long windowStart = session.getAttribute("loginWindowStart") instanceof Long start ? start : now;
        int attempts = session.getAttribute("loginAttempts") instanceof Integer count ? count : 0;
        if (now - windowStart >= WINDOW_MILLIS) {
            windowStart = now;
            attempts = 0;
        }

        if (attempts >= MAX_ATTEMPTS) {
            request.setAttribute("formError", "Too many unsuccessful attempts. Wait a few minutes and try again.");
            showPage(request, response);
            return;
        }
        if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$") || email.length() > 254 || password.isBlank()) {
            request.setAttribute("formError", "Enter a valid email address and password.");
            showPage(request, response);
            return;
        }

        Optional<User> authenticated = UserStore.authenticate(email, password);
        if (authenticated.isEmpty()) {
            session.setAttribute("loginWindowStart", windowStart);
            session.setAttribute("loginAttempts", attempts + 1);
            request.setAttribute("formError", "We could not log you in with those details. Check them and try again.");
            showPage(request, response);
            return;
        }

        request.changeSessionId();
        session = request.getSession(false);
        session.removeAttribute("loginAttempts");
        session.removeAttribute("loginWindowStart");
        User authenticatedUser = authenticated.get();
        session.setAttribute("currentUser",
                new PublicUser(authenticatedUser.fullName(), authenticatedUser.email(), authenticatedUser.mobile()));
        session.removeAttribute("csrfToken");
        WebSupport.flash(session, "success", "Welcome back to RailGo.");
        response.sendRedirect(request.getContextPath() + "/dashboard");
    }

    private void showPage(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        WebSupport.prepareView(request);
        request.getRequestDispatcher("/WEB-INF/views/login.jsp").forward(request, response);
    }
}
