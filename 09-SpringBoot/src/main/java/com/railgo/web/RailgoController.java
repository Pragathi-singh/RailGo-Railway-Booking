package com.railgo.web;

import com.railgo.model.User;
import com.railgo.service.UserService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import java.util.*;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

@Controller
public class RailgoController {

  private static final String[] CLASSES = {
    "Sleeper",
    "AC 3 Tier",
    "AC 2 Tier",
    "AC First Class",
    "Chair Car",
  };
  private final UserService service;

  public RailgoController(UserService service) {
    this.service = service;
  }

  @GetMapping("/")
  String home(Model m) {
    m.addAttribute("journey", new JourneyForm());
    m.addAttribute("classes", CLASSES);
    return "home";
  }

  @PostMapping("/search")
  String search(
    @Valid @ModelAttribute("journey") JourneyForm f,
    BindingResult r,
    Model m,
    HttpSession session
  ) {
    if (
      f.getOrigin() != null &&
      f.getDestination() != null &&
      f.getOrigin().trim().equalsIgnoreCase(f.getDestination().trim())
    ) r.rejectValue(
      "destination",
      "same",
      "Choose a different destination station."
    );
    if (r.hasErrors()) {
      m.addAttribute("classes", CLASSES);
      return "home";
    }
    session.setAttribute("journey", f);
    return "redirect:/results";
  }

  @GetMapping("/results")
  String results(HttpSession session, Model m) {
    m.addAttribute("journey", session.getAttribute("journey"));
    return "results";
  }

  @GetMapping("/book")
  String book(HttpSession session, Model m) {
    m.addAttribute("journey", session.getAttribute("journey"));
    return "booking";
  }

  @PostMapping("/book")
  String bookPost(
    @RequestParam String passengerName,
    @RequestParam int passengerAge,
    @RequestParam String passengerGender,
    HttpSession session,
    Model m
  ) {
    Object raw = session.getAttribute("journey");
    if (
      !(raw instanceof JourneyForm j) ||
      passengerName.trim().length() < 2 ||
      passengerAge < 1 ||
      passengerAge > 120 ||
      !Set.of("Female", "Male", "Other").contains(passengerGender)
    ) {
      m.addAttribute("journey", raw);
      m.addAttribute("error", "Enter valid passenger details.");
      return "booking";
    }
    DemoBooking b = new DemoBooking(
      "RG" +
        UUID.randomUUID()
          .toString()
          .replace("-", "")
          .substring(0, 8)
          .toUpperCase(),
      j.getOrigin(),
      j.getDestination(),
      j.getJourneyDate(),
      j.getTravelClass(),
      passengerName.trim(),
      passengerAge,
      passengerGender,
      "CONFIRMED"
    );
    List<DemoBooking> list = bookings(session);
    list.add(b);
    session.setAttribute("lastBooking", b);
    return "redirect:/confirmation";
  }

  @GetMapping("/confirmation")
  String confirmation(HttpSession s, Model m) {
    m.addAttribute("booking", s.getAttribute("lastBooking"));
    return "confirmation";
  }

  @GetMapping("/signup")
  String signup(Model m) {
    m.addAttribute("form", new SignupForm());
    return "signup";
  }

  @PostMapping("/signup")
  String signupPost(
    @Valid @ModelAttribute("form") SignupForm f,
    BindingResult r,
    Model m
  ) {
    if (!f.getPassword().equals(f.getConfirmPassword())) r.rejectValue(
      "confirmPassword",
      "mismatch",
      "Passwords must match."
    );
    if (r.hasErrors()) return "signup";
    try {
      service.register(f);
    } catch (IllegalArgumentException e) {
      r.rejectValue("email", "duplicate", e.getMessage());
      return "signup";
    }
    return "redirect:/login?registered";
  }

  @GetMapping("/login")
  String login(
    @RequestParam(required = false) String error,
    @RequestParam(required = false) String registered,
    Model m
  ) {
    if (error != null) m.addAttribute(
      "error",
      "We could not sign you in with those details."
    );
    if (registered != null) m.addAttribute(
      "success",
      "Your account is ready. Please sign in."
    );
    return "login";
  }

  @GetMapping("/dashboard")
  String dashboard(Authentication a, Model m) {
    m.addAttribute("user", service.byEmail(a.getName()));
    return "dashboard";
  }

  @GetMapping("/history")
  String history(HttpSession s, Model m) {
    m.addAttribute("bookings", bookings(s));
    return "history";
  }

  @PostMapping("/history/cancel")
  String cancel(@RequestParam String pnr, HttpSession s) {
    bookings(s).removeIf(b -> b.pnr().equals(pnr));
    return "redirect:/history";
  }

  @GetMapping("/profile")
  String profile(Authentication a, Model m) {
    User u = service.byEmail(a.getName());
    ProfileForm f = new ProfileForm();
    f.setName(u.getName());
    f.setMobile(u.getMobile());
    m.addAttribute("user", u);
    m.addAttribute("form", f);
    return "profile";
  }

  @PostMapping("/profile")
  String profilePost(
    @Valid @ModelAttribute("form") ProfileForm f,
    BindingResult r,
    Authentication a,
    Model m
  ) {
    User u = service.byEmail(a.getName());
    if (r.hasErrors()) {
      m.addAttribute("user", u);
      return "profile";
    }
    service.update(u, f.getName(), f.getMobile());
    return "redirect:/profile?updated";
  }

  @GetMapping("/forgot-password")
  String forgot() {
    return "forgot-password";
  }

  @GetMapping("/error")
  String error() {
    return "error";
  }

  @SuppressWarnings("unchecked")
  private List<DemoBooking> bookings(HttpSession s) {
    Object v = s.getAttribute("demoBookings");
    if (v instanceof List<?>) return (List<DemoBooking>) v;
    List<DemoBooking> x = new ArrayList<>();
    s.setAttribute("demoBookings", x);
    return x;
  }
}
