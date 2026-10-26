package com.railgo.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 120) private String name;
    @Column(nullable = false, unique = true, length = 255) private String email;
    @Column(nullable = false, length = 30) private String mobile;
    @Column(name = "password_hash", nullable = false) private String passwordHash;
    @Column(name = "created_at", nullable = false) private Instant createdAt = Instant.now();
    protected User() {}
    public User(String name, String email, String mobile, String passwordHash) { this.name=name; this.email=email; this.mobile=mobile; this.passwordHash=passwordHash; }
    public Long getId(){return id;} public String getName(){return name;} public String getEmail(){return email;} public String getMobile(){return mobile;} public String getPasswordHash(){return passwordHash;}
    public void setName(String name){this.name=name;} public void setMobile(String mobile){this.mobile=mobile;}
}
