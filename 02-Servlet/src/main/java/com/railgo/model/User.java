package com.railgo.model;

public record User(String fullName, String email, String mobile, String passwordHash) {
}
