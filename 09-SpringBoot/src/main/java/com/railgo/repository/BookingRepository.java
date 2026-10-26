package com.railgo.repository;
import com.railgo.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface BookingRepository extends JpaRepository<Booking,Long> { List<Booking> findByUserOrderByCreatedAtDesc(User user); }
