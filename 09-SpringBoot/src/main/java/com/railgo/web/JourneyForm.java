package com.railgo.web;
import jakarta.validation.constraints.*; import java.time.LocalDate;
public class JourneyForm {
 @NotBlank private String origin; @NotBlank private String destination; @NotNull @FutureOrPresent private LocalDate journeyDate; @NotBlank private String travelClass="Sleeper";
 public String getOrigin(){return origin;} public void setOrigin(String v){origin=v;} public String getDestination(){return destination;} public void setDestination(String v){destination=v;} public LocalDate getJourneyDate(){return journeyDate;} public void setJourneyDate(LocalDate v){journeyDate=v;} public String getTravelClass(){return travelClass;} public void setTravelClass(String v){travelClass=v;}
}
