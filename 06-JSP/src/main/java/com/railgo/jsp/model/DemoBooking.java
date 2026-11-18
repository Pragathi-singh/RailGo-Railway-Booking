package com.railgo.jsp.model;

import java.io.Serializable;
import java.time.LocalDate;

public record DemoBooking(
  String pnr,
  String origin,
  String destination,
  LocalDate journeyDate,
  String travelClass,
  String passengerName,
  int passengerAge,
  String passengerGender,
  String status
) implements Serializable {}
