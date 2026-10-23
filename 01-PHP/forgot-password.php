<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/bootstrap.php';

render_page_head('Password help', 'Get help with your RailGo account password.');
render_topbar();
?>
<main class="help-page page-width" id="main-content">
    <a class="back-home" href="login.php"><span aria-hidden="true">&larr;</span> Back to login</a>
    <div class="help-card">
        <p class="eyebrow">ACCOUNT SUPPORT</p>
        <h1>Password recovery</h1>
        <p>Password recovery is not available from this local installation, so no email has been sent.</p>
        <p>If you cannot remember your password, create a new account with a different email address.</p>
        <a class="button" href="signup.php">Create an account</a>
        <a class="text-link help-card__login" href="login.php">Return to login</a>
    </div>
</main>
<?php render_footer(); ?>
