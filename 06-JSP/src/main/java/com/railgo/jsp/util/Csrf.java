package com.railgo.jsp.util;

import jakarta.servlet.http.HttpSession;
import java.security.SecureRandom;
import java.util.Base64;

public final class Csrf {
    private static final String KEY = "csrfToken";
    private Csrf() {}
    public static String token(HttpSession session) {
        Object existing = session.getAttribute(KEY);
        if (existing instanceof String value) return value;
        byte[] bytes = new byte[32]; new SecureRandom().nextBytes(bytes);
        String value = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        session.setAttribute(KEY, value); return value;
    }
    public static boolean valid(HttpSession session, String submitted) {
        Object expected = session.getAttribute(KEY);
        return expected instanceof String && submitted != null
                && java.security.MessageDigest.isEqual(((String) expected).getBytes(), submitted.getBytes());
    }
}
