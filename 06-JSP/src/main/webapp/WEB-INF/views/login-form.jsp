<%@ taglib prefix="c" uri="jakarta.tags.core"%><form method="post" action="/login" class="auth-form" novalidate><input type="hidden" name="csrf" value="">
    <c:if test="">
        <p class="alert" role="alert"></p>
    </c:if><label class="field">Email address<input type="email" name="email" autocomplete="email" required></label><label class="field">Password<div class="password"><input id="password" type="password" name="password" autocomplete="current-password" required><button type="button" data-password="#password">Show</button></div></label><button class="button full" type="submit">Sign in to RailGo →</button>
</form>
<p class="auth-switch">New to RailGo? <a href="/signup">Create an account</a></p>
<p class="auth-switch"><a href="/forgot-password">Forgot your password?</a></p>
