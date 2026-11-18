<?php
declare(strict_types=1);

require_once __DIR__ . "/includes/bootstrap.php";

$search = $_SESSION["journey_search"] ?? [
    "from" => "",
    "to" => "",
    "date" => date("Y-m-d"),
    "class" => "Sleeper",
];
$errors = [];
$trains = [];

if (
    $_SERVER["REQUEST_METHOD"] === "GET" &&
    isset($_SESSION["journey_search"]) &&
    is_array($_SESSION["journey_search"])
) {
    $search = $_SESSION["journey_search"];
    try {
        $statement = database_connection()->prepare(
            "SELECT s.id, s.journey_date, s.departure_time, s.arrival_time,
                    s.duration, s.travel_class, s.available_seats, s.fare,
                    t.train_number, t.train_name, t.source, t.destination
             FROM train_schedules s
             INNER JOIN trains t ON t.id = s.train_id
             WHERE LOWER(t.source) = LOWER(:source)
               AND LOWER(t.destination) = LOWER(:destination)
               AND s.journey_date = :journey_date
               AND s.travel_class = :travel_class
               AND s.available_seats > 0
             ORDER BY s.departure_time, t.train_name",
        );
        $statement->execute([
            "source" => $search["from"],
            "destination" => $search["to"],
            "journey_date" => $search["date"],
            "travel_class" => $search["class"],
        ]);
        $trains = $statement->fetchAll();
    } catch (RuntimeException $exception) {
        error_log("RailGo search failed: " . $exception->getMessage());
        $errors["form"] =
            "Train search is temporarily unavailable. Please try again later.";
    }
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $search["from"] = trim(post_string("from_station"));
    $search["to"] = trim(post_string("to_station"));
    $search["date"] = trim(post_string("journey_date"));
    $search["class"] = trim(post_string("travel_class"));

    if (!valid_csrf(post_string("csrf_token"))) {
        $errors["form"] = "Please refresh and try again.";
    }
    if ($search["from"] === "") {
        $errors["from"] = "Enter a departure station.";
    }
    if ($search["to"] === "") {
        $errors["to"] = "Enter a destination station.";
    } elseif (strcasecmp($search["from"], $search["to"]) === 0) {
        $errors["to"] = "Enter a different destination station.";
    }

    $date = DateTimeImmutable::createFromFormat(
        "!Y-m-d",
        (string) $search["date"],
    );
    if (
        $date === false ||
        $date->format("Y-m-d") !== (string) $search["date"]
    ) {
        $errors["date"] = "Choose a valid journey date.";
    } elseif ($date < new DateTimeImmutable("today")) {
        $errors["date"] = "Journey date cannot be in the past.";
    }

    $validClasses = [
        "Sleeper",
        "AC 3 Tier",
        "AC 2 Tier",
        "AC First Class",
        "Chair Car",
    ];
    if (!in_array($search["class"], $validClasses, true)) {
        $errors["class"] = "Choose a valid travel class.";
    }

    if ($errors === []) {
        try {
            $statement = database_connection()->prepare(
                "SELECT
                    s.id,
                    s.journey_date,
                    s.departure_time,
                    s.arrival_time,
                    s.duration,
                    s.travel_class,
                    s.available_seats,
                    s.fare,
                    t.train_number,
                    t.train_name,
                    t.source,
                    t.destination
                 FROM train_schedules s
                 INNER JOIN trains t ON t.id = s.train_id
                 WHERE LOWER(t.source) = LOWER(:source)
                   AND LOWER(t.destination) = LOWER(:destination)
                   AND s.journey_date = :journey_date
                   AND s.travel_class = :travel_class
                   AND s.available_seats > 0
                 ORDER BY s.departure_time, t.train_name",
            );
            $statement->execute([
                "source" => $search["from"],
                "destination" => $search["to"],
                "journey_date" => $search["date"],
                "travel_class" => $search["class"],
            ]);
            $trains = $statement->fetchAll();
            $_SESSION["journey_search"] = $search;
        } catch (RuntimeException $exception) {
            error_log("RailGo search failed: " . $exception->getMessage());
            $errors["form"] =
                "Train search is temporarily unavailable. Please try again later.";
        }
    }
}

