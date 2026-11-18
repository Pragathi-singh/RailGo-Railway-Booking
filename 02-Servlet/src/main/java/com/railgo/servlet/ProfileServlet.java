package com.railgo.servlet;

import com.railgo.model.PublicUser;
import com.railgo.dao.UserDao;
import com.railgo.util.WebSupport;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/profile")
public class ProfileServlet extends HttpServlet {

  protected void doGet(HttpServletRequest r, HttpServletResponse s)
    throws ServletException, IOException
  {
    if (
      !(
        r.getSession(false) != null &&
        r.getSession(false).getAttribute("currentUser") instanceof PublicUser
      )
    ) {
      s.sendRedirect(r.getContextPath() + "/login");
      return;
    }
    PublicUser user = (PublicUser) r.getSession().getAttribute("currentUser");
    r.setAttribute("user", user);
    WebSupport.consumeFlash(r);
    WebSupport.prepareView(r);
    r.getRequestDispatcher("/WEB-INF/views/profile.jsp").forward(r, s);
  }

  protected void doPost(
    HttpServletRequest r,
    HttpServletResponse s
  ) throws ServletException, IOException {
    if (!WebSupport.validCsrf(r)) {
      WebSupport.invalidCsrf(r, s);
      return;
    }
    PublicUser user = (PublicUser) r.getSession().getAttribute("currentUser");
    String name = WebSupport.value(r, "fullName");
    String mobile = WebSupport.value(r, "mobile").replaceAll("[\\s()-]", "");
    if (name.isBlank() || name.length() > 100) {
      r.setAttribute("profileError", "Enter a valid name.");
      doGet(r, s);
      return;
    }
    if (!mobile.matches("[6-9][0-9]{9}")) {
      r.setAttribute("profileError", "Enter a valid 10-digit mobile number.");
      doGet(r, s);
      return;
    }
    try {
      new UserDao().updateProfile(user.id(), name, mobile);
      r.getSession().setAttribute(
        "currentUser",
        new PublicUser(user.id(), name, user.email(), mobile)
      );
      WebSupport.flash(
        r.getSession(),
        "success",
        "Your profile was saved."
      );
      s.sendRedirect(r.getContextPath() + "/profile");
    } catch (Exception exception) {
      r.setAttribute("profileError", "Profile could not be saved.");
      doGet(r, s);
      return;
    }
  }
}
