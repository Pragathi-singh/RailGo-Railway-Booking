<?php
declare(strict_types=1);

require_once __DIR__ . "/includes/bootstrap.php";

$user = require_login();
$scheduleId = (int) post_string("schedule_id");
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    $pending = $_SESSION["pending_booking"] ?? null;
    $scheduleId = is_array($pending) ? (int) ($pending["schedule_id"] ?? 0) : 0;
}

if ($scheduleId < 1) {
    add_flash("error", "Select a train before entering passenger details.");
    redirect("search.php");
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
    error_log("RailGo passenger page failed: " . $exception->getMessage());
    add_flash("error", "The selected journey is temporarily unavailable.");
    redirect("search.php");
}

if (!is_array($schedule)) {
    add_flash("error", "The selected journey could not be found.");
    redirect("search.php");
}

$pending = $_SESSION["pending_booking"] ?? [
    "schedule_id" => $scheduleId,
    "passenger_count" => 1,
];
$passengerCount = (int) ($pending["passenger_count"] ?? 1);
$passengers = $pending["passengers"] ?? [
    ["name" => "", "age" => "", "gender" => "Female"],
];
$errors = [];

if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["passenger_name"])) {
    if (!valid_csrf(post_string("csrf_token"))) {
        $errors["form"] = "Please refresh and try again.";
    }

    $passengerCount = (int) post_string("passenger_count");
    $names = $_POST["passenger_name"] ?? [];
    $ages = $_POST["passenger_age"] ?? [];
    $genders = $_POST["passenger_gender"] ?? [];

    if (
        $passengerCount < 1 ||
        $passengerCount > 6 ||
        !is_array($names) ||
        !is_array($ages) ||
        !is_array($genders)
    ) {
        $errors["form"] = "Choose a valid passenger count.";
    } elseif ((int) $schedule["available_seats"] < $passengerCount) {
        $errors["form"] =
            "Only " .
            (int) $schedule["available_seats"] .
            " seats remain for this journey.";
    }

    $passengers = [];
    for ($index = 0; $index < $passengerCount; $index++) {
        $name = trim(is_string($names[$index] ?? "") ? $names[$index] : "");
        $age = trim(is_string($ages[$index] ?? "") ? $ages[$index] : "");
        $gender = is_string($genders[$index] ?? "") ? $genders[$index] : "";

        if ($name === "" || mb_strlen($name) > 100) {
            $errors["name_" . $index] = "Enter a valid passenger name.";
        }
        if (!ctype_digit($age) || (int) $age < 1 || (int) $age > 120) {
            $errors["age_" . $index] = "Enter a valid passenger age.";
        }
        if (!in_array($gender, ["Female", "Male", "Other"], true)) {
            $errors["gender_" . $index] = "Choose a valid gender.";
        }

        $passengers[] = [
            "name" => $name,
            "age" => $age,
            "gender" => $gender,
        ];
    }

    if ($errors === []) {
        $_SESSION["pending_booking"] = [
            "schedule_id" => $scheduleId,
            "passenger_count" => $passengerCount,
            "passengers" => $passengers,
        ];
        redirect("payment.php");
    }
}

if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["schedule_id"])) {
    $_SESSION["pending_booking"] = [
        "schedule_id" => $scheduleId,
        "passenger_count" => 1,
        "passengers" => [["name" => "", "age" => "", "gender" => "Female"]],
    ];
}

render_page_head("Passenger details", "Enter passenger information.");
render_topbar();
?>
<main class="demo-page page-width" id="main-content">
    <a class="back-home" href="search.php">&larr; Change train</a>
    <p class="eyebrow">PASSENGER DETAILS</p>
    <h1><?= e($schedule["train_name"]) ?></h1>
    <p>
        <?= e($schedule["source"]) ?> to <?= e($schedule["destination"]) ?>
        &middot; <?= e((string) $schedule["journey_date"]) ?>
        &middot; <?= e((string) $schedule["travel_class"]) ?>
    </p>
    <p>Fare: &#8377;<?= number_format(
        (float) $schedule["fare"],
        2,
    ) ?> per passenger</p>

    <?php if (isset($errors["form"])): ?>
        <p class="form-alert"><?= e($errors["form"]) ?></p>
    <?php endif; ?>

    <form class="passenger-form" method="post">
        <?= csrf_input() ?>
        <input type="hidden" name="schedule_id" value="<?= e(
            (string) $scheduleId,
        ) ?>">
        <div class="field">
            <label for="passenger_count">Passenger count</label>
            <select id="passenger_count" name="passenger_count">
                <?php for ($count = 1; $count <= 6; $count++): ?>
                    <option value="<?= $count ?>"
                        <?= $passengerCount === $count ? "selected" : "" ?>>
                        <?= $count ?>
                    </option>
                <?php endfor; ?>
            </select>
        </div>

        <?php for ($index = 0; $index < $passengerCount; $index++): ?>
            <?php $passenger = $passengers[$index] ?? [
                "name" => "",
                "age" => "",
                "gender" => "Female",
            ]; ?>
            <fieldset>
                <legend>Passenger <?= $index + 1 ?></legend>
                <div class="passenger-grid">
                    <div class="field">
                        <label>Name</label>
                        <input name="passenger_name[]" maxlength="100"
                               value="<?= e(
                                   (string) $passenger["name"],
                               ) ?>" required>
                        <?php if (isset($errors["name_" . $index])): ?>
                            <span class="field-error"><?= e(
                                $errors["name_" . $index],
                            ) ?></span>
                        <?php endif; ?>
                    </div>
                    <div class="field">
                        <label>Age</label>
                        <input name="passenger_age[]" type="number" min="1" max="120"
                               value="<?= e(
                                   (string) $passenger["age"],
                               ) ?>" required>
                        <?php if (isset($errors["age_" . $index])): ?>
                            <span class="field-error"><?= e(
                                $errors["age_" . $index],
                            ) ?></span>
                        <?php endif; ?>
                    </div>
                    <div class="field">
                        <label>Gender</label>
                        <select name="passenger_gender[]">
                            <?php foreach (
                                ["Female", "Male", "Other"]
                                as $gender
                            ): ?>
                                <option value="<?= e($gender) ?>"
                                    <?= $passenger["gender"] === $gender
                                        ? "selected"
                                        : "" ?>>
                                    <?= e($gender) ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                </div>
            </fieldset>
        <?php endfor; ?>

        <button class="button" type="submit">Continue to demo payment</button>
    </form>
</main>
<script>
    (function () {
        const countSelect = document.querySelector("#passenger_count");
        const form = document.querySelector(".passenger-form");
        if (!countSelect || !form) {
            return;
        }

        const fieldsets = Array.from(
            form.querySelectorAll("fieldset"),
        );

        countSelect.addEventListener("change", function () {
            const passengerCount = Number(countSelect.value);
            let current = Array.from(form.querySelectorAll("fieldset"));
            const template = current[0];

            while (current.length < passengerCount) {
                const copy = template.cloneNode(true);
                const number = current.length + 1;
                copy.querySelector("legend").textContent =
                    "Passenger " + number;
                copy.querySelectorAll("input").forEach(function (input) {
                    input.value = "";
                });
                form.insertBefore(copy, form.querySelector(".button"));
                current = Array.from(form.querySelectorAll("fieldset"));
            }

            current = Array.from(form.querySelectorAll("fieldset"));
            while (current.length > passengerCount) {
                current[current.length - 1].remove();
            }
        });
    })();
</script>
<?php render_footer(); ?>
