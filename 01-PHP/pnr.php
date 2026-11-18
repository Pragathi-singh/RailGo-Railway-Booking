<?php
declare(strict_types=1);

require_once __DIR__ . "/includes/bootstrap.php";

$user = require_login();
$pnr = trim((string) ($_GET["pnr"] ?? ""));
$errors = [];
$booking = null;

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $pnr = trim(post_string("pnr"));
    if (!valid_csrf(post_string("csrf_token"))) {
        $errors["form"] = "Please refresh and try again.";
    } elseif ($pnr === "") {
        $errors["pnr"] = "Enter a PNR.";
    } else {
        try {
            $statement = database_connection()->prepare(
                "SELECT b.pnr, b.booking_status, b.total_amount,
                        s.journey_date, t.train_name, t.source, t.destination
                 FROM bookings b
                 INNER JOIN train_schedules s ON s.id = b.schedule_id
                 INNER JOIN trains t ON t.id = s.train_id
                 WHERE b.user_id = :user_id AND b.pnr = :pnr",
            );
            $statement->execute([
                "user_id" => (int) $user["id"],
                "pnr" => strtoupper($pnr),
            ]);
            $booking = $statement->fetch();
        } catch (RuntimeException $exception) {
            error_log("RailGo PNR lookup failed: " . $exception->getMessage());
            $errors["form"] = "PNR status is temporarily unavailable.";
        }
    }
}

render_page_head("PNR status", "Check your RailGo PNR status.");
render_topbar();
?>
<main class="demo-page page-width" id="main-content">
    <p class="eyebrow">PNR STATUS</p>
    <h1>Check booking status</h1>
    <form class="demo-card profile-form" method="post">
        <?= csrf_input() ?>
        <div class="field">
            <label for="pnr">PNR</label>
            <input id="pnr" name="pnr" value="<?= e(
                $pnr,
            ) ?>" maxlength="20" required>
            <?php if (isset($errors["pnr"])): ?>
                <span class="field-error"><?= e($errors["pnr"]) ?></span>
            <?php endif; ?>
        </div>
        <button class="button" type="submit">Check status</button>
    </form>

    <?php if (is_array($booking)): ?>
        <section class="demo-card">
            <h2><?= e($booking["pnr"]) ?> &middot; <?= e(
     $booking["booking_status"],
 ) ?></h2>
            <p>
                <?= e($booking["train_name"]) ?> &mdash;
                <?= e($booking["source"]) ?> to <?= e(
     $booking["destination"],
 ) ?>
            </p>
        </section>
    <?php elseif ($_SERVER["REQUEST_METHOD"] === "POST" && $errors === []): ?>
        <p class="notice notice--info">No booking was found for this PNR.</p>
    <?php endif; ?>
</main>
<?php render_footer(); ?>
