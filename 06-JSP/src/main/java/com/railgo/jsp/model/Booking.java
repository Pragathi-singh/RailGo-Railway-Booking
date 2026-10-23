package com.railgo.jsp.model;

import java.time.LocalDate;

public record Booking(long id, String origin, String destination, LocalDate journeyDate, String travelClass) {}
