package com.railgo.model;

public record Passenger(
  long id,
  long bookingId,
  String passengerName,
  int age,
  String gender
) {
  public long getId() { return id; }
  public long getBookingId() { return bookingId; }
  public String getPassengerName() { return passengerName; }
  public int getAge() { return age; }
  public String getGender() { return gender; }
}
