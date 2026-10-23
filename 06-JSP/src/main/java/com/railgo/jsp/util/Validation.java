package com.railgo.jsp.util;

import java.time.LocalDate;
import java.util.*;
import java.util.regex.Pattern;

public final class Validation {
    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final Pattern MOBILE = Pattern.compile("^[6-9]\\d{9}$");
    private static final Set<String> CLASSES = Set.of("Sleeper", "AC 3 Tier", "AC 2 Tier", "AC First Class", "Chair Car");
    private Validation() {}
    public static Map<String, String> signup(String name, String email, String mobile, String password, String confirm) {
        Map<String, String> errors = new LinkedHashMap<>();
        if (name == null || name.trim().isEmpty() || name.trim().length() > 100) errors.put("fullName", "Enter your name (up to 100 characters).");
        if (email == null || !EMAIL.matcher(email.trim()).matches() || email.trim().length() > 254) errors.put("email", "Enter a valid email address.");
        String normalizedMobile = mobile == null ? "" : mobile.replaceAll("[\\s()-]", "");
        if (!MOBILE.matcher(normalizedMobile).matches()) errors.put("mobile", "Enter a valid 10-digit Indian mobile number.");
        if (password == null || password.length() < 8 || !password.matches(".*[a-z].*") || !password.matches(".*[A-Z].*") || !password.matches(".*\\d.*")) errors.put("password", "Use 8+ characters with uppercase, lowercase and a number.");
        if (!Objects.equals(password, confirm)) errors.put("confirmPassword", "Your passwords do not match.");
        return errors;
    }
    public static Map<String, String> journey(String from, String to, String date, String travelClass) {
        Map<String, String> errors = new LinkedHashMap<>();
        if (from == null || from.trim().isEmpty() || from.trim().length() > 120) errors.put("from", "Enter a departure station.");
        if (to == null || to.trim().isEmpty() || to.trim().length() > 120) errors.put("to", "Enter a destination station.");
        if (from != null && to != null && !from.isBlank() && from.trim().equalsIgnoreCase(to.trim())) errors.put("to", "Choose a different destination station.");
        try { if (date == null || LocalDate.parse(date).isBefore(LocalDate.now())) errors.put("date", "Choose today or a future journey date."); }
        catch (RuntimeException e) { errors.put("date", "Choose a valid journey date."); }
        if (!CLASSES.contains(travelClass)) errors.put("travelClass", "Choose a valid travel class.");
        return errors;
    }
    public static boolean validClass(String value) { return CLASSES.contains(value); }
}