render_page_head(
    "Search trains",
    "Search fictional demo trains stored in MySQL.",
);
render_topbar();
?>
<main class="demo-page page-width" id="main-content">
    <p class="eyebrow">DEMO TRAIN SEARCH</p>
    <h1>Choose your journey</h1>
    <p class="field-hint">
        Demo inventory only; not live Indian Railways availability.
    </p>
    <?php render_flashes(); ?>
    <?php if (isset($errors["form"])): ?>
        <p class="form-alert"><?= e($errors["form"]) ?></p>
    <?php endif; ?>

    <form class="demo-search" method="post">
        <?= csrf_input() ?>
        <div class="field">
            <label for="from_station">From</label>
            <input id="from_station" name="from_station"
                   value="<?= e((string) $search["from"]) ?>" required>
            <?php if (isset($errors["from"])): ?>
                <span class="field-error"><?= e($errors["from"]) ?></span>
            <?php endif; ?>
        </div>
        <div class="field">
            <label for="to_station">To</label>
            <input id="to_station" name="to_station"
                   value="<?= e((string) $search["to"]) ?>" required>
            <?php if (isset($errors["to"])): ?>
                <span class="field-error"><?= e($errors["to"]) ?></span>
            <?php endif; ?>
        </div>
        <div class="field">
            <label for="journey_date">Date</label>
            <input id="journey_date" name="journey_date" type="date"
                   min="<?= date("Y-m-d") ?>"
                   value="<?= e((string) $search["date"]) ?>" required>
            <?php if (isset($errors["date"])): ?>
                <span class="field-error"><?= e($errors["date"]) ?></span>
            <?php endif; ?>
        </div>
        <div class="field">
            <label for="travel_class">Class</label>
            <select id="travel_class" name="travel_class">
                <?php foreach (
                    [
                        "Sleeper",
                        "AC 3 Tier",
                        "AC 2 Tier",
                        "AC First Class",
                        "Chair Car",
                    ]
                    as $class
                ): ?>
                    <option value="<?= e($class) ?>"
                        <?= $search["class"] === $class ? "selected" : "" ?>>
                        <?= e($class) ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>
        <button class="button" type="submit">Search</button>
    </form>

    <?php if (
        $errors === [] &&
        ($_SERVER["REQUEST_METHOD"] === "POST" ||
            isset($_SESSION["journey_search"]))
    ): ?>
        <?php if ($trains === []): ?>
            <section class="demo-card">
                <h2>No matching trains</h2>
                <p>Try a different station pair, date, or travel class.</p>
            </section>
        <?php else: ?>
            <div class="train-list" aria-label="Available trains">
                <?php foreach ($trains as $train): ?>
                    <article class="train-card">
                        <div>
                            <span class="demo-tag"><?= e(
                                $train["train_number"],
                            ) ?></span>
                            <h2><?= e($train["train_name"]) ?></h2>
                            <p><?= e($train["source"]) ?> &rarr; <?= e(
     $train["destination"],
 ) ?></p>
                        </div>
                        <div>
                            <strong><?= e(
                                substr((string) $train["departure_time"], 0, 5),
                            ) ?></strong>
                            <span>Departure</span>
                        </div>
                        <div>
                            <strong><?= e($train["duration"]) ?></strong>
                            <span><?= e(
                                substr((string) $train["arrival_time"], 0, 5),
                            ) ?> arrival</span>
                        </div>
                        <div>
                            <strong>&#8377;<?= number_format(
                                (float) $train["fare"],
                                2,
                            ) ?></strong>
                            <span><?= e($train["travel_class"]) ?></span>
                        </div>
                        <form method="post" action="passenger.php">
                            <?= csrf_input() ?>
                            <input type="hidden" name="schedule_id" value="<?= e(
                                (string) $train["id"],
                            ) ?>">
                            <button class="button" type="submit">Select</button>
                            <small><?= e(
                                (string) $train["available_seats"],
                            ) ?> seats available</small>
                        </form>
                    </article>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    <?php endif; ?>
</main>
<?php render_footer(); ?>
