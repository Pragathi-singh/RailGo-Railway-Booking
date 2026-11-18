package com.railgo.model;

public record PublicUser(
  long id,
  String fullName,
  String email,
  String mobile
) {
  public long getId() { return id; }
  public String getFullName() { return fullName; }
  public String getEmail() { return email; }
  public String getMobile() { return mobile; }
}
