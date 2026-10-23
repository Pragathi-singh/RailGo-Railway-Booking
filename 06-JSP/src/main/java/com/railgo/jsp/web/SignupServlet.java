package com.railgo.jsp.web;
import com.railgo.jsp.dao.UserDao; import com.railgo.jsp.model.User; import com.railgo.jsp.util.*;
import jakarta.servlet.annotation.WebServlet; import jakarta.servlet.http.*; import jakarta.servlet.*; import java.sql.SQLException; import java.util.*;
@WebServlet("/signup")
public class SignupServlet extends BaseServlet {
    protected void doGet(HttpServletRequest r,HttpServletResponse s)throws ServletException, java.io.IOException{ r.setAttribute("csrf",Csrf.token(r.getSession()));view(r,s,"signup.jsp");}
    protected void doPost(HttpServletRequest r,HttpServletResponse s)throws ServletException, java.io.IOException{
        if(!csrf(r)){s.sendError(403);return;} String name=r.getParameter("fullName"),email=r.getParameter("email"),mobile=r.getParameter("mobile"),pass=r.getParameter("password"),confirm=r.getParameter("confirmPassword");
        Map<String,String> errors=Validation.signup(name,email,mobile,pass,confirm); UserDao dao=new UserDao();
        if(errors.isEmpty()) try { if(dao.findByEmail(email.trim().toLowerCase())!=null) errors.put("email","An account with this email already exists. Try signing in instead."); } catch(SQLException e){ throw new ServletException("Account lookup failed.",e); }
        if(!errors.isEmpty()){r.setAttribute("errors",errors);r.setAttribute("fullName",name);r.setAttribute("email",email);r.setAttribute("mobile",mobile);r.setAttribute("csrf",Csrf.token(r.getSession()));view(r,s,"signup.jsp");return;}
        try { User user=dao.create(name.trim(),email.trim().toLowerCase(),mobile.replaceAll("[\\s()-]",""),PasswordHasher.hash(pass)); r.getSession().setAttribute("user",user); r.changeSessionId(); s.sendRedirect(r.getContextPath()+"/dashboard"); } catch(SQLException e){ if(e.getErrorCode()==1062){r.setAttribute("errors",Map.of("email","An account with this email already exists. Try signing in instead."));r.setAttribute("csrf",Csrf.token(r.getSession()));view(r,s,"signup.jsp");}else throw new ServletException("Account creation failed.",e); }
    }
}
