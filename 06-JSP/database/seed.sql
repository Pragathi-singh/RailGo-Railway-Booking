USE railgo_jsp;
INSERT INTO trains (train_number,train_name,source,destination)
VALUES
('JS101','Konkan JSP Express','Mumbai Central','Pune Junction'),
('JS202','Capital JSP Horizon','New Delhi','Jaipur Junction')
ON DUPLICATE KEY UPDATE train_name=VALUES(train_name);

INSERT IGNORE INTO train_schedules
(train_id,journey_date,departure_time,arrival_time,duration,travel_class,total_seats,available_seats,fare)
SELECT t.id,DATE_ADD(CURDATE(),INTERVAL d.day DAY),'06:15','09:40','3h 25m',c.class,c.seats,c.seats,c.fare
FROM trains t
JOIN (SELECT 1 day UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14) d
JOIN (SELECT 'Sleeper' class,72 seats,450.00 fare UNION ALL SELECT 'AC 3 Tier',48,920.00 UNION ALL SELECT 'AC 2 Tier',32,1450.00) c
ON 1=1
