<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/bootstrap.php';

$searchErrors = [];
$searchMessage = '';
$from = '';
$to = '';
$journeyDate = '';
$travelClass = 'Sleeper';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $from = trim(post_string('from_station'));
    $to = trim(post_string('to_station'));
    $journeyDate = trim(post_string('journey_date'));
    $travelClass = trim(post_string('travel_class'));

    if (!valid_csrf(post_string('csrf_token'))) {
        $searchErrors['form'] = 'Your session could not be verified. Please refresh the page and try again.';
    }
    if ($from === '') {
        $searchErrors['from_station'] = 'Enter your departure station.';
    }
    if ($to === '') {
        $searchErrors['to_station'] = 'Enter your destination station.';
    }
    if ($from !== '' && $to !== '' && strtolower($from) === strtolower($to)) {
        $searchErrors['to_station'] = 'Choose a destination different from your departure station.';
    }
    if (strlen($from) > 200) {
        $searchErrors['from_station'] = 'Departure station must be 200 characters or fewer.';
    }
    if (strlen($to) > 200) {
        $searchErrors['to_station'] = 'Destination station must be 200 characters or fewer.';
    }
    $date = DateTimeImmutable::createFromFormat('!Y-m-d', $journeyDate);
    if ($journeyDate === '' || $date === false || $date->format('Y-m-d') !== $journeyDate) {
        $searchErrors['journey_date'] = 'Choose a valid journey date.';
    } elseif ($date < new DateTimeImmutable('today')) {
        $searchErrors['journey_date'] = 'Journey date cannot be in the past.';
    }
    $classes = ['Sleeper', 'AC 3 Tier', 'AC 2 Tier', 'AC First Class', 'Chair Car'];
    if (!in_array($travelClass, $classes, true)) {
        $searchErrors['travel_class'] = 'Choose a valid travel class.';
        $travelClass = 'Sleeper';
    }

    if ($searchErrors === []) {
        $searchMessage = sprintf(
            'Live train results are not available for %s to %s on %s right now. Please try another date or route.',
            $from,
            $to,
            $date->format('d F Y')
        );
    }
}

