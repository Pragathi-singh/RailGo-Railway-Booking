package com.railgo.dao;

import com.railgo.model.Booking;
import com.railgo.model.Passenger;
import com.railgo.model.Payment;
import com.railgo.util.DatabaseConnection;
import com.railgo.util.PnrGenerator;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public final class BookingDao {

  public record PassengerInput(
    String name,
    int age,
    String gender
  ) {}

  public long createBooking(
    long userId,
    long scheduleId,
    List<PassengerInput> passengers,
    String paymentMethod
  ) throws SQLException {
    if (passengers.isEmpty() || passengers.size() > 6) {
      throw new SQLException("Invalid passenger count.");
    }

    try (Connection connection = DatabaseConnection.getConnection()) {
      connection.setAutoCommit(false);
      try {
        String scheduleSql =
          """
          SELECT s.id,s.available_seats,s.fare,t.train_number,t.train_name,
                 t.source,t.destination,s.journey_date,s.travel_class,
                 s.departure_time,s.arrival_time,s.duration
          FROM train_schedules s
          JOIN trains t ON t.id=s.train_id
          WHERE s.id=? FOR UPDATE
          """;
        BigDecimal fare;
        try (
          PreparedStatement statement = connection.prepareStatement(scheduleSql)
        ) {
          statement.setLong(1, scheduleId);
          try (ResultSet result = statement.executeQuery()) {
            if (!result.next()) {
              throw new SQLException("Selected journey was not found.");
            }
            int available = result.getInt("available_seats");
            if (available < passengers.size()) {
              throw new SQLException("Insufficient seats available.");
            }
            fare = result.getBigDecimal("fare");
          }
        }

        String pnr = newPnr(connection);
        BigDecimal total = fare.multiply(
          BigDecimal.valueOf(passengers.size())
        );
        long bookingId;
        String bookingSql =
          """
          INSERT INTO bookings
            (user_id,schedule_id,pnr,booking_status,total_amount)
          VALUES (?,?,?, 'CONFIRMED',?)
          """;
        try (
          PreparedStatement statement = connection.prepareStatement(
            bookingSql,
            Statement.RETURN_GENERATED_KEYS
          )
        ) {
          statement.setLong(1, userId);
          statement.setLong(2, scheduleId);
          statement.setString(3, pnr);
          statement.setBigDecimal(4, total);
          statement.executeUpdate();
          try (ResultSet keys = statement.getGeneratedKeys()) {
            if (!keys.next()) {
              throw new SQLException("Booking identifier was not generated.");
            }
            bookingId = keys.getLong(1);
          }
        }

        String passengerSql =
          """
          INSERT INTO passengers
            (booking_id,passenger_name,age,gender)
          VALUES (?,?,?,?)
          """;
        try (
          PreparedStatement statement = connection.prepareStatement(passengerSql)
        ) {
          for (PassengerInput passenger : passengers) {
            statement.setLong(1, bookingId);
            statement.setString(2, passenger.name());
            statement.setInt(3, passenger.age());
            statement.setString(4, passenger.gender());
            statement.addBatch();
          }
          statement.executeBatch();
        }

        String seatSql =
          """
          UPDATE train_schedules
          SET available_seats=available_seats-?
          WHERE id=? AND available_seats>=?
          """;
        try (PreparedStatement statement = connection.prepareStatement(seatSql)) {
          statement.setInt(1, passengers.size());
          statement.setLong(2, scheduleId);
          statement.setInt(3, passengers.size());
          if (statement.executeUpdate() != 1) {
            throw new SQLException("Seat inventory changed during booking.");
          }
        }

        String paymentSql =
          """
          INSERT INTO payments
            (booking_id,amount,payment_method,payment_status,transaction_reference)
          VALUES (?,?,?,'DEMO_CONFIRMED',?)
          """;
        try (
          PreparedStatement statement = connection.prepareStatement(paymentSql)
        ) {
          statement.setLong(1, bookingId);
          statement.setBigDecimal(2, total);
          statement.setString(3, paymentMethod);
          statement.setString(
            4,
            "DEMO-" + PnrGenerator.generate()
          );
          statement.executeUpdate();
        }

        connection.commit();
        return bookingId;
      } catch (SQLException exception) {
        connection.rollback();
        throw exception;
      } finally {
        connection.setAutoCommit(true);
      }
    }
  }

  private String newPnr(Connection connection) throws SQLException {
    while (true) {
      String pnr = PnrGenerator.generate();
      try (
        PreparedStatement statement = connection.prepareStatement(
          "SELECT id FROM bookings WHERE pnr=?"
        )
      ) {
        statement.setString(1, pnr);
        try (ResultSet result = statement.executeQuery()) {
          if (!result.next()) {
            return pnr;
          }
        }
      }
    }
  }

  public List<Booking> findByUser(long userId) throws SQLException {
    String sql =
      """
      SELECT b.*,s.journey_date,s.travel_class,s.departure_time,s.arrival_time,
             s.duration,t.train_number,t.train_name,t.source,t.destination,
             (SELECT COUNT(*) FROM passengers p WHERE p.booking_id=b.id) passenger_count
      FROM bookings b
      JOIN train_schedules s ON s.id=b.schedule_id
      JOIN trains t ON t.id=s.train_id
      WHERE b.user_id=?
      ORDER BY b.created_at DESC
      """;
    List<Booking> bookings = new ArrayList<>();
    try (
      Connection connection = DatabaseConnection.getConnection();
      PreparedStatement statement = connection.prepareStatement(sql)
    ) {
      statement.setLong(1, userId);
      try (ResultSet result = statement.executeQuery()) {
        while (result.next()) {
          bookings.add(mapBookingSummary(connection, result));
        }
      }
    }
    return bookings;
  }

  public Booking findOwned(long bookingId, long userId) throws SQLException {
    String sql =
      """
      SELECT b.*,s.journey_date,s.travel_class,s.departure_time,s.arrival_time,
             s.duration,t.train_number,t.train_name,t.source,t.destination
      FROM bookings b
      JOIN train_schedules s ON s.id=b.schedule_id
      JOIN trains t ON t.id=s.train_id
      WHERE b.id=? AND b.user_id=?
      """;
    try (
      Connection connection = DatabaseConnection.getConnection();
      PreparedStatement statement = connection.prepareStatement(sql)
    ) {
      statement.setLong(1, bookingId);
      statement.setLong(2, userId);
      try (ResultSet result = statement.executeQuery()) {
        return result.next() ? mapBookingSummary(connection, result) : null;
      }
    }
  }

  private Booking mapBookingSummary(
    Connection connection,
    ResultSet result
  ) throws SQLException {
    long bookingId = result.getLong("id");
    List<Passenger> passengers = findPassengers(connection, bookingId);
    Payment payment = findPayment(connection, bookingId);
    Timestamp timestamp = result.getTimestamp("created_at");
    return new Booking(
      bookingId,
      result.getLong("user_id"),
      result.getLong("schedule_id"),
      result.getString("pnr"),
      result.getString("booking_status"),
      result.getBigDecimal("total_amount"),
      timestamp == null ? null : timestamp.toLocalDateTime(),
      result.getString("train_number"),
      result.getString("train_name"),
      result.getString("source"),
      result.getString("destination"),
      result.getObject("journey_date", LocalDate.class),
      result.getString("travel_class"),
      result.getTime("departure_time").toString(),
      result.getTime("arrival_time").toString(),
      result.getString("duration"),
      passengers,
      payment
    );
  }

  private List<Passenger> findPassengers(
    Connection connection,
    long bookingId
  ) throws SQLException {
    String sql =
      "SELECT id,booking_id,passenger_name,age,gender FROM passengers WHERE booking_id=? ORDER BY id";
    List<Passenger> passengers = new ArrayList<>();
    try (PreparedStatement statement = connection.prepareStatement(sql)) {
      statement.setLong(1, bookingId);
      try (ResultSet result = statement.executeQuery()) {
        while (result.next()) {
          passengers.add(
            new Passenger(
              result.getLong("id"),
              result.getLong("booking_id"),
              result.getString("passenger_name"),
              result.getInt("age"),
              result.getString("gender")
            )
          );
        }
      }
    }
    return passengers;
  }

  private Payment findPayment(
    Connection connection,
    long bookingId
  ) throws SQLException {
    String sql =
      """
      SELECT id,booking_id,amount,payment_method,payment_status,transaction_reference
      FROM payments WHERE booking_id=? ORDER BY id DESC LIMIT 1
      """;
    try (PreparedStatement statement = connection.prepareStatement(sql)) {
      statement.setLong(1, bookingId);
      try (ResultSet result = statement.executeQuery()) {
        if (!result.next()) {
          return null;
        }
        return new Payment(
          result.getLong("id"),
          result.getLong("booking_id"),
          result.getBigDecimal("amount"),
          result.getString("payment_method"),
          result.getString("payment_status"),
          result.getString("transaction_reference")
        );
      }
    }
  }

  public boolean cancel(long bookingId, long userId) throws SQLException {
    try (Connection connection = DatabaseConnection.getConnection()) {
      connection.setAutoCommit(false);
      try {
        String selectSql =
          """
          SELECT schedule_id,(SELECT COUNT(*) FROM passengers
                             WHERE booking_id=b.id) passenger_count
          FROM bookings b
          WHERE b.id=? AND b.user_id=? AND b.booking_status='CONFIRMED'
          FOR UPDATE
          """;
        long scheduleId;
        int passengerCount;
        try (
          PreparedStatement statement = connection.prepareStatement(selectSql)
        ) {
          statement.setLong(1, bookingId);
          statement.setLong(2, userId);
          try (ResultSet result = statement.executeQuery()) {
            if (!result.next()) {
              connection.rollback();
              return false;
            }
            scheduleId = result.getLong("schedule_id");
            passengerCount = result.getInt("passenger_count");
          }
        }

        try (
          PreparedStatement statement = connection.prepareStatement(
            "UPDATE train_schedules SET available_seats=available_seats+? WHERE id=?"
          )
        ) {
          statement.setInt(1, passengerCount);
          statement.setLong(2, scheduleId);
          statement.executeUpdate();
        }
        try (
          PreparedStatement statement = connection.prepareStatement(
            "UPDATE bookings SET booking_status='CANCELLED' " +
            "WHERE id=? AND user_id=? AND booking_status='CONFIRMED'"
          )
        ) {
          statement.setLong(1, bookingId);
          statement.setLong(2, userId);
          if (statement.executeUpdate() != 1) {
            throw new SQLException("Cancellation status update failed.");
          }
        }
        connection.commit();
        return true;
      } catch (SQLException exception) {
        connection.rollback();
        throw exception;
      } finally {
        connection.setAutoCommit(true);
      }
    }
  }
}
