package com.railgo.jsp.web;
import com.railgo.jsp.dao.BookingDao; import jakarta.servlet.annotation.WebServlet; import jakarta.servlet.http.*; import jakarta.servlet.*;
@WebServlet("/history")
public class HistoryServlet extends BaseServlet { protected void doGet(HttpServletRequest r,HttpServletResponse s)throws ServletException, java.io.IOException{try{r.setAttribute("bookings",new BookingDao().findForUser(user(r).id()));view(r,s,"history.jsp");}catch(java.sql.SQLException e){throw new ServletException("Booking history could not be loaded.",e);}} }
