<%@ page contentType="text/html;charset=UTF-8"%><%@ taglib prefix="c" uri="jakarta.tags.core"%>
<!doctype html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Profile | RailGo</title>
    <link rel="stylesheet" href="/assets/css/style.css">
</head>

<body><%@ include file="fragments/header.jspf"%><main class="form-page container">
        <p class="eyebrow">ACCOUNT SETTINGS</p>
        <h1>Your profile</h1>
        <c:if test="">
            <p class="success"></p>
        </c:if>
        <form method="post" class="profile-form"><input type="hidden" name="csrf" value=""><label class="field">Full name<input name="fullName" value="" required>
                <c:if test=""><span class="error"></span></c:if>
            </label><label class="field">Email address<input value="" disabled></label><label class="field">Mobile number<input name="mobile" value="" required>
                <c:if test=""><span class="error"></span></c:if>
            </label><button class="button" type="submit">Save changes →</button></form>
    </main><%@ include file="fragments/footer.jspf"%></body>

</html>
