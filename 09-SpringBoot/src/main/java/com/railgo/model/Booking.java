package com.railgo.model;

import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name = "bookings")
public class Booking {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name="user_id") private User user;
    @Column(nullable=false) private String origin;
    @Column(nullable=false) private String destination;
    @Column(name="journey_date", nullable=false) private LocalDate journeyDate;
    @Column(name="travel_class", nullable=false) private String travelClass;
    @Column(name="created_at", nullable=false) private Instant createdAt=Instant.now();
    protected Booking() {}
    public Long getId(){return id;} public String getOrigin(){return origin;} public String getDestination(){return destination;} public LocalDate getJourneyDate(){return journeyDate;} public String getTravelClass(){return travelClass;}
}
