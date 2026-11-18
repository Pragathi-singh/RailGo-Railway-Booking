<%@ page contentType="text/html;charset=UTF-8" %>
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Reset password | RailGo</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/assets/css/style.css">
</head>
<body>
<%@ include file="fragments/header.jspf" %>
<main class="help-page page-width">
    <div class="help-card">
        <p class="eyebrow">LOCAL DEMO RESET</p>
        <h1>Reset password</h1>
        <%if(request.getAttribute("resetError")!=null){%>
        <p class="form-alert"><%=com.railgo.util.Html.escape((String)request.getAttribute("resetError"))%></p>
        <%}%>
        <form method="post" class="demo-card profile-form">
            <input type="hidden" name="csrfToken" value="${csrfToken}">
            <input type="hidden" name="token" value="<%=com.railgo.util.Html.escape((String)request.getAttribute("token"))%>">
            <div class="field"><label for="password">New password</label><input id="password" name="password" type="password" required></div>
            <div class="field"><label for="confirmPassword">Confirm password</label><input id="confirmPassword" name="confirmPassword" type="password" required></div>
            <button class="button" type="submit">Update password</button>
        </form>
    </div>
</main>
<%@ include file="fragments/footer.jspf" %>
</body>
</html>