render_page_head('Plan your journey', 'Find your next railway journey across India with RailGo.');
render_topbar();
?>
<main id="main-content">
    <div class="page-width landing-flashes"><?php render_flashes(); ?></div>
    <section class="hero" aria-labelledby="hero-title">
        <div class="hero__image" role="img" aria-label="Passenger train travelling through a green Indian landscape"></div>
        <div class="hero__content page-width">
            <p class="eyebrow eyebrow--light">A BETTER WAY TO BEGIN</p>
            <h1 id="hero-title">Explore India,<br>One Journey at a Time</h1>
            <p>Book train tickets with ease, comfort and confidence.</p>
            <a class="button button--outline" href="#search">Plan your journey <span aria-hidden="true">&rarr;</span></a>
        </div>
        <div class="hero__caption">Photo: Subumecher, <a href="https://commons.wikimedia.org/wiki/File:Konkan_Express.jpg" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a></div>
    </section>

    <section class="search-section page-width" id="search" aria-labelledby="search-title">
        <div class="search-panel">
            <div class="search-panel__heading">
                <div>
                    <p class="eyebrow">YOUR NEXT ADVENTURE</p>
                    <h2 id="search-title">Where would you like to go?</h2>
                </div>
                <span class="demo-tag">SEARCH TRAINS</span>
            </div>
            <?php if (isset($searchErrors['form'])): ?>
                <p class="form-alert" role="alert"><?= e($searchErrors['form']) ?></p>
            <?php endif; ?>
            <?php if ($searchMessage !== ''): ?>
                <p class="notice notice--info" role="status"><?= e($searchMessage) ?></p>
            <?php endif; ?>
            <form action="index.php#search" method="post" class="search-form" novalidate>
                <?= csrf_input() ?>
                <div class="station-fields">
                    <div class="field">
                        <label for="from-station">From station</label>
                        <input id="from-station" name="from_station" type="text" autocomplete="off" placeholder="e.g. Mumbai Central" value="<?= e($from) ?>" required aria-describedby="<?= isset($searchErrors['from_station']) ? 'from-error' : 'from-hint' ?>">
                        <?php if (isset($searchErrors['from_station'])): ?>
                            <span class="field-error" id="from-error"><?= e($searchErrors['from_station']) ?></span>
                        <?php else: ?>
                            <span class="field-hint" id="from-hint">Your departure city or station</span>
                        <?php endif; ?>
                    </div>
                    <button type="button" class="swap-button" data-swap-stations aria-label="Swap departure and destination" title="Swap stations">
                        <span aria-hidden="true">&#8644;</span>
                    </button>
                    <div class="field">
                        <label for="to-station">To station</label>
                        <input id="to-station" name="to_station" type="text" autocomplete="off" placeholder="e.g. New Delhi" value="<?= e($to) ?>" required aria-describedby="<?= isset($searchErrors['to_station']) ? 'to-error' : 'to-hint' ?>">
                        <?php if (isset($searchErrors['to_station'])): ?>
                            <span class="field-error" id="to-error"><?= e($searchErrors['to_station']) ?></span>
                        <?php else: ?>
                            <span class="field-hint" id="to-hint">Where would you like to arrive?</span>
                        <?php endif; ?>
                    </div>
                </div>
                <div class="search-form__details">
                    <div class="field">
                        <label for="journey-date">Journey date</label>
                        <input id="journey-date" name="journey_date" type="date" min="<?= e(date('Y-m-d')) ?>" value="<?= e($journeyDate) ?>" required>
                        <?php if (isset($searchErrors['journey_date'])): ?>
                            <span class="field-error"><?= e($searchErrors['journey_date']) ?></span>
                        <?php endif; ?>
                    </div>
                    <div class="field">
                        <label for="travel-class">Travel class</label>
                        <select id="travel-class" name="travel_class">
                            <?php foreach (['Sleeper', 'AC 3 Tier', 'AC 2 Tier', 'AC First Class', 'Chair Car'] as $class): ?>
                                <option value="<?= e($class) ?>" <?= $travelClass === $class ? 'selected' : '' ?>><?= e($class) ?></option>
                            <?php endforeach; ?>
                        </select>
                        <?php if (isset($searchErrors['travel_class'])): ?>
                            <span class="field-error"><?= e($searchErrors['travel_class']) ?></span>
                        <?php endif; ?>
                    </div>
                    <button class="button search-submit" type="submit">Search Trains <span aria-hidden="true">&rarr;</span></button>
                </div>
            </form>
            <p class="demo-disclaimer">Choose your route and travel class to find the right journey.</p>
        </div>
    </section>

    <section class="benefits page-width" aria-labelledby="benefits-title">
        <div class="section-heading">
            <p class="eyebrow">THE RAILGO DIFFERENCE</p>
            <h2 id="benefits-title">A little more ease in every journey</h2>
        </div>
        <div class="benefit-grid">
            <article class="benefit">
                <span class="benefit__icon" aria-hidden="true">&#10003;</span>
                <h3>Easy Booking</h3>
                <p>A clear, simple experience from planning to your next stop.</p>
            </article>
            <article class="benefit">
                <span class="benefit__icon" aria-hidden="true">&#9678;</span>
                <h3>Journey clarity</h3>
                <p>Keep your route, date and travel class clear from the very beginning.</p>
            </article>
            <article class="benefit">
                <span class="benefit__icon" aria-hidden="true">&#9830;</span>
                <h3>Thoughtful planning</h3>
                <p>Make confident choices with a calm, focused booking experience.</p>
            </article>
            <article class="benefit">
                <span class="benefit__icon" aria-hidden="true">&#9742;</span>
                <h3>24/7 Support</h3>
                <p>Find helpful guidance whenever you need a smoother journey.</p>
            </article>
        </div>
    </section>

    <section class="why-section" id="why-railgo" aria-labelledby="why-title">
        <div class="why-section__inner page-width">
            <div class="why-section__image" role="img" aria-label="A train journey through the Indian countryside"></div>
            <div class="why-section__copy">
                <p class="eyebrow">MORE THAN A TICKET</p>
                <h2 id="why-title">Your journey deserves a thoughtful start.</h2>
                <p>RailGo brings the essentials of planning together in one welcoming place. Get ready to discover new cities, reconnect with familiar places, and make the most of the miles in between.</p>
                <a class="text-link" href="signup.php">Get started with RailGo <span aria-hidden="true">&rarr;</span></a>
                <p class="small-print" id="terms">Please use information you are comfortable storing in this local installation.</p>
            </div>
        </div>
    </section>
</main>
<?php render_footer(); ?>
