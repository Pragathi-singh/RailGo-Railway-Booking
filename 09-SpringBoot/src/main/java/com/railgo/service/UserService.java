package com.railgo.service;
import com.railgo.model.User; import com.railgo.repository.UserRepository; import com.railgo.web.SignupForm; import org.springframework.security.crypto.password.PasswordEncoder; import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional;
@Service public class UserService {
 private final UserRepository users; private final PasswordEncoder encoder;
 public UserService(UserRepository users,PasswordEncoder encoder){this.users=users;this.encoder=encoder;}
 @Transactional public User register(SignupForm f){String email=f.getEmail().trim().toLowerCase(); if(users.existsByEmailIgnoreCase(email)) throw new IllegalArgumentException("An account with this email already exists."); if(!f.getPassword().equals(f.getConfirmPassword())) throw new IllegalArgumentException("Passwords must match."); return users.save(new User(f.getName().trim(),email,f.getMobile().trim(),encoder.encode(f.getPassword())));}
 public User byEmail(String email){return users.findByEmailIgnoreCase(email).orElseThrow();}
 @Transactional public void update(User u,String name,String mobile){u.setName(name.trim());u.setMobile(mobile.trim());users.save(u);}
}
