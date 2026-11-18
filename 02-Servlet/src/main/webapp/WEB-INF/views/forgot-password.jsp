<%@ page contentType="text/html;charset=UTF-8"%><%@ page import="com.railgo.util.Html"%>
<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Password help | RailGo</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/assets/css/style.css">
</head>

<body>
    <main class="auth-main page-width">
        <p class="eyebrow">ACCOUNT HELP</p>
        <h1>Reset your password</h1>
        <p>No email service is configured. A local demo reset link may be prepared; no password or reset email is sent.</p>
        <%if(request.getAttribute("resetMessage")!=null){%><p class="notice notice--info"><%=Html.escape((String)request.getAttribute("resetMessage"))%></p><%}%>
        <%if(request.getAttribute("demoResetToken")!=null){%><p><a href="<%=request.getContextPath()%>/reset-password?token=<%=Html.escape((String)request.getAttribute("demoResetToken"))%>">Open local demo reset</a></p><%}%>
        <form method="post" class="profile-form"><input type="hidden" name="csrfToken" value="<%=Html.escape((String)request.getAttribute("csrfToken"))%>"><label class="field">Email address<input name="email" type="email" required></label><button class="button" type="submit">Prepare demo reset</button></form>
        <p><a href="${pageContext.request.contextPath}/login">Back to login</a></p>
    </main>
</body>

</html>
