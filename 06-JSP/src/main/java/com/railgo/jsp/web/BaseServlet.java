package com.railgo.jsp.web;
import com.railgo.jsp.model.User;
import jakarta.servlet.http.*;
import jakarta.servlet.*;
import java.io.IOException;
public abstract class BaseServlet extends HttpServlet {
    protected User user(HttpServletRequest r) { return (User) r.getSession().getAttribute("user"); }
    protected void view(HttpServletRequest r, HttpServletResponse s, String page) throws ServletException, IOException { r.getRequestDispatcher("/WEB-INF/views/" + page).forward(r,s); }
    protected boolean csrf(HttpServletRequest r) { return com.railgo.jsp.util.Csrf.valid(r.getSession(), r.getParameter("csrf")); }
}
