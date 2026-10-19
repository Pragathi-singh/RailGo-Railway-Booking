<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/bootstrap.php';

render_page_head('Password help', 'Information about password recovery for the RailGo local demo.');
render_topbar();
?>
<main class="help-page page-width" id="main-content">
    <a class="back-home" href="login.php"><span aria-hidden="true">&larr;</span> Back to login</a>
    <div class="help-card">
        <p class="eyebrow">ACCOUNT SUPPORT</p>
        <h1>Password recovery</h1>
        <p>This local college demo does not have email delivery or password recovery configured. No email has been sent.</p>
        <p>If you created a demo account and cannot remember its password, create a new account with a different email address or reset the local demo data by stopping Apache and removing <code>01-PHP/data/accounts.json</code>.</p>
        <a class="button" href="signup.php">Create a demo account</a>
        <a class="text-link help-card__login" href="login.php">Return to login</a>
    </div>
</main>
<?php render_footer(); ?>
