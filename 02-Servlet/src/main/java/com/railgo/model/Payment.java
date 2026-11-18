package com.railgo.model;

import java.math.BigDecimal;

public record Payment(
  long id,
  long bookingId,
  BigDecimal amount,
  String paymentMethod,
  String paymentStatus,
  String transactionReference
) {
  public long getId() { return id; }
  public long getBookingId() { return bookingId; }
  public BigDecimal getAmount() { return amount; }
  public String getPaymentMethod() { return paymentMethod; }
  public String getPaymentStatus() { return paymentStatus; }
  public String getTransactionReference() { return transactionReference; }
}
