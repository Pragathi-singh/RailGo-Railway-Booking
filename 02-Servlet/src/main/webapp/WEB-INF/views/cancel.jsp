<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Cancel booking | RailGo</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/assets/css/style.css">
</head>
<body>
<%@ include file="fragments/header.jspf" %>
<main class="demo-page page-width">
    <p class="eyebrow">CANCEL BOOKING</p>
    <h1>Confirm cancellation</h1>
    <section class="demo-card">
        <h2>${booking.trainName} &middot; ${booking.pnr}</h2>
        <p>${booking.source} &rarr; ${booking.destination}</p>
        <p>Status: ${booking.status}</p>
        <c:choose>
            <c:when test="${booking.status == 'CONFIRMED'}">
                <form method="post">
                    <input type="hidden" name="csrfToken" value="${csrfToken}">
                    <input type="hidden" name="bookingId" value="${booking.id}">
                    <button class="button" type="submit">Confirm cancellation</button>
                </form>
            </c:when>
            <c:otherwise>
                <p>This booking is already cancelled.</p>
            </c:otherwise>
        </c:choose>
    </section>
</main>
<%@ include file="fragments/footer.jspf" %>
</body>
</html>
