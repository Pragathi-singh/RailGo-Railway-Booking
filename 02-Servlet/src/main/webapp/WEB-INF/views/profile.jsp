<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>My profile | RailGo</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/assets/css/style.css">
</head>
<body>
<%@ include file="fragments/header.jspf" %>
<main class="demo-page page-width">
    <p class="eyebrow">MY ACCOUNT</p>
    <h1>Profile</h1>
    <c:if test="${not empty flashMessage}">
        <p class="notice notice--${flashType}">${flashMessage}</p>
    </c:if>
    <c:if test="${not empty profileError}">
        <p class="form-alert">${profileError}</p>
    </c:if>
    <form method="post" class="demo-card profile-form">
        <input type="hidden" name="csrfToken" value="${csrfToken}">
        <div class="field">
            <label for="fullName">Full name</label>
            <input id="fullName" name="fullName" value="${user.fullName}" required>
        </div>
        <div class="field">
            <label for="email">Email</label>
            <input id="email" value="${user.email}" readonly>
        </div>
        <div class="field">
            <label for="mobile">Mobile</label>
            <input id="mobile" name="mobile" value="${user.mobile}" required>
        </div>
        <button class="button" type="submit">Save profile</button>
    </form>
</main>
<%@ include file="fragments/footer.jspf" %>
</body>
</html>
