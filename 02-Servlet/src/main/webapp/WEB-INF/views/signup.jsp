<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="com.railgo.util.Html,com.railgo.util.WebSupport" %>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#102B46">
    <meta name="description" content="Create a RailGo demo account."><title>Create account | RailGo</title>
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
            <div class="auth-aside__copy"><p class="eyebrow eyebrow--light">A NEW JOURNEY STARTS HERE</p><h2>Join RailGo Today!</h2><p class="auth-aside__description">Make room for the journeys you have been dreaming about. Getting started is simple.</p>
                <ul class="auth-highlights"><li><span class="highlight-check" aria-hidden="true">&#10003;</span>Keep your travel details together</li><li><span class="highlight-check" aria-hidden="true">&#10003;</span>Plan trips with ease</li><li><span class="highlight-check" aria-hidden="true">&#10003;</span>Find inspiration for your next stop</li></ul>
            </div>
            <p class="auth-aside__footnote">Your Journey, Our Priority.</p>
        </div>
    </aside>
    <section class="auth-main">
        <div class="auth-form-wrap auth-form-wrap--signup">
            <a class="mobile-brand" href="${pageContext.request.contextPath}/home"><span class="brand__mark" aria-hidden="true">RG</span><span class="brand__words"><span class="brand__name">Rail<span>Go</span></span><span class="brand__tagline">Your Journey, Our Priority.</span></span></a>
            <a class="back-home" href="${pageContext.request.contextPath}/home"><span aria-hidden="true">&larr;</span> Back to home</a>
            <p class="eyebrow">A NEW JOURNEY STARTS HERE</p><h1 id="signup-title">Create your account</h1><p class="auth-intro">Join RailGo and bring your travel plans together.</p>
            <% Object formErrorValue = request.getAttribute("formError"); if (formErrorValue instanceof String) { String formError = (String) formErrorValue; %><p class="form-alert" role="alert"><%= Html.escape(formError) %></p><% } %>
            <form action="${pageContext.request.contextPath}/signup" method="post" class="auth-form" data-signup-form novalidate>
                <input type="hidden" name="csrfToken" value="<%= Html.escape(WebSupport.csrfToken(session)) %>">
                <div class="field"><label for="full-name">Full name</label><input id="full-name" name="fullName" type="text" autocomplete="name" maxlength="100" value="<%= Html.escape((String) request.getAttribute("fullName")) %>" required>
                    <% Object nameErrorValue = request.getAttribute("nameError"); if (nameErrorValue instanceof String) { String error = (String) nameErrorValue; %><span class="field-error"><%= Html.escape(error) %></span><% } %>
                </div>
                <div class="field"><label for="email">Email address</label><input id="email" name="email" type="email" autocomplete="email" maxlength="254" value="<%= Html.escape((String) request.getAttribute("email")) %>" required>
                    <% Object emailErrorValue = request.getAttribute("emailError"); if (emailErrorValue instanceof String) { String error = (String) emailErrorValue; %><span class="field-error"><%= Html.escape(error) %></span><% } %>
                </div>
                <div class="field"><label for="mobile">Mobile number</label><input id="mobile" name="mobile" type="tel" autocomplete="tel-national" inputmode="numeric" maxlength="14" placeholder="10-digit Indian mobile number" value="<%= Html.escape((String) request.getAttribute("mobile")) %>" required>
                    <% Object mobileErrorValue = request.getAttribute("mobileError"); if (mobileErrorValue instanceof String) { String error = (String) mobileErrorValue; %><span class="field-error"><%= Html.escape(error) %></span><% } else { %><span class="field-hint">Numbers beginning with 6, 7, 8 or 9</span><% } %>
                </div>
                <div class="field"><label for="password">Password</label><div class="password-control"><input id="password" name="password" type="password" autocomplete="new-password" required aria-describedby="password-hint"><button class="password-toggle" type="button" data-password-toggle="password" aria-label="Show password" aria-pressed="false">Show</button></div>
                    <% Object passwordErrorValue = request.getAttribute("passwordError"); if (passwordErrorValue instanceof String) { String error = (String) passwordErrorValue; %><span class="field-error"><%= Html.escape(error) %></span><% } else { %><span class="field-hint" id="password-hint">8+ characters with uppercase, lowercase and a number</span><% } %>
                </div>
                <div class="field"><label for="confirm-password">Confirm password</label><div class="password-control"><input id="confirm-password" name="confirmPassword" type="password" autocomplete="new-password" required><button class="password-toggle" type="button" data-password-toggle="confirm-password" aria-label="Show password" aria-pressed="false">Show</button></div>
                    <% Object confirmErrorValue = request.getAttribute("confirmError"); if (confirmErrorValue instanceof String) { String error = (String) confirmErrorValue; %><span class="field-error"><%= Html.escape(error) %></span><% } %>
                </div>
                <div class="field field--terms"><label class="checkbox-label checkbox-label--terms"><input type="checkbox" name="terms" value="yes" required> <span>I agree to the <a href="${pageContext.request.contextPath}/home#demo-terms">demo terms and conditions</a>.</span></label>
                    <% Object termsErrorValue = request.getAttribute("termsError"); if (termsErrorValue instanceof String) { String error = (String) termsErrorValue; %><span class="field-error"><%= Html.escape(error) %></span><% } %>
                </div>
                <p class="demo-note demo-note--left">This is a local demonstration. Do not submit real personal information or a reused password.</p>
                <button class="button button--full" type="submit">Create Account <span aria-hidden="true">&rarr;</span></button>
            </form>
            <p class="auth-switch">Already have an account? <a href="${pageContext.request.contextPath}/login">Login</a></p>
        </div>
    </section>
</main>
</body>
</html>
