<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/bootstrap.php';

if (current_user() !== null) {
    redirect('index.php');
}

$identifier = '';
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $identifier = trim(post_string('identifier'));
    $password = post_string('password');

    if (!valid_csrf(post_string('csrf_token'))) {
        $errors['form'] = 'Your session could not be verified. Please refresh the page and try again.';
    } elseif (login_is_rate_limited()) {
        $errors['form'] = 'Too many unsuccessful attempts. Please wait a few minutes before trying again.';
    } elseif ($identifier === '' || $password === '') {
        $errors['form'] = 'Enter your email or username and password.';
    } else {
        try {
            if (authenticate($identifier, $password, post_string('remember') === '1')) {
                add_flash('success', 'You are now logged in. Welcome back to RailGo.');
                redirect('index.php');
            }
            record_login_failure();
            $errors['form'] = 'We could not log you in with those details. Check them and try again.';
        } catch (RuntimeException $exception) {
            error_log('RailGo login failed: ' . $exception->getMessage());
            $errors['form'] = 'Login is temporarily unavailable. Please try again later.';
        }
    }
}

render_page_head('Login', 'Sign in to continue your RailGo journey.');
?>
<main class="auth-layout" id="main-content">
    <?php render_auth_aside(
        'Welcome Back!',
        'Sign in to keep your travel plans together and continue your journey.',
        ['Manage your bookings', 'Check PNR status', 'Explore new destinations'],
        'The journey is the destination.'
    ); ?>
    <section class="auth-main" aria-labelledby="login-title">
        <div class="auth-form-wrap">
            <a class="mobile-brand" href="index.php"><?php render_brand(); ?></a>
            <a class="back-home" href="index.php"><span aria-hidden="true">&larr;</span> Back to home</a>
            <p class="eyebrow">GOOD TO SEE YOU AGAIN</p>
            <h1 id="login-title">Sign in to RailGo</h1>
            <p class="auth-intro">Enter your details to continue your journey.</p>
            <?php render_flashes(); ?>
            <?php if (isset($errors['form'])): ?>
                <p class="form-alert" role="alert"><?= e($errors['form']) ?></p>
            <?php endif; ?>
            <form action="login.php" method="post" class="auth-form" novalidate>
                <?= csrf_input() ?>
                <div class="field">
                    <label for="identifier">Email or username</label>
                    <input id="identifier" name="identifier" type="text" autocomplete="username" value="<?= e($identifier) ?>" required aria-describedby="<?= isset($errors['identifier']) ? 'identifier-error' : '' ?>">
                    <?php if (isset($errors['identifier'])): ?>
                        <span class="field-error" id="identifier-error"><?= e($errors['identifier']) ?></span>
                    <?php endif; ?>
                </div>
                <div class="field">
                    <label for="login-password">Password</label>
                    <div class="password-control">
                        <input id="login-password" name="password" type="password" autocomplete="current-password" required>
                        <button class="password-toggle" type="button" data-password-toggle="login-password" aria-label="Show password" aria-pressed="false">Show</button>
                    </div>
                </div>
                <div class="form-options">
                    <label class="checkbox-label"><input type="checkbox" name="remember" value="1"> <span>Remember me</span></label>
                    <a class="inline-link" href="forgot-password.php">Forgot password?</a>
                </div>
                <button class="button button--full" type="submit">Login <span aria-hidden="true">&rarr;</span></button>
            </form>
            <p class="auth-switch">New to RailGo? <a href="signup.php">Create an Account</a></p>
        </div>
    </section>
</main>
<?php render_footer(); ?>
