<%@ page contentType="text/html;charset=UTF-8"%><%@ page import="com.railgo.jsp.web.BookingServlet.Journey"%><%Journey j=(Journey)request.getAttribute("journey");%>
<!doctype html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Passenger details | RailGo</title>
    <link rel="stylesheet" href="/assets/css/style.css">
</head>

<body><%@ include file="fragments/header.jspf"%><main class="form-page container">
        <p class="eyebrow">DEMO BOOKING</p>
        <h1>Passenger details</h1>
        <p> →  · </p>
        <c:if test="">
            <p class="error"></p>
        </c:if>
        <form method="post" class="profile-form"><input type="hidden" name="csrf" value=""><label class="field">Passenger name<input name="passengerName" required></label><label class="field">Age<input name="passengerAge" type="number" min="1" max="120" required></label><label class="field">Gender<select name="passengerGender">
                    <option>Female</option>
                    <option>Male</option>
                    <option>Other</option>
                </select></label><button class="button" type="submit">Confirm demo booking →</button></form>
    </main><%@ include file="fragments/footer.jspf"%></body>

</html>
