package com.railgo.filter;

import com.railgo.model.PublicUser;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;

@WebFilter(
  urlPatterns = {
    "/dashboard",
    "/profile",
    "/history",
    "/confirmation",
    "/payment",
    "/book",
    "/booking",
    "/passenger-details",
    "/cancel"
  }
)
public class AuthenticationFilter implements Filter {

  @Override
  public void doFilter(
    ServletRequest request,
    ServletResponse response,
    FilterChain chain
  ) throws IOException, ServletException {
    HttpServletRequest httpRequest = (HttpServletRequest) request;
    HttpServletResponse httpResponse = (HttpServletResponse) response;
    HttpSession session = httpRequest.getSession(false);
    if (
      session == null ||
      !(session.getAttribute("currentUser") instanceof PublicUser)
    ) {
      httpResponse.sendRedirect(
        httpRequest.getContextPath() + "/login"
      );
      return;
    }
    chain.doFilter(request, response);
  }
}
