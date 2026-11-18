<?php
declare(strict_types=1);

require_once __DIR__ . "/includes/bootstrap.php";

$user = require_login();
$bookingId =
    isset($_GET["booking_id"]) && ctype_digit((string) $_GET["booking_id"])
        ? (int) $_GET["booking_id"]
        : 0;

$pnr = trim(post_string("pnr"));
if ($pnr === "") {
    $pnr = trim((string) ($_GET["pnr"] ?? ""));
}

$booking = null;
try {
    $connection = database_connection();
    $statement = $connection->prepare(
        "SELECT b.*, s.journey_date, s.travel_class,
                t.train_name, t.source, t.destination,
                (SELECT COUNT(*) FROM passengers p WHERE p.booking_id = b.id)
                    AS passenger_count
         FROM bookings b
         INNER JOIN train_schedules s ON s.id = b.schedule_id
         INNER JOIN trains t ON t.id = s.train_id
         WHERE b.user_id = :user_id
           AND (:booking_id = 0 OR b.id = :booking_id_filter)
           AND (:pnr = '' OR b.pnr = :pnr_filter)",
    );
    $statement->execute([
        "user_id" => (int) $user["id"],
        "booking_id" => $bookingId,
        "booking_id_filter" => $bookingId,
        "pnr" => $pnr,
        "pnr_filter" => $pnr,
    ]);
    $booking = $statement->fetch();
} catch (RuntimeException $exception) {
    error_log("RailGo cancellation lookup failed: " . $exception->getMessage());
    add_flash("error", "The booking could not be loaded.");
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    if (!valid_csrf(post_string("csrf_token"))) {
        add_flash("error", "Your session could not be verified.");
    } elseif (!is_array($booking)) {
        http_response_code(404);
        add_flash("error", "Booking not found or access denied.");
    } else {
        $connection = database_connection();
        try {
            $connection->beginTransaction();

            $statement = $connection->prepare(
                "SELECT id, schedule_id
                 FROM bookings
                 WHERE id = :booking_id
                   AND user_id = :user_id
                   AND booking_status = 'CONFIRMED'
                 FOR UPDATE",
            );
            $statement->execute([
                "booking_id" => (int) $booking["id"],
                "user_id" => (int) $user["id"],
            ]);
            $lockedBooking = $statement->fetch();

            if (!is_array($lockedBooking)) {
                $connection->rollBack();
                add_flash(
                    "error",
                    "This booking is already cancelled or cannot be cancelled.",
                );
                redirect("history.php");
            }

            $statement = $connection->prepare(
                "SELECT COUNT(*) AS passenger_count
                 FROM passengers
                 WHERE booking_id = :booking_id",
            );
            $statement->execute(["booking_id" => (int) $booking["id"]]);
            $passengerRow = $statement->fetch();
            $passengerCount = (int) ($passengerRow["passenger_count"] ?? 0);

            $statement = $connection->prepare(
                "UPDATE train_schedules
                 SET available_seats = available_seats + :passenger_count
                 WHERE id = :schedule_id",
            );
            $statement->execute([
                "passenger_count" => $passengerCount,
                "schedule_id" => (int) $lockedBooking["schedule_id"],
            ]);

            $statement = $connection->prepare(
                "UPDATE bookings
                 SET booking_status = 'CANCELLED'
                 WHERE id = :booking_id
                   AND user_id = :user_id
                   AND booking_status = 'CONFIRMED'",
            );
            $statement->execute([
                "booking_id" => (int) $booking["id"],
                "user_id" => (int) $user["id"],
            ]);

            if ($statement->rowCount() !== 1) {
                throw new RuntimeException(
                    "The cancellation could not be confirmed.",
                );
            }

            $connection->commit();
            add_flash(
                "success",
                "Booking " .
                    $booking["pnr"] .
                    " was cancelled and seats were restored.",
            );
            redirect("history.php");
        } catch (Throwable $exception) {
            if ($connection->inTransaction()) {
                $connection->rollBack();
            }
            error_log(
                "RailGo cancellation failed: " . $exception->getMessage(),
            );
            add_flash(
                "error",
                "The booking could not be cancelled. Please try again.",
            );
            redirect("history.php");
        }
    }

    if (!is_array($booking)) {
        redirect("history.php");
    }
}

render_page_head("Cancel booking", "Cancel a MySQL-backed RailGo booking.");
render_topbar();
?>
<main class="demo-page page-width" id="main-content">
    <a class="back-home" href="history.php">&larr; Booking history</a>
    <p class="eyebrow">CANCEL BOOKING</p>
    <h1>Cancel booking</h1>
    <?php render_flashes(); ?>

    <?php if (!is_array($booking)): ?>
        <section class="demo-card">
            <p>Booking not found or access denied.</p>
            <a class="button" href="history.php">Back to history</a>
        </section>
    <?php else: ?>
        <section class="demo-card">
            <h2><?= e($booking["train_name"]) ?> &middot; <?= e(
     $booking["pnr"],
 ) ?></h2>
            <p><?= e($booking["source"]) ?> &rarr; <?= e(
     $booking["destination"],
 ) ?></p>
            <p>Passengers: <?= (int) $booking["passenger_count"] ?></p>
            <p>Status: <?= e($booking["booking_status"]) ?></p>
            <?php if ($booking["booking_status"] === "CONFIRMED"): ?>
                <form method="post">
                    <?= csrf_input() ?>
                    <input type="hidden" name="pnr" value="<?= e(
                        $booking["pnr"],
                    ) ?>">
                    <button class="button" type="submit">Confirm cancellation</button>
                </form>
            <?php else: ?>
                <p>This booking is already cancelled.</p>
            <?php endif; ?>
        </section>
    <?php endif; ?>
</main>
<?php render_footer(); ?>
