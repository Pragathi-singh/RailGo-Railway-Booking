package com.railgo.model;

public record User(
  long id,
  String fullName,
  String email,
  String mobile,
  String passwordHash
) {}
