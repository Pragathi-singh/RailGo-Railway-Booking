package com.railgo.jsp.web;
import com.railgo.jsp.dao.UserDao; import com.railgo.jsp.model.User; import com.railgo.jsp.util.*;
import jakarta.servlet.annotation.WebServlet; import jakarta.servlet.http.*; import jakarta.servlet.*; import java.util.*;
@WebServlet("/login")
public class LoginServlet extends BaseServlet {
    protected void doGet(HttpServletRequest r,HttpServletResponse s)throws ServletException, java.io.IOException{r.setAttribute("csrf",Csrf.token(r.getSession()));view(r,s,"login.jsp");}
    protected void doPost(HttpServletRequest r,HttpServletResponse s)throws ServletException, java.io.IOException{
        if(!csrf(r)){s.sendError(403);return;} String email=r.getParameter("email"),pass=r.getParameter("password"); User user; try { user=new UserDao().findByEmail(email==null?"":email.trim().toLowerCase()); } catch(java.sql.SQLException e){throw new ServletException("Login is temporarily unavailable.",e);}
        if(user==null||pass==null||!PasswordHasher.matches(pass,user.passwordHash())){r.setAttribute("error","We could not match that email and password. Check your details and try again.");r.setAttribute("csrf",Csrf.token(r.getSession()));view(r,s,"login.jsp");return;}
        r.getSession().invalidate(); HttpSession session=r.getSession(true); session.setAttribute("user",user); Csrf.token(session); String next=r.getParameter("next"); s.sendRedirect(r.getContextPath()+"/dashboard");
    }
}
