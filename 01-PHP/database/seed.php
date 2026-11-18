<?php
declare(strict_types=1);

require_once __DIR__ . "/../includes/bootstrap.php";

function seedUser(PDO $connection): void
{
    $statement = $connection->prepare(
        "SELECT id FROM users WHERE email = :email",
    );
    $email = "demo@railgo.local";
    $statement->execute(["email" => $email]);
    if ($statement->fetch()) {
        return;
    }

    $passwordHash = password_hash("DemoPass123", PASSWORD_DEFAULT);
    $statement = $connection->prepare(
        "INSERT INTO users
            (name, full_name, email, mobile, password_hash, address)
         VALUES
            (:name, :full_name, :email, :mobile, :password_hash, :address)",
    );
    $statement->execute([
        "name" => "RailGo Demo",
        "full_name" => "RailGo Demo",
        "email" => $email,
        "mobile" => "9876543210",
        "password_hash" => $passwordHash,
        "address" => "Demo Address",
    ]);
}

function seedTrain(PDO $connection, array $train, array $classRules): void
{
    $statement = $connection->prepare(
        "INSERT INTO trains
            (train_number, train_name, source, destination)
         VALUES
            (:train_number, :train_name, :source, :destination)
         ON DUPLICATE KEY UPDATE
            train_name = VALUES(train_name),
            source = VALUES(source),
            destination = VALUES(destination)",
    );
    $statement->execute([
        "train_number" => $train["number"],
        "train_name" => $train["name"],
        "source" => $train["source"],
        "destination" => $train["destination"],
    ]);

    $trainId = (int) $connection->lastInsertId();
    if ($trainId === 0) {
        $statement = $connection->prepare(
            "SELECT id FROM trains WHERE train_number = :number",
        );
        $statement->execute(["number" => $train["number"]]);
        $row = $statement->fetch();
        $trainId = (int) ($row["id"] ?? 0);
    }

    for ($day = 1; $day <= 14; $day++) {
        $journeyDate = date("Y-m-d", strtotime("+{$day} days"));
        foreach ($classRules as $travelClass => $rule) {
            $statement = $connection->prepare(
                "INSERT INTO train_schedules
                    (train_id, journey_date, departure_time, arrival_time,
                     duration, travel_class, total_seats, available_seats, fare)
                 VALUES
                    (:train_id, :journey_date, :departure_time, :arrival_time,
                     :duration, :travel_class, :total_seats, :available_seats, :fare)
                 ON DUPLICATE KEY UPDATE
                    available_seats = GREATEST(available_seats, :available_seats_update),
                    fare = VALUES(fare)",
            );
            $statement->execute([
                "train_id" => $trainId,
                "journey_date" => $journeyDate,
                "departure_time" => $train["departure"],
                "arrival_time" => $train["arrival"],
                "duration" => $train["duration"],
                "travel_class" => $travelClass,
                "total_seats" => $rule["seats"],
                "available_seats" => $rule["seats"],
                "available_seats_update" => $rule["seats"],
                "fare" => $rule["fare"],
            ]);
        }
    }
}

$connection = database_connection();
seedUser($connection);

$trains = [
    [
        "number" => "RG101",
        "name" => "Deccan Coast Express",
        "source" => "Mumbai Central",
        "destination" => "Pune Junction",
        "departure" => "06:15:00",
        "arrival" => "09:40:00",
        "duration" => "3h 25m",
    ],
    [
        "number" => "RG202",
        "name" => "Capital Horizon",
        "source" => "Mumbai Central",
        "destination" => "New Delhi",
        "departure" => "16:55:00",
        "arrival" => "08:35:00",
        "duration" => "15h 40m",
    ],
    [
        "number" => "RG303",
        "name" => "Coromandel Explorer",
        "source" => "Chennai Central",
        "destination" => "Bengaluru",
        "departure" => "21:20:00",
        "arrival" => "05:25:00",
        "duration" => "8h 05m",
    ],
];

$classRules = [
    "Sleeper" => ["seats" => 72, "fare" => 450.0],
    "AC 3 Tier" => ["seats" => 48, "fare" => 920.0],
    "AC 2 Tier" => ["seats" => 32, "fare" => 1450.0],
    "AC First Class" => ["seats" => 12, "fare" => 2350.0],
    "Chair Car" => ["seats" => 60, "fare" => 390.0],
];

foreach ($trains as $train) {
    seedTrain($connection, $train, $classRules);
}

echo "RailGo PHP demo data seeded.\n";
