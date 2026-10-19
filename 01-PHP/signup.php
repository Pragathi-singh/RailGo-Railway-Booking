<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/bootstrap.php';

if (current_user() !== null) {
    redirect('index.php');
}

$values = ['full_name' => '', 'email' => '', 'mobile' => ''];
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    foreach ($values as $key => $_value) {
        $values[$key] = trim(post_string($key));
    }
    $password = post_string('password');
    $confirmPassword = post_string('confirm_password');
    $termsAccepted = isset($_POST['terms']) && $_POST['terms'] === '1';

    if (!valid_csrf(post_string('csrf_token'))) {
        $errors['form'] = 'Your session could not be verified. Please refresh the page and try again.';
    }
    if ($values['full_name'] === '' || preg_match('/\A.{1,100}\z/us', $values['full_name']) !== 1) {
        $errors['full_name'] = 'Enter your name (up to 100 characters).';
    }
    $email = strtolower($values['email']);
    if ($email === '' || strlen($email) > 254 || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
        $errors['email'] = 'Enter a valid email address.';
    }
    if (preg_match('/^[6-9][0-9]{9}$/', preg_replace('/[\s()-]/', '', $values['mobile']) ?? '') !== 1) {
        $errors['mobile'] = 'Enter a valid 10-digit Indian mobile number.';
    }
    if (!password_meets_policy($password)) {
        $errors['password'] = 'Use at least 8 characters, including an uppercase letter, a lowercase letter, and a number.';
    }
    if ($confirmPassword === '' || !hash_equals($password, $confirmPassword)) {
        $errors['confirm_password'] = 'Your passwords do not match.';
    }
    if (!$termsAccepted) {
        $errors['terms'] = 'Please accept the terms to create your demo account.';
    }

    if ($errors === []) {
        try {
            $passwordHash = password_hash($password, PASSWORD_DEFAULT);
            if ($passwordHash === false) {
                throw new RuntimeException('The password could not be hashed.');
            }
            $created = create_account([
                'id' => bin2hex(random_bytes(16)),
                'full_name' => $values['full_name'],
                'email' => $email,
                'mobile' => preg_replace('/[\s()-]/', '', $values['mobile']),
                'password_hash' => $passwordHash,
                'created_at' => gmdate(DATE_ATOM),
            ]);
        } catch (RuntimeException $exception) {
            error_log('RailGo account creation failed: ' . $exception->getMessage());
            $errors['form'] = 'Your account could not be saved right now. Please try again later.';
            $created = false;
        }

        if ($created) {
            add_flash('success', 'Your RailGo demo account is ready. Please log in.');
            redirect('login.php');
        }
        if (!$created && !isset($errors['form'])) {
            $errors['email'] = 'An account with this email already exists. Try logging in instead.';
        }
    }
}

