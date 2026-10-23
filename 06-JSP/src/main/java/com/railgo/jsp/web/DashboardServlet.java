package com.railgo.jsp.web;
import jakarta.servlet.annotation.WebServlet; import jakarta.servlet.http.*; import jakarta.servlet.*;
@WebServlet("/dashboard")
public class DashboardServlet extends BaseServlet { protected void doGet(HttpServletRequest r,HttpServletResponse s)throws ServletException, java.io.IOException{r.setAttribute("user",user(r));view(r,s,"dashboard.jsp");} }
