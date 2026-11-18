package com.railgo.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record Booking(
  long id,
  long userId,
  long scheduleId,
  String pnr,
  String status,
  BigDecimal totalAmount,
  LocalDateTime createdAt,
  String trainNumber,
  String trainName,
  String source,
  String destination,
  LocalDate journeyDate,
  String travelClass,
  String departureTime,
  String arrivalTime,
  String duration,
  List<Passenger> passengers,
  Payment payment
) {
  public long getId() { return id; }
  public long getUserId() { return userId; }
  public long getScheduleId() { return scheduleId; }
  public String getPnr() { return pnr; }
  public String getStatus() { return status; }
  public BigDecimal getTotalAmount() { return totalAmount; }
  public LocalDateTime getCreatedAt() { return createdAt; }
  public String getTrainNumber() { return trainNumber; }
  public String getTrainName() { return trainName; }
  public String getSource() { return source; }
  public String getDestination() { return destination; }
  public LocalDate getJourneyDate() { return journeyDate; }
  public String getTravelClass() { return travelClass; }
  public String getDepartureTime() { return departureTime; }
  public String getArrivalTime() { return arrivalTime; }
  public String getDuration() { return duration; }
  public List<Passenger> getPassengers() { return passengers; }
  public Payment getPayment() { return payment; }
}
