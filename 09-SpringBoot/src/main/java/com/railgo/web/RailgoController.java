package com.railgo.web;
import com.railgo.model.User; import com.railgo.repository.BookingRepository; import com.railgo.service.UserService; import jakarta.validation.Valid; import org.springframework.security.core.Authentication; import org.springframework.stereotype.Controller; import org.springframework.ui.Model; import org.springframework.validation.BindingResult; import org.springframework.web.bind.annotation.*;
@Controller public class RailgoController {
 private static final String[] CLASSES={"Sleeper","AC 3 Tier","AC 2 Tier","AC First Class","Chair Car"}; private final UserService service; private final BookingRepository bookings;
 public RailgoController(UserService service,BookingRepository bookings){this.service=service;this.bookings=bookings;}
 @GetMapping("/") String home(Model m){m.addAttribute("journey",new JourneyForm());m.addAttribute("classes",CLASSES);return "home";}
 @PostMapping("/search") String search(@Valid @ModelAttribute("journey") JourneyForm f,BindingResult r,Model m){if(f.getOrigin()!=null&&f.getDestination()!=null&&f.getOrigin().trim().equalsIgnoreCase(f.getDestination().trim()))r.rejectValue("destination","same","Choose a different destination station.");if(r.hasErrors()){m.addAttribute("classes",CLASSES);return "home";}m.addAttribute("journey",f);return "results";}
 @GetMapping("/signup") String signup(Model m){m.addAttribute("form",new SignupForm());return "signup";}
 @PostMapping("/signup") String signupPost(@Valid @ModelAttribute("form") SignupForm f,BindingResult r,Model m){if(!f.getPassword().equals(f.getConfirmPassword()))r.rejectValue("confirmPassword","mismatch","Passwords must match.");if(r.hasErrors())return "signup";try{service.register(f);}catch(IllegalArgumentException e){r.rejectValue("email","duplicate",e.getMessage());return "signup";}return "redirect:/login?registered";}
 @GetMapping("/login") String login(@RequestParam(required=false) String error,@RequestParam(required=false) String registered,Model m){if(error!=null)m.addAttribute("error","We could not sign you in with those details.");if(registered!=null)m.addAttribute("success","Your account is ready. Please sign in.");return "login";}
 @GetMapping("/dashboard") String dashboard(Authentication a,Model m){m.addAttribute("user",service.byEmail(a.getName()));return "dashboard";}
 @GetMapping("/history") String history(Authentication a,Model m){User u=service.byEmail(a.getName());m.addAttribute("bookings",bookings.findByUserOrderByCreatedAtDesc(u));return "history";}
 @GetMapping("/profile") String profile(Authentication a,Model m){User u=service.byEmail(a.getName());ProfileForm f=new ProfileForm();f.setName(u.getName());f.setMobile(u.getMobile());m.addAttribute("user",u);m.addAttribute("form",f);return "profile";}
 @PostMapping("/profile") String profilePost(@Valid @ModelAttribute("form") ProfileForm f,BindingResult r,Authentication a,Model m){User u=service.byEmail(a.getName());if(r.hasErrors()){m.addAttribute("user",u);return "profile";}service.update(u,f.getName(),f.getMobile());return "redirect:/profile?updated";}
 @GetMapping("/forgot-password") String forgot(){return "forgot-password";}
 @GetMapping("/error") String error(){return "error";}
}
