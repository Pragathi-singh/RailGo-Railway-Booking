<?php
declare(strict_types=1);

require_once __DIR__ . "/includes/bootstrap.php";

$user = require_login();
$bookings = [];

try {
    $statement = database_connection()->prepare(
        "SELECT b.*, s.journey_date, s.travel_class,
                t.train_number, t.train_name, t.source, t.destination,
                (SELECT COUNT(*) FROM passengers p WHERE p.booking_id = b.id)
                    AS passenger_count
         FROM bookings b
         INNER JOIN train_schedules s ON s.id = b.schedule_id
         INNER JOIN trains t ON t.id = s.train_id
         WHERE b.user_id = :user_id
         ORDER BY b.created_at DESC",
    );
    $statement->execute(["user_id" => (int) $user["id"]]);
    $bookings = $statement->fetchAll();
} catch (RuntimeException $exception) {
    error_log("RailGo history failed: " . $exception->getMessage());
    add_flash("error", "Booking history is temporarily unavailable.");
}

render_page_head("My bookings", "View and manage MySQL booking history.");
render_topbar();
?>
<main class="demo-page page-width" id="main-content">
    <p class="eyebrow">MY BOOKINGS</p>
    <h1>Booking history</h1>
    <?php render_flashes(); ?>

    <?php if ($bookings === []): ?>
        <section class="demo-card">
            <h2>No bookings yet</h2>
            <p>Your confirmed demo journeys will appear here.</p>
            <a class="button" href="search.php">Search trains</a>
        </section>
    <?php else: ?>
        <?php foreach ($bookings as $booking): ?>
            <article class="booking-row">
                <div>
                    <span class="demo-tag"><?= e($booking["pnr"]) ?></span>
                    <h2><?= e($booking["train_name"]) ?></h2>
                    <p>
                        <?= e($booking["source"]) ?> &rarr;
                        <?= e($booking["destination"]) ?>
                        &middot; <?= e((string) $booking["journey_date"]) ?>
                    </p>
                    <p>
                        <?= e($booking["train_number"]) ?>
                        &middot; <?= e((string) $booking["travel_class"]) ?>
                    </p>
                </div>
                <div>
                    <strong><?= e($booking["booking_status"]) ?></strong>
                    <p><?= (int) $booking["passenger_count"] ?> passenger(s)</p>
                    <p>&#8377;<?= number_format(
                        (float) $booking["total_amount"],
                        2,
                    ) ?></p>
                </div>
                <div>
                    <a class="button button--outline-dark"
                       href="confirmation.php?booking_id=<?= (int) $booking[
                           "id"
                       ] ?>">
                        View ticket
                    </a>
                    <?php if ($booking["booking_status"] === "CONFIRMED"): ?>
                        <a class="button button--outline-dark"
                           href="cancel.php?booking_id=<?= (int) $booking[
                               "id"
                           ] ?>">
                            Cancel
                        </a>
                    <?php endif; ?>
                </div>
            </article>
        <?php endforeach; ?>
    <?php endif; ?>
</main>
<?php render_footer(); ?>
