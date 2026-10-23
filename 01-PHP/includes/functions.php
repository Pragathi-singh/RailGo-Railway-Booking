<?php
declare(strict_types=1);

function e(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function post_string(string $key): string
{
    $value = $_POST[$key] ?? '';

    return is_string($value) ? $value : '';
}

function csrf_token(): string
{
    if (empty($_SESSION['csrf_token']) || !is_string($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    return $_SESSION['csrf_token'];
}

function csrf_input(): string
{
    return '<input type="hidden" name="csrf_token" value="' . e(csrf_token()) . '">';
}

function valid_csrf(?string $submittedToken): bool
{
    return is_string($submittedToken)
        && isset($_SESSION['csrf_token'])
        && is_string($_SESSION['csrf_token'])
        && hash_equals($_SESSION['csrf_token'], $submittedToken);
}

function add_flash(string $type, string $message): void
{
    $_SESSION['flash'][] = ['type' => $type, 'message' => $message];
}

function take_flashes(): array
{
    $flashes = $_SESSION['flash'] ?? [];
    unset($_SESSION['flash']);

    return is_array($flashes) ? $flashes : [];
}

function redirect(string $location): never
{
    header('Location: ' . $location);
    exit;
}

function render_flashes(): void
{
    foreach (take_flashes() as $flash) {
        if (!is_array($flash) || !isset($flash['type'], $flash['message'])) {
            continue;
        }

        $type = $flash['type'] === 'success' ? 'success' : 'error';
        echo '<div class="notice notice--' . $type . '" role="status">'
            . e((string) $flash['message'])
            . '</div>';
    }
}

function render_page_head(string $title, string $description): void
{
    ?>
    <!doctype html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="#102B46">
        <meta name="description" content="<?= e($description) ?>">
        <title><?= e($title) ?> | RailGo</title>
        <link rel="stylesheet" href="assets/css/style.css">
        <script src="assets/js/script.js" defer></script>
    </head>
    <body>
    <?php
}

function render_brand(string $class = ''): void
{
    ?>
    <a class="brand <?= e($class) ?>" href="index.php" aria-label="RailGo home">
        <span class="brand__mark" aria-hidden="true">
            <svg viewBox="0 0 36 36" focusable="false">
                <path d="M10 5h16a5 5 0 0 1 5 5v13a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V10a5 5 0 0 1 5-5Z"/>
                <path d="M11 11h14v8H11zM10 23h16M12 28l-3 4m15-4 3 4M11 8l-3-3m17 3 3-3"/>
                <circle cx="12" cy="23" r="1.4"/><circle cx="24" cy="23" r="1.4"/>
            </svg>
        </span>
        <span class="brand__words">
            <span class="brand__name">Rail<span>Go</span></span>
            <span class="brand__tagline">Your Journey, Our Priority.</span>
        </span>
    </a>
    <?php
}

function render_topbar(): void
{
    $user = current_user();
    ?>
    <a class="skip-link" href="#main-content">Skip to content</a>
    <header class="site-header">
        <div class="site-header__inner">
            <?php render_brand(); ?>
            <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation">
                <span class="sr-only">Toggle navigation</span>
                <span></span><span></span><span></span>
            </button>
            <nav class="primary-nav" id="primary-navigation" aria-label="Main navigation">
                <a href="index.php">Home</a>
                <a href="index.php#search">Trains</a>
                <a href="index.php#search">Bookings</a>
                <a href="index.php#support">Help</a>
                <?php if ($user !== null): ?>
                    <span class="nav-user">Hello, <?= e($user['full_name']) ?></span>
                    <form class="nav-logout" action="logout.php" method="post">
                        <?= csrf_input() ?>
                        <button class="nav-link-button" type="submit">Log out</button>
                    </form>
                <?php else: ?>
                    <a class="nav-login" href="login.php">Login</a>
                    <a class="button button--small" href="signup.php">Sign Up</a>
                <?php endif; ?>
            </nav>
        </div>
    </header>
    <?php
}

function render_footer(): void
{
    ?>
    <footer class="site-footer" id="support">
        <div class="site-footer__main">
            <div class="footer-brand">
                <?php render_brand('brand--light'); ?>
                <p>Thoughtful journeys begin with a simpler way to plan.</p>
            </div>
            <div class="footer-links">
                <h2>Quick Links</h2>
                <a href="index.php">Home</a>
                <a href="index.php#search">Find a train</a>
                <a href="login.php">My account</a>
            </div>
            <div class="footer-links">
                <h2>Support</h2>
                <a href="forgot-password.php">Password help</a>
                <a href="index.php#why-railgo">Why RailGo</a>
                <a href="index.php#search">Search trains</a>
            </div>
        </div>
        <div class="site-footer__bottom">
            <span>&copy; <?= date('Y') ?> RailGo. Your Journey, Our Priority.</span>
            <span>Thoughtful journeys begin with a simpler way to plan.</span>
        </div>
    </footer>
    </body>
    </html>
    <?php
}

function render_auth_aside(string $heading, string $description, array $highlights, string $quote = ''): void
{
    ?>
    <aside class="auth-aside">
        <div class="auth-aside__photo" aria-hidden="true"></div>
        <div class="auth-aside__content">
            <?php render_brand('brand--light'); ?>
            <div class="auth-aside__copy">
                <p class="eyebrow eyebrow--light">TRAVEL, MADE THOUGHTFUL</p>
                <h2><?= e($heading) ?></h2>
                <p class="auth-aside__description"><?= e($description) ?></p>
                <ul class="auth-highlights">
                    <?php foreach ($highlights as $highlight): ?>
                        <li><span class="highlight-check" aria-hidden="true">&#10003;</span><?= e($highlight) ?></li>
                    <?php endforeach; ?>
                </ul>
            </div>
            <?php if ($quote !== ''): ?>
                <blockquote class="travel-quote">
                    <span aria-hidden="true">&ldquo;</span><?= e($quote) ?>
                </blockquote>
            <?php endif; ?>
            <p class="auth-aside__footnote">Your Journey, Our Priority.</p>
        </div>
    </aside>
    <?php
}
