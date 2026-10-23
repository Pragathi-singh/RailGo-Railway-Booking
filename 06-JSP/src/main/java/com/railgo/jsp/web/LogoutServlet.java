package com.railgo.jsp.web;
import jakarta.servlet.annotation.WebServlet; import jakarta.servlet.http.*;
@WebServlet("/logout")
public class LogoutServlet extends BaseServlet {
    protected void doPost(HttpServletRequest r,HttpServletResponse s)throws java.io.IOException{if(!csrf(r)){s.sendError(403);return;}r.getSession().invalidate();s.sendRedirect(r.getContextPath()+"/");}
    protected void doGet(HttpServletRequest r,HttpServletResponse s)throws java.io.IOException{s.sendError(405);}
}
