<?php
declare(strict_types=1);

require_once __DIR__ . "/includes/bootstrap.php";

$user = require_login();
$bookingId =
    isset($_GET["booking_id"]) && ctype_digit((string) $_GET["booking_id"])
        ? (int) $_GET["booking_id"]
        : (int) ($_SESSION["confirmed_booking_id"] ?? 0);

if ($bookingId < 1) {
    add_flash("error", "No confirmed booking is available.");
    redirect("history.php");
}

try {
    $connection = database_connection();
    $statement = $connection->prepare(
        "SELECT b.*, s.journey_date, s.departure_time, s.arrival_time,
                s.duration, s.travel_class, s.fare,
                t.train_number, t.train_name, t.source, t.destination
         FROM bookings b
         INNER JOIN train_schedules s ON s.id = b.schedule_id
         INNER JOIN trains t ON t.id = s.train_id
         WHERE b.id = :booking_id AND b.user_id = :user_id",
    );
    $statement->execute([
        "booking_id" => $bookingId,
        "user_id" => (int) $user["id"],
    ]);
    $booking = $statement->fetch();

    if (!is_array($booking)) {
        http_response_code(404);
        add_flash("error", "Booking not found or access denied.");
        redirect("history.php");
    }

    $statement = $connection->prepare(
        "SELECT passenger_name, age, gender
         FROM passengers
         WHERE booking_id = :booking_id
         ORDER BY id",
    );
    $statement->execute(["booking_id" => $bookingId]);
    $passengers = $statement->fetchAll();

    $statement = $connection->prepare(
        "SELECT amount, payment_method, payment_status, transaction_reference
         FROM payments
         WHERE booking_id = :booking_id
         ORDER BY id DESC
         LIMIT 1",
    );
    $statement->execute(["booking_id" => $bookingId]);
    $payment = $statement->fetch();
} catch (RuntimeException $exception) {
    error_log("RailGo confirmation failed: " . $exception->getMessage());
    add_flash("error", "The ticket could not be loaded.");
    redirect("history.php");
}

unset($_SESSION["confirmed_booking_id"]);

render_page_head(
    "Booking confirmed",
    "RailGo database-backed booking confirmation.",
);
render_topbar();
?>
<main class="demo-page page-width" id="main-content">
    <section class="confirmation-card" id="printable-ticket">
        <p class="eyebrow">BOOKING CONFIRMED</p>
        <h1>Thank you for choosing RailGo</h1>
        <div class="pnr">PNR <strong><?= e($booking["pnr"]) ?></strong></div>
        <p>
            <strong><?= e($booking["train_name"]) ?></strong>
            &middot; <?= e($booking["train_number"]) ?>
        </p>
        <p>
            <?= e($booking["source"]) ?> &rarr; <?= e(
     $booking["destination"],
 ) ?>
            &middot; <?= e((string) $booking["journey_date"]) ?>
            &middot; <?= e(substr((string) $booking["departure_time"], 0, 5)) ?>
            to <?= e(substr((string) $booking["arrival_time"], 0, 5)) ?>
        </p>
        <p>
            <?= e((string) $booking["travel_class"]) ?>
            &middot; <?= count($passengers) ?> passenger(s)
            &middot; &#8377;<?= number_format(
                (float) $booking["total_amount"],
                2,
            ) ?>
        </p>

        <h2>Passengers</h2>
        <ul>
            <?php foreach ($passengers as $passenger): ?>
                <li>
                    <?= e($passenger["passenger_name"]) ?>
                    &middot; <?= e((string) $passenger["age"]) ?> years
                    &middot; <?= e($passenger["gender"]) ?>
                </li>
            <?php endforeach; ?>
        </ul>

        <?php if (is_array($payment)): ?>
            <p>
                Payment: <?= e($payment["payment_status"]) ?>
                &middot; <?= e($payment["payment_method"]) ?>
                &middot; Demo reference <?= e(
                    $payment["transaction_reference"],
                ) ?>
            </p>
        <?php endif; ?>

        <p>Status: <strong><?= e($booking["booking_status"]) ?></strong></p>
        <button class="button" type="button" onclick="window.print()">Print ticket</button>
        <a class="button" href="history.php">View booking history</a>
        <a class="text-link" href="search.php">Book another journey</a>
    </section>
</main>
<?php render_footer(); ?>
