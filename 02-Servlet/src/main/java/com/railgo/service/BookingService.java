package com.railgo.service;

import com.railgo.dao.BookingDao;
import com.railgo.dao.TrainDao;
import com.railgo.model.Booking;
import com.railgo.model.TrainSchedule;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;

public final class BookingService {

  private final TrainDao trainDao = new TrainDao();
  private final BookingDao bookingDao = new BookingDao();

  public List<TrainSchedule> search(
    String source,
    String destination,
    LocalDate date,
    String travelClass
  ) throws SQLException {
    return trainDao.search(source, destination, date, travelClass);
  }

  public TrainSchedule schedule(long scheduleId) throws SQLException {
    return trainDao.findById(scheduleId);
  }

  public long createBooking(
    long userId,
    long scheduleId,
    List<BookingDao.PassengerInput> passengers,
    String paymentMethod
  ) throws SQLException {
    return bookingDao.createBooking(
      userId,
      scheduleId,
      passengers,
      paymentMethod
    );
  }

  public List<Booking> history(long userId) throws SQLException {
    return bookingDao.findByUser(userId);
  }

  public Booking ownedBooking(long bookingId, long userId)
    throws SQLException {
    return bookingDao.findOwned(bookingId, userId);
  }

  public boolean cancel(long bookingId, long userId) throws SQLException {
    return bookingDao.cancel(bookingId, userId);
  }
}
