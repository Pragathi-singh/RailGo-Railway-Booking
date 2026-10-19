<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="com.railgo.util.Html,com.railgo.util.WebSupport" %>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#102B46">
    <meta name="description" content="Log in to your RailGo demo account."><title>Login | RailGo</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/assets/css/style.css">
    <script src="${pageContext.request.contextPath}/assets/js/script.js" defer></script>
</head>
<body>
<main class="auth-layout" id="main-content">
    <aside class="auth-aside">
        <div class="auth-aside__photo" aria-hidden="true"></div>
        <div class="auth-aside__content">
            <a class="brand brand--light" href="${pageContext.request.contextPath}/home">
                <span class="brand__mark" aria-hidden="true"><svg viewBox="0 0 36 36" focusable="false"><path d="M10 5h16a5 5 0 0 1 5 5v13a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V10a5 5 0 0 1 5-5Z"/><path d="M11 11h14v8H11zM10 23h16M12 28l-3 4m15-4 3 4M11 8l-3-3m17 3 3-3"/><circle cx="12" cy="23" r="1.4"/><circle cx="24" cy="23" r="1.4"/></svg></span>
                <span class="brand__words"><span class="brand__name">Rail<span>Go</span></span><span class="brand__tagline">Your Journey, Our Priority.</span></span>
            </a>
            <div class="auth-aside__copy"><p class="eyebrow eyebrow--light">TRAVEL, MADE THOUGHTFUL</p><h2>Welcome Back!</h2><p class="auth-aside__description">Sign in to explore the account experience. Booking management and live PNR services are not connected in this local demo.</p>
                <ul class="auth-highlights"><li><span class="highlight-check" aria-hidden="true">&#10003;</span>Manage your bookings</li><li><span class="highlight-check" aria-hidden="true">&#10003;</span>Check PNR status</li><li><span class="highlight-check" aria-hidden="true">&#10003;</span>Explore new destinations</li></ul>
            </div>
            <blockquote class="travel-quote"><span aria-hidden="true">&ldquo;</span>The journey is the destination.</blockquote><p class="auth-aside__footnote">Your Journey, Our Priority.</p>
        </div>
    </aside>
    <section class="auth-main">
        <div class="auth-form-wrap">
            <a class="mobile-brand" href="${pageContext.request.contextPath}/home"><span class="brand__mark" aria-hidden="true">RG</span><span class="brand__words"><span class="brand__name">Rail<span>Go</span></span><span class="brand__tagline">Your Journey, Our Priority.</span></span></a>
            <a class="back-home" href="${pageContext.request.contextPath}/home"><span aria-hidden="true">&larr;</span> Back to home</a>
            <p class="eyebrow">GOOD TO SEE YOU AGAIN</p><h1 id="login-title">Login to RailGo</h1><p class="auth-intro">Enter your details to continue your journey.</p>
            <% Object flashMessageValue = request.getAttribute("flashMessage"); if (flashMessageValue instanceof String) { String message = (String) flashMessageValue; %>
                <p class="notice notice--success" role="status"><%= Html.escape(message) %></p>
            <% } %>
            <% Object formErrorValue = request.getAttribute("formError"); if (formErrorValue instanceof String) { String error = (String) formErrorValue; %>
                <p class="form-alert" role="alert"><%= Html.escape(error) %></p>
            <% } %>
            <form action="${pageContext.request.contextPath}/login" method="post" class="auth-form" novalidate>
                <input type="hidden" name="csrfToken" value="<%= Html.escape(WebSupport.csrfToken(session)) %>">
                <div class="field"><label for="email">Email address</label><input id="email" name="email" type="email" autocomplete="username" maxlength="254" value="<%= Html.escape((String) request.getAttribute("email")) %>" required></div>
                <div class="field"><label for="password">Password</label><div class="password-control"><input id="password" name="password" type="password" autocomplete="current-password" required><button class="password-toggle" type="button" data-password-toggle="password" aria-label="Show password" aria-pressed="false">Show</button></div></div>
                <p class="demo-note demo-note--left">Local college demo only. Do not reuse a real password here.</p>
                <button class="button button--full" type="submit">Login <span aria-hidden="true">&rarr;</span></button>
            </form>
            <p class="auth-switch">New to RailGo? <a href="${pageContext.request.contextPath}/signup">Create an Account</a></p>
            <p class="auth-switch auth-switch--small">Demo accounts are kept in memory and cleared when the server restarts.</p>
        </div>
    </section>
</main>
</body>
</html>
