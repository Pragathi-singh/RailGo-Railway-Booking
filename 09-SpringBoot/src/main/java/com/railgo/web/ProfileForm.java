package com.railgo.web;
import jakarta.validation.constraints.*;
public class ProfileForm { @NotBlank private String name; @NotBlank @Pattern(regexp="[0-9+() -]{7,20}") private String mobile; public String getName(){return name;} public void setName(String v){name=v;} public String getMobile(){return mobile;} public void setMobile(String v){mobile=v;} }
