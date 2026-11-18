package com.railgo.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record TrainSchedule(
  long id,
  long trainId,
  String trainNumber,
  String trainName,
  String source,
  String destination,
  LocalDate journeyDate,
  LocalTime departureTime,
  LocalTime arrivalTime,
  String duration,
  String travelClass,
  int totalSeats,
  int availableSeats,
  BigDecimal fare
) {
  public long getId() { return id; }
  public long getTrainId() { return trainId; }
  public String getTrainNumber() { return trainNumber; }
  public String getTrainName() { return trainName; }
  public String getSource() { return source; }
  public String getDestination() { return destination; }
  public LocalDate getJourneyDate() { return journeyDate; }
  public LocalTime getDepartureTime() { return departureTime; }
  public LocalTime getArrivalTime() { return arrivalTime; }
  public String getDuration() { return duration; }
  public String getTravelClass() { return travelClass; }
  public int getTotalSeats() { return totalSeats; }
  public int getAvailableSeats() { return availableSeats; }
  public BigDecimal getFare() { return fare; }
}
