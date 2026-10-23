package com.railgo.jsp.web;
import com.railgo.jsp.dao.UserDao; import com.railgo.jsp.model.User; import com.railgo.jsp.util.*;
import jakarta.servlet.annotation.WebServlet; import jakarta.servlet.http.*; import jakarta.servlet.*; import java.util.*;
@WebServlet("/profile")
public class ProfileServlet extends BaseServlet {
    protected void doGet(HttpServletRequest r,HttpServletResponse s)throws ServletException, java.io.IOException{r.setAttribute("user",user(r));r.setAttribute("csrf",Csrf.token(r.getSession()));view(r,s,"profile.jsp");}
    protected void doPost(HttpServletRequest r,HttpServletResponse s)throws ServletException, java.io.IOException{if(!csrf(r)){s.sendError(403);return;}User old=user(r);String name=r.getParameter("fullName"),mobile=r.getParameter("mobile");Map<String,String> e=Validation.signup(name,old.email(),mobile,"ValidPass1","ValidPass1");e.remove("email");e.remove("password");e.remove("confirmPassword");if(!e.isEmpty()){r.setAttribute("errors",e);r.setAttribute("user",old);r.setAttribute("csrf",Csrf.token(r.getSession()));view(r,s,"profile.jsp");return;}try{new UserDao().updateProfile(old.id(),name.trim(),mobile.replaceAll("[\\s()-]",""));}catch(java.sql.SQLException ex){throw new ServletException("Profile update failed.",ex);}r.getSession().setAttribute("user",new User(old.id(),name.trim(),old.email(),mobile.replaceAll("[\\s()-]",""),old.passwordHash()));r.setAttribute("success","Your profile has been updated.");doGet(r,s);}
}
