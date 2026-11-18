USE railgo_servlet;

INSERT INTO trains (train_number, train_name, source, destination)
VALUES
    ('SV101', 'Konkan Deccan Express', 'Mumbai Central', 'Pune Junction'),
    ('SV202', 'Capital Horizon', 'Mumbai Central', 'New Delhi'),
    ('SV303', 'Southern Explorer', 'Chennai Central', 'Bengaluru')
ON DUPLICATE KEY UPDATE
    train_name = VALUES(train_name),
    source = VALUES(source),
    destination = VALUES(destination);

INSERT INTO train_schedules
    (train_id, journey_date, departure_time, arrival_time, duration,
     travel_class, total_seats, available_seats, fare)
SELECT t.id, DATE_ADD(CURDATE(), INTERVAL d.day DAY),
       '06:15:00', '09:40:00', '3h 25m', c.travel_class,
       c.total_seats, c.total_seats, c.fare
FROM trains t
JOIN (
    SELECT 1 AS day UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
    UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8
    UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12
    UNION ALL SELECT 13 UNION ALL SELECT 14
) d ON 1=1
JOIN (
    SELECT 'Sleeper' AS travel_class, 72 AS total_seats, 450.00 AS fare
    UNION ALL SELECT 'AC 3 Tier',48,920.00
    UNION ALL SELECT 'AC 2 Tier',32,1450.00
    UNION ALL SELECT 'AC First Class',12,2350.00
    UNION ALL SELECT 'Chair Car',60,390.00
) c ON 1=1
ON DUPLICATE KEY UPDATE fare = VALUES(fare);
