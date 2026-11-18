<?php
declare(strict_types=1);

require_once __DIR__ . "/includes/bootstrap.php";

$user = require_login();
$errors = [];

try {
    $statement = database_connection()->prepare(
        "SELECT id, COALESCE(name, full_name, email) AS name,
                email, mobile, address
         FROM users
         WHERE id = :id",
    );
    $statement->execute(["id" => (int) $user["id"]]);
    $profile = $statement->fetch();
} catch (RuntimeException $exception) {
    error_log("RailGo profile load failed: " . $exception->getMessage());
    $profile = false;
}

if (!is_array($profile)) {
    add_flash("error", "Your profile could not be loaded.");
    redirect("logout.php");
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $profile["name"] = trim(post_string("full_name"));
    $profile["email"] = strtolower(trim(post_string("email")));
    $profile["mobile"] = (string) preg_replace(
        "/[\s()-]/",
        "",
        post_string("mobile"),
    );
    $profile["address"] = trim(post_string("address"));

    if (!valid_csrf(post_string("csrf_token"))) {
        $errors["form"] = "Please refresh and try again.";
    }
    if (mb_strlen($profile["name"]) < 1 || mb_strlen($profile["name"]) > 100) {
        $errors["full_name"] = "Enter your name.";
    }
    if (
        mb_strlen($profile["email"]) > 254 ||
        filter_var($profile["email"], FILTER_VALIDATE_EMAIL) === false
    ) {
        $errors["email"] = "Enter a valid email.";
    }
    if (!preg_match('/^[6-9][0-9]{9}$/', $profile["mobile"])) {
        $errors["mobile"] = "Enter a valid 10-digit mobile number.";
    }

    if ($errors === []) {
        try {
            $connection = database_connection();
            $statement = $connection->prepare(
                "UPDATE users
                 SET name = :name,
                     full_name = :full_name,
                     email = :email,
                     mobile = :mobile,
                     address = :address
                 WHERE id = :id",
            );
            $statement->execute([
                "name" => $profile["name"],
                "full_name" => $profile["name"],
                "email" => $profile["email"],
                "mobile" => $profile["mobile"],
                "address" => $profile["address"],
                "id" => (int) $user["id"],
            ]);

            $_SESSION["user"]["full_name"] = $profile["name"];
            $_SESSION["user"]["email"] = $profile["email"];
            add_flash("success", "Your profile was saved.");
            redirect("profile.php");
        } catch (PDOException $exception) {
            if ($exception->getCode() === "23000") {
                $errors["email"] =
                    "Another account already uses this email address.";
            } else {
                error_log(
                    "RailGo profile save failed: " . $exception->getMessage(),
                );
                $errors["form"] =
                    "Your profile could not be saved. Please try again.";
            }
        }
    }
}

render_page_head("My profile", "Manage your RailGo profile.");
render_topbar();
?>
<main class="demo-page page-width" id="main-content">
    <p class="eyebrow">MY ACCOUNT</p>
    <h1>Profile</h1>
    <?php render_flashes(); ?>
    <?php if (isset($errors["form"])): ?>
        <p class="form-alert"><?= e($errors["form"]) ?></p>
    <?php endif; ?>

    <form class="demo-card profile-form" method="post">
        <?= csrf_input() ?>
        <div class="field">
            <label>Full name</label>
            <input name="full_name" value="<?= e($profile["name"]) ?>" required>
            <?php if (isset($errors["full_name"])): ?>
                <span class="field-error"><?= e($errors["full_name"]) ?></span>
            <?php endif; ?>
        </div>
        <div class="field">
            <label>Email</label>
            <input name="email" type="email" value="<?= e(
                $profile["email"],
            ) ?>" required>
            <?php if (isset($errors["email"])): ?>
                <span class="field-error"><?= e($errors["email"]) ?></span>
            <?php endif; ?>
        </div>
        <div class="field">
            <label>Mobile</label>
            <input name="mobile" value="<?= e($profile["mobile"]) ?>" required>
            <?php if (isset($errors["mobile"])): ?>
                <span class="field-error"><?= e($errors["mobile"]) ?></span>
            <?php endif; ?>
        </div>
        <div class="field">
            <label>Address</label>
            <input name="address" value="<?= e(
                (string) ($profile["address"] ?? ""),
            ) ?>">
        </div>
        <button class="button" type="submit">Save profile</button>
    </form>
</main>
<?php render_footer(); ?>
