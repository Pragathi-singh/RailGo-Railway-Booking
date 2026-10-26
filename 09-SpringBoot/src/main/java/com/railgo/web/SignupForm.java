package com.railgo.web;
import jakarta.validation.constraints.*;
public class SignupForm {
 @NotBlank private String name; @NotBlank @Email private String email; @NotBlank @Pattern(regexp="[0-9+() -]{7,20}") private String mobile;
 @NotBlank @Size(min=8) private String password; @NotBlank private String confirmPassword;
 public String getName(){return name;} public void setName(String v){name=v;} public String getEmail(){return email;} public void setEmail(String v){email=v;} public String getMobile(){return mobile;} public void setMobile(String v){mobile=v;} public String getPassword(){return password;} public void setPassword(String v){password=v;} public String getConfirmPassword(){return confirmPassword;} public void setConfirmPassword(String v){confirmPassword=v;}
}