render_page_head('Create your account', 'Create a RailGo demo account to explore the authentication experience.');
?>
<main class="auth-layout" id="main-content">
    <?php render_auth_aside(
        'Join RailGo Today!',
        'Make room for the journeys you have been dreaming about. Getting started is simple.',
        ['Keep your travel details together', 'Plan trips with ease', 'Find inspiration for your next stop']
    ); ?>
    <section class="auth-main" aria-labelledby="signup-title">
        <div class="auth-form-wrap auth-form-wrap--signup">
            <a class="mobile-brand" href="index.php"><?php render_brand(); ?></a>
            <a class="back-home" href="index.php"><span aria-hidden="true">&larr;</span> Back to home</a>
            <p class="eyebrow">A NEW JOURNEY STARTS HERE</p>
            <h1 id="signup-title">Create your account</h1>
            <p class="auth-intro">Join RailGo and bring your travel plans together.</p>
            <?php render_flashes(); ?>
            <?php if (isset($errors['form'])): ?>
                <p class="form-alert" role="alert"><?= e($errors['form']) ?></p>
            <?php endif; ?>
            <form action="signup.php" method="post" class="auth-form" data-signup-form novalidate>
                <?= csrf_input() ?>
                <div class="field">
                    <label for="full-name">Full name</label>
                    <input id="full-name" name="full_name" type="text" autocomplete="name" maxlength="100" value="<?= e($values['full_name']) ?>" required aria-describedby="<?= isset($errors['full_name']) ? 'name-error' : '' ?>">
                    <?php if (isset($errors['full_name'])): ?>
                        <span class="field-error" id="name-error"><?= e($errors['full_name']) ?></span>
                    <?php endif; ?>
                </div>
                <div class="field">
                    <label for="email">Email address</label>
                    <input id="email" name="email" type="email" autocomplete="email" maxlength="254" value="<?= e($values['email']) ?>" required aria-describedby="<?= isset($errors['email']) ? 'email-error' : '' ?>">
                    <?php if (isset($errors['email'])): ?>
                        <span class="field-error" id="email-error"><?= e($errors['email']) ?></span>
                    <?php endif; ?>
                </div>
                <div class="field">
                    <label for="mobile">Mobile number</label>
                    <input id="mobile" name="mobile" type="tel" autocomplete="tel-national" inputmode="numeric" maxlength="14" placeholder="10-digit Indian mobile number" value="<?= e($values['mobile']) ?>" required aria-describedby="<?= isset($errors['mobile']) ? 'mobile-error' : 'mobile-hint' ?>">
                    <?php if (isset($errors['mobile'])): ?>
                        <span class="field-error" id="mobile-error"><?= e($errors['mobile']) ?></span>
                    <?php else: ?>
                        <span class="field-hint" id="mobile-hint">Numbers beginning with 6, 7, 8 or 9</span>
                    <?php endif; ?>
                </div>
                <div class="field">
                    <label for="signup-password">Password</label>
                    <div class="password-control">
                        <input id="signup-password" name="password" type="password" autocomplete="new-password" required aria-describedby="<?= isset($errors['password']) ? 'password-error' : 'password-hint' ?>">
                        <button class="password-toggle" type="button" data-password-toggle="signup-password" aria-label="Show password" aria-pressed="false">Show</button>
                    </div>
                    <?php if (isset($errors['password'])): ?>
                        <span class="field-error" id="password-error"><?= e($errors['password']) ?></span>
                    <?php else: ?>
                        <span class="field-hint" id="password-hint">8+ characters with uppercase, lowercase and a number</span>
                    <?php endif; ?>
                </div>
                <div class="field">
                    <label for="confirm-password">Confirm password</label>
                    <div class="password-control">
                        <input id="confirm-password" name="confirm_password" type="password" autocomplete="new-password" required aria-describedby="<?= isset($errors['confirm_password']) ? 'confirm-error' : '' ?>">
                        <button class="password-toggle" type="button" data-password-toggle="confirm-password" aria-label="Show password" aria-pressed="false">Show</button>
                    </div>
                    <?php if (isset($errors['confirm_password'])): ?>
                        <span class="field-error" id="confirm-error"><?= e($errors['confirm_password']) ?></span>
                    <?php endif; ?>
                </div>
                <div class="field field--terms">
                    <label class="checkbox-label checkbox-label--terms">
                        <input type="checkbox" name="terms" value="1" <?= post_string('terms') === '1' ? 'checked' : '' ?> required>
                        <span>I agree to the <a href="index.php#demo-terms">demo terms and conditions</a>.</span>
                    </label>
                    <?php if (isset($errors['terms'])): ?>
                        <span class="field-error"><?= e($errors['terms']) ?></span>
                    <?php endif; ?>
                </div>
                <button class="button button--full" type="submit">Create Account <span aria-hidden="true">&rarr;</span></button>
            </form>
            <p class="auth-switch">Already have an account? <a href="login.php">Login</a></p>
            <p class="demo-note">Local college demo only. Do not use real personal or password data.</p>
        </div>
    </section>
</main>
<?php render_footer(); ?>
