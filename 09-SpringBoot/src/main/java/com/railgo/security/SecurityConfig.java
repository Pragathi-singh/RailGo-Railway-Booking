package com.railgo.security;
import com.railgo.service.UserService; import org.springframework.context.annotation.*; import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity; import org.springframework.security.config.annotation.web.builders.HttpSecurity; import org.springframework.security.core.userdetails.*; import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; import org.springframework.security.crypto.password.PasswordEncoder; import org.springframework.security.web.SecurityFilterChain;
@Configuration @EnableMethodSecurity public class SecurityConfig {
 @Bean PasswordEncoder passwordEncoder(){return new BCryptPasswordEncoder();}
 @Bean UserDetailsService userDetailsService(UserService service){return email -> {var u=service.byEmail(email); return User.withUsername(u.getEmail()).password(u.getPasswordHash()).roles("USER").build();};}
 @Bean SecurityFilterChain filterChain(HttpSecurity http)throws Exception{return http.authorizeHttpRequests(a->a.requestMatchers("/","/search","/signup","/login","/forgot-password","/css/**","/js/**","/images/**","/error").permitAll().anyRequest().authenticated()).formLogin(f->f.loginPage("/login").defaultSuccessUrl("/dashboard",true).permitAll()).logout(l->l.logoutUrl("/logout").logoutSuccessUrl("/").permitAll()).build();}
}
