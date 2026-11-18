<?php
declare(strict_types=1);

require_once __DIR__ . "/includes/bootstrap.php";

$errors = [];
$email = "";
$demoResetUrl = "";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email = strtolower(trim(post_string("email")));
    if (!valid_csrf(post_string("csrf_token"))) {
        $errors["form"] = "Please refresh and try again.";
    } elseif (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
        $errors["email"] = "Enter a valid email address.";
    } else {
        try {
            $connection = database_connection();
            $statement = $connection->prepare(
                "SELECT id FROM users WHERE email = :email",
            );
            $statement->execute(["email" => $email]);
            $account = $statement->fetch();

            if (is_array($account)) {
                $token = bin2hex(random_bytes(32));
                $tokenHash = hash("sha256", $token);
                $statement = $connection->prepare(
                    "INSERT INTO password_reset_tokens
                        (user_id, token_hash, expires_at)
                     VALUES
                        (:user_id, :token_hash, DATE_ADD(NOW(), INTERVAL 30 MINUTE))",
                );
                $statement->execute([
                    "user_id" => (int) $account["id"],
                    "token_hash" => $tokenHash,
                ]);
                $scheme =
                    !empty($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] !== "off"
                        ? "https"
                        : "http";
                $host = $_SERVER["HTTP_HOST"] ?? "localhost";
                $demoResetUrl =
                    $scheme .
                    "://" .
                    $host .
                    "/reset-password.php?token=" .
                    rawurlencode($token);
            }
            add_flash(
                "success",
                "If the account exists, a demo reset request was prepared.",
            );
        } catch (Throwable $exception) {
            error_log(
                "RailGo reset request failed: " . $exception->getMessage(),
            );
            $errors["form"] =
                "Password help is temporarily unavailable. Please try again.";
        }
    }
}

render_page_head("Password help", "Use the safe local demo reset workflow.");
render_topbar();
?>
<main class="help-page page-width" id="main-content">
    <a class="back-home" href="login.php">&larr; Back to login</a>
    <div class="help-card">
        <p class="eyebrow">ACCOUNT SUPPORT</p>
        <h1>Password recovery</h1>
        <p>
            No email service is configured. This local demo does not claim to
            send email or display a password.
        </p>

        <form method="post" class="demo-card profile-form">
            <?= csrf_input() ?>
            <div class="field">
                <label for="reset-email">Account email</label>
                <input id="reset-email" name="email" type="email"
                       value="<?= e($email) ?>" required>
                <?php if (isset($errors["email"])): ?>
                    <span class="field-error"><?= e($errors["email"]) ?></span>
                <?php endif; ?>
            </div>
            <button class="button" type="submit">Prepare demo reset</button>
        </form>

        <?php if ($demoResetUrl !== ""): ?>
            <p>
                Demo-only reset link:
                <a href="<?= e($demoResetUrl) ?>">Open local reset page</a>
            </p>
        <?php endif; ?>
        <?php render_flashes(); ?>
        <?php if (isset($errors["form"])): ?>
            <p class="form-alert"><?= e($errors["form"]) ?></p>
        <?php endif; ?>
    </div>
</main>
<?php render_footer(); ?>
