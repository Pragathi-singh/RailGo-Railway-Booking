<?php
declare(strict_types=1);

require_once __DIR__ . "/includes/bootstrap.php";

$user = require_login();
$pending = $_SESSION["pending_booking"] ?? null;
if (!is_array($pending)) {
    add_flash("error", "Select a train and enter passengers first.");
    redirect("search.php");
}

$scheduleId = (int) ($pending["schedule_id"] ?? 0);
$passengerCount = (int) ($pending["passenger_count"] ?? 0);
$passengers = $pending["passengers"] ?? [];

if (
    $scheduleId < 1 ||
    $passengerCount < 1 ||
    $passengerCount > 6 ||
    !is_array($passengers) ||
    count($passengers) !== $passengerCount
) {
    add_flash("error", "The passenger details are incomplete.");
    redirect("passenger.php");
}

try {
    $statement = database_connection()->prepare(
        "SELECT s.*, t.train_number, t.train_name, t.source, t.destination
         FROM train_schedules s
         INNER JOIN trains t ON t.id = s.train_id
         WHERE s.id = :schedule_id",
    );
    $statement->execute(["schedule_id" => $scheduleId]);
    $schedule = $statement->fetch();
} catch (RuntimeException $exception) {
    error_log("RailGo payment page failed: " . $exception->getMessage());
    add_flash("error", "Booking is temporarily unavailable.");
    redirect("search.php");
}

if (!is_array($schedule)) {
    add_flash("error", "The selected journey could not be found.");
    redirect("search.php");
}

$errors = [];
$method = "DEMO_UPI";
$validMethods = [
    "DEMO_UPI" => "Demo UPI",
    "DEMO_WALLET" => "Demo wallet",
    "PAY_ON_COUNTER" => "Pay at counter",
];

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $method = post_string("payment_method");

    if (!valid_csrf(post_string("csrf_token"))) {
        $errors["form"] = "Your session could not be verified.";
    } elseif (!array_key_exists($method, $validMethods)) {
        $errors["form"] = "Choose a valid demo payment method.";
    } else {
        $connection = database_connection();
        try {
            $connection->beginTransaction();

            $statement = $connection->prepare(
                "SELECT * FROM train_schedules
                 WHERE id = :schedule_id
                 FOR UPDATE",
            );
            $statement->execute(["schedule_id" => $scheduleId]);
            $lockedSchedule = $statement->fetch();

            if (
                !is_array($lockedSchedule) ||
                (int) $lockedSchedule["available_seats"] < $passengerCount
            ) {
                throw new DomainException(
                    "There are not enough seats available for this booking.",
                );
            }

            $totalAmount = (float) $lockedSchedule["fare"] * $passengerCount;
            $pnr = generate_pnr($connection);

            $statement = $connection->prepare(
                "INSERT INTO bookings
                    (user_id, schedule_id, pnr, booking_status, total_amount)
                 VALUES
                    (:user_id, :schedule_id, :pnr, 'CONFIRMED', :total_amount)",
            );
            $statement->execute([
                "user_id" => (int) $user["id"],
                "schedule_id" => $scheduleId,
                "pnr" => $pnr,
                "total_amount" => $totalAmount,
            ]);
            $bookingId = (int) $connection->lastInsertId();

            $statement = $connection->prepare(
                "INSERT INTO passengers
                    (booking_id, passenger_name, age, gender)
                 VALUES
                    (:booking_id, :passenger_name, :age, :gender)",
            );
            foreach ($passengers as $passenger) {
                $statement->execute([
                    "booking_id" => $bookingId,
                    "passenger_name" => $passenger["name"],
                    "age" => (int) $passenger["age"],
                    "gender" => $passenger["gender"],
                ]);
            }

            $statement = $connection->prepare(
                "UPDATE train_schedules
                 SET available_seats = available_seats - :passenger_count
                 WHERE id = :schedule_id
                   AND available_seats >= :minimum_seats",
            );
            $statement->execute([
                "passenger_count" => $passengerCount,
                "schedule_id" => $scheduleId,
                "minimum_seats" => $passengerCount,
            ]);
            if ($statement->rowCount() !== 1) {
                throw new DomainException(
                    "The seat inventory changed before payment completed.",
                );
            }

            $transactionReference =
                "DEMO-" . strtoupper(bin2hex(random_bytes(6)));
            $statement = $connection->prepare(
                "INSERT INTO payments
                    (booking_id, amount, payment_method, payment_status,
                     transaction_reference)
                 VALUES
                    (:booking_id, :amount, :payment_method, 'DEMO_CONFIRMED',
                     :transaction_reference)",
            );
            $statement->execute([
                "booking_id" => $bookingId,
                "amount" => $totalAmount,
                "payment_method" => $method,
                "transaction_reference" => $transactionReference,
            ]);

            $connection->commit();
            unset($_SESSION["pending_booking"]);
            $_SESSION["confirmed_booking_id"] = $bookingId;
            redirect("confirmation.php");
        } catch (DomainException $exception) {
            if ($connection->inTransaction()) {
                $connection->rollBack();
            }
            $errors["form"] = $exception->getMessage();
        } catch (Throwable $exception) {
            if ($connection->inTransaction()) {
                $connection->rollBack();
            }
            error_log("RailGo booking failed: " . $exception->getMessage());
            $errors["form"] =
                "The booking could not be completed. Please try again.";
        }
    }
}

$totalAmount = (float) $schedule["fare"] * $passengerCount;

render_page_head("Demo payment", "Complete a safe simulated payment.");
render_topbar();
?>
<main class="demo-page page-width" id="main-content">
    <a class="back-home" href="passenger.php">&larr; Passenger details</a>
    <p class="eyebrow">DEMO PAYMENT</p>
    <h1>Review &amp; pay</h1>

    <?php if (isset($errors["form"])): ?>
        <p class="form-alert"><?= e($errors["form"]) ?></p>
    <?php endif; ?>

    <div class="payment-layout">
        <section class="demo-card">
            <h2>Fare summary</h2>
            <p>
                <?= e($schedule["train_name"]) ?>
                (<?= e($schedule["train_number"]) ?>)
            </p>
            <p>
                <?= e((string) $schedule["source"]) ?> &rarr;
                <?= e((string) $schedule["destination"]) ?>
            </p>
            <p>
                <?= $passengerCount ?> passenger(s) &times;
                &#8377;<?= number_format((float) $schedule["fare"], 2) ?>
            </p>
            <hr>
            <strong>Total &#8377;<?= number_format($totalAmount, 2) ?></strong>
        </section>

        <form class="demo-card" method="post">
            <?= csrf_input() ?>
            <h2>Choose demo payment</h2>
            <?php foreach ($validMethods as $value => $label): ?>
                <label class="checkbox-label">
                    <input type="radio" name="payment_method"
                           value="<?= e($value) ?>"
                           <?= $method === $value ? "checked" : "" ?>>
                    <?= e($label) ?>
                </label>
                <br>
            <?php endforeach; ?>
            <p class="field-hint">
                Demonstration only. No card number, CVV, bank password, or
                real payment credential is collected.
            </p>
            <button class="button button--full" type="submit">
                Confirm demo booking
            </button>
        </form>
    </div>
</main>
<?php render_footer(); ?>
