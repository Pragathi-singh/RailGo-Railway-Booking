package com.railgo.service;

import com.railgo.model.User;
import com.railgo.util.UserStore;
import java.util.Optional;

public final class AuthService {

  public boolean register(
    String name,
    String email,
    String mobile,
    String password
  ) {
    return UserStore.register(name, email, mobile, password);
  }

  public Optional<User> authenticate(String email, String password) {
    return UserStore.authenticate(email, password);
  }
}
