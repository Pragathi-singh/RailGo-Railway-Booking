package com.railgo.dao;

import com.railgo.model.TrainSchedule;
import com.railgo.util.DatabaseConnection;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public final class TrainDao {

  public List<TrainSchedule> search(
    String source,
    String destination,
    LocalDate date,
    String travelClass
  ) throws SQLException {
    String sql =
      """
      SELECT s.id,s.train_id,t.train_number,t.train_name,t.source,t.destination,
             s.journey_date,s.departure_time,s.arrival_time,s.duration,
             s.travel_class,s.total_seats,s.available_seats,s.fare
      FROM train_schedules s
      JOIN trains t ON t.id=s.train_id
      WHERE LOWER(t.source)=LOWER(?) AND LOWER(t.destination)=LOWER(?)
        AND s.journey_date=? AND s.travel_class=? AND s.available_seats>0
      ORDER BY s.departure_time,t.train_name
      """;
    List<TrainSchedule> schedules = new ArrayList<>();
    try (
      Connection connection = DatabaseConnection.getConnection();
      PreparedStatement statement = connection.prepareStatement(sql)
    ) {
      statement.setString(1, source);
      statement.setString(2, destination);
      statement.setDate(3, Date.valueOf(date));
      statement.setString(4, travelClass);
      try (ResultSet result = statement.executeQuery()) {
        while (result.next()) {
          schedules.add(mapSchedule(result));
        }
      }
    }
    return schedules;
  }

  public TrainSchedule findById(long id) throws SQLException {
    String sql =
      """
      SELECT s.id,s.train_id,t.train_number,t.train_name,t.source,t.destination,
             s.journey_date,s.departure_time,s.arrival_time,s.duration,
             s.travel_class,s.total_seats,s.available_seats,s.fare
      FROM train_schedules s
      JOIN trains t ON t.id=s.train_id
      WHERE s.id=?
      """;
    try (
      Connection connection = DatabaseConnection.getConnection();
      PreparedStatement statement = connection.prepareStatement(sql)
    ) {
      statement.setLong(1, id);
      try (ResultSet result = statement.executeQuery()) {
        return result.next() ? mapSchedule(result) : null;
      }
    }
  }

  private TrainSchedule mapSchedule(ResultSet result) throws SQLException {
    return new TrainSchedule(
      result.getLong("id"),
      result.getLong("train_id"),
      result.getString("train_number"),
      result.getString("train_name"),
      result.getString("source"),
      result.getString("destination"),
      result.getDate("journey_date").toLocalDate(),
      result.getTime("departure_time").toLocalTime(),
      result.getTime("arrival_time").toLocalTime(),
      result.getString("duration"),
      result.getString("travel_class"),
      result.getInt("total_seats"),
      result.getInt("available_seats"),
      result.getBigDecimal("fare")
    );
  }
}
