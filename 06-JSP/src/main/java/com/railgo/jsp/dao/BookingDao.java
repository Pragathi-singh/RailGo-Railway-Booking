package com.railgo.jsp.dao;

import com.railgo.jsp.model.Booking;
import com.railgo.jsp.util.Database;
import java.sql.*; import java.util.*;

public class BookingDao {
    public List<Booking> findForUser(long userId) throws SQLException {
        List<Booking> list = new ArrayList<>();
        try (Connection c = Database.connection(); PreparedStatement p = c.prepareStatement("SELECT id,origin,destination,journey_date,travel_class FROM bookings WHERE user_id=? ORDER BY journey_date DESC")) {
            p.setLong(1, userId); try (ResultSet r = p.executeQuery()) { while (r.next()) list.add(new Booking(r.getLong(1), r.getString(2), r.getString(3), r.getDate(4).toLocalDate(), r.getString(5))); }
        } return list;
    }
}
