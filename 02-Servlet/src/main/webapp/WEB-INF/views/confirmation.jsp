<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Booking confirmed | RailGo</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/assets/css/style.css">
</head>
<body>
<%@ include file="fragments/header.jspf" %>
<main class="demo-page page-width" id="printable-ticket">
    <section class="confirmation-card">
        <p class="eyebrow">BOOKING CONFIRMED</p>
        <h1>Thank you for choosing RailGo</h1>
        <c:if test="${not empty booking}">
            <div class="pnr">PNR <strong>${booking.pnr}</strong></div>
            <p><strong>${booking.trainName}</strong> &middot; ${booking.trainNumber}</p>
            <p>
                ${booking.source} &rarr; ${booking.destination}
                &middot; ${booking.journeyDate}
                &middot; ${booking.departureTime} to ${booking.arrivalTime}
            </p>
            <p>
                ${booking.travelClass} &middot;
                ${booking.passengers.size()} passenger(s) &middot;
                &#8377;${booking.totalAmount}
            </p>
            <h2>Passengers</h2>
            <ul>
                <c:forEach var="passenger" items="${booking.passengers}">
                    <li>
                        ${passenger.passengerName} &middot;
                        ${passenger.age} years &middot;
                        ${passenger.gender}
                    </li>
                </c:forEach>
            </ul>
            <c:if test="${not empty booking.payment}">
                <p>
                    Payment: ${booking.payment.paymentStatus}
                    &middot; ${booking.payment.paymentMethod}
                    &middot; Demo reference ${booking.payment.transactionReference}
                </p>
            </c:if>
            <p>Status: <strong>${booking.status}</strong></p>
        </c:if>
        <button class="button" type="button" onclick="window.print()">Print ticket</button>
        <a class="button" href="${pageContext.request.contextPath}/history">View booking history</a>
        <a class="text-link" href="${pageContext.request.contextPath}/home">Book another journey</a>
    </section>
</main>
<%@ include file="fragments/footer.jspf" %>
</body>
</html>
