<?php
declare(strict_types=1);

require_once __DIR__ . "/includes/bootstrap.php";

$token = trim((string) ($_GET["token"] ?? post_string("token")));
$errors = [];
$valid = false;

if ($token !== "") {
    try {
        $statement = database_connection()->prepare(
            "SELECT rt.id, rt.user_id
             FROM password_reset_tokens rt
             WHERE rt.token_hash = :token_hash
               AND rt.used_at IS NULL
               AND rt.expires_at >= NOW()
             LIMIT 1",
        );
        $statement->execute(["token_hash" => hash("sha256", $token)]);
        $reset = $statement->fetch();
        $valid = is_array($reset);
    } catch (Throwable $exception) {
        error_log("RailGo reset lookup failed: " . $exception->getMessage());
        $errors["form"] = "Password reset is temporarily unavailable.";
    }
}

if ($_SERVER["REQUEST_METHOD"] === "POST" && $valid) {
    $password = post_string("password");
    $confirmPassword = post_string("confirm_password");

    if (!valid_csrf(post_string("csrf_token"))) {
        $errors["form"] = "Please refresh and try again.";
    } elseif (!password_meets_policy($password)) {
        $errors["password"] =
            "Use at least 8 characters with uppercase, lowercase, and a number.";
    } elseif (!hash_equals($password, $confirmPassword)) {
        $errors["confirm_password"] = "The passwords do not match.";
    } else {
        try {
            $connection = database_connection();
            $connection->beginTransaction();

            $passwordHash = password_hash($password, PASSWORD_DEFAULT);
            $statement = $connection->prepare(
                "UPDATE users SET password_hash = :password_hash
                 WHERE id = :user_id",
            );
            $statement->execute([
                "password_hash" => $passwordHash,
                "user_id" => (int) $reset["user_id"],
            ]);

            $statement = $connection->prepare(
                "UPDATE password_reset_tokens
                 SET used_at = NOW()
                 WHERE id = :id AND used_at IS NULL",
            );
            $statement->execute(["id" => (int) $reset["id"]]);

            $connection->commit();
            add_flash("success", "Your password was updated. Please log in.");
            redirect("login.php");
        } catch (Throwable $exception) {
            if (isset($connection) && $connection->inTransaction()) {
                $connection->rollBack();
            }
            error_log("RailGo reset failed: " . $exception->getMessage());
            $errors["form"] = "The password could not be updated.";
        }
    }
}

render_page_head("Reset password", "Complete the local demo password reset.");
render_topbar();
?>
<main class="help-page page-width" id="main-content">
    <div class="help-card">
        <p class="eyebrow">LOCAL DEMO RESET</p>
        <h1>Reset password</h1>
        <?php if (!$valid): ?>
            <p>This reset link is missing, expired, or already used.</p>
            <a class="button" href="forgot-password.php">Request another demo reset</a>
        <?php else: ?>
            <?php if (isset($errors["form"])): ?>
                <p class="form-alert"><?= e($errors["form"]) ?></p>
            <?php endif; ?>
            <form method="post" class="demo-card profile-form">
                <?= csrf_input() ?>
                <input type="hidden" name="token" value="<?= e($token) ?>">
                <div class="field">
                    <label for="password">New password</label>
                    <input id="password" name="password" type="password" required>
                    <?php if (isset($errors["password"])): ?>
                        <span class="field-error"><?= e(
                            $errors["password"],
                        ) ?></span>
                    <?php endif; ?>
                </div>
                <div class="field">
                    <label for="confirm_password">Confirm password</label>
                    <input id="confirm_password" name="confirm_password" type="password" required>
                    <?php if (isset($errors["confirm_password"])): ?>
                        <span class="field-error"><?= e(
                            $errors["confirm_password"],
                        ) ?></span>
                    <?php endif; ?>
                </div>
                <button class="button" type="submit">Update password</button>
            </form>
        <?php endif; ?>
    </div>
</main>
<?php render_footer(); ?>
