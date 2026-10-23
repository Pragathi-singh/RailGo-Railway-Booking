package com.railgo.jsp.web;
import jakarta.servlet.annotation.WebServlet; import jakarta.servlet.http.*; import jakarta.servlet.*;
@WebServlet("/forgot-password")
public class ForgotPasswordServlet extends BaseServlet { protected void doGet(HttpServletRequest r,HttpServletResponse s)throws ServletException, java.io.IOException{view(r,s,"forgot-password.jsp");} protected void doPost(HttpServletRequest r,HttpServletResponse s)throws ServletException, java.io.IOException{r.setAttribute("message","Password recovery is not available from this installation. Please contact the site administrator.");view(r,s,"forgot-password.jsp");} }
