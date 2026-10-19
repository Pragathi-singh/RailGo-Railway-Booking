package com.railgo.util;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import java.security.SecureRandom;
import java.util.Base64;

public final class WebSupport {
    private static final String CSRF_ATTRIBUTE = "csrfToken";
    private static final SecureRandom RANDOM = new SecureRandom();

    private WebSupport() {
    }

    public static String csrfToken(HttpSession session) {
        Object current = session.getAttribute(CSRF_ATTRIBUTE);
        if (current instanceof String token) {
            return token;
        }
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        session.setAttribute(CSRF_ATTRIBUTE, token);
        return token;
    }

    public static boolean validCsrf(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        String submitted = request.getParameter("csrfToken");
        Object expected = session == null ? null : session.getAttribute(CSRF_ATTRIBUTE);
        return submitted != null && expected instanceof String token
                && java.security.MessageDigest.isEqual(
                submitted.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                token.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    public static void prepareView(HttpServletRequest request) {
        HttpSession session = request.getSession();
        request.setAttribute(CSRF_ATTRIBUTE, csrfToken(session));
        request.setAttribute("currentUser", session.getAttribute("currentUser"));
    }

    public static void flash(HttpSession session, String type, String message) {
        session.setAttribute("flashType", type);
        session.setAttribute("flashMessage", message);
    }

    public static void consumeFlash(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            return;
        }
        request.setAttribute("flashType", session.getAttribute("flashType"));
        request.setAttribute("flashMessage", session.getAttribute("flashMessage"));
        session.removeAttribute("flashType");
        session.removeAttribute("flashMessage");
    }

    public static String value(HttpServletRequest request, String name) {
        String value = request.getParameter(name);
        return value == null ? "" : value.trim();
    }

    public static void invalidCsrf(HttpServletRequest request, jakarta.servlet.http.HttpServletResponse response)
            throws java.io.IOException {
        response.sendError(jakarta.servlet.http.HttpServletResponse.SC_FORBIDDEN,
                "Your session expired. Return to the page and try again.");
    }
}
