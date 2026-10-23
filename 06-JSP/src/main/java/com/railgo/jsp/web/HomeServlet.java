package com.railgo.jsp.web;
import com.railgo.jsp.util.Validation;
import jakarta.servlet.annotation.WebServlet; import jakarta.servlet.http.*; import jakarta.servlet.*; import java.io.IOException; import java.time.LocalDate; import java.time.format.DateTimeFormatter; import java.util.*;
@WebServlet({"/home","/search"})
public class HomeServlet extends BaseServlet {
    protected void doGet(HttpServletRequest r,HttpServletResponse s) throws ServletException, IOException { r.setAttribute("csrf", com.railgo.jsp.util.Csrf.token(r.getSession())); view(r,s,"home.jsp"); }
    protected void doPost(HttpServletRequest r,HttpServletResponse s) throws ServletException, IOException {
        if (!csrf(r)) { s.sendError(403); return; }
        String from=r.getParameter("from"),to=r.getParameter("to"),date=r.getParameter("journeyDate"),clazz=r.getParameter("travelClass");
        Map<String,String> errors=Validation.journey(from,to,date,clazz); r.setAttribute("from",from);r.setAttribute("to",to);r.setAttribute("journeyDate",date);r.setAttribute("travelClass",clazz);r.setAttribute("errors",errors);r.setAttribute("csrf",com.railgo.jsp.util.Csrf.token(r.getSession()));
        if(errors.isEmpty()) { r.setAttribute("result","Live train results are not available for "+from+" to "+to+" on "+LocalDate.parse(date).format(DateTimeFormatter.ofPattern("dd MMMM yyyy"))+" right now. Please try another date or route."); }
        view(r,s,"search-results.jsp");
    }
}
