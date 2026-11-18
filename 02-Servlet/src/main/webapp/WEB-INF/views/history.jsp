<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>My bookings | RailGo</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/assets/css/style.css">
</head>
<body>
<%@ include file="fragments/header.jspf" %>
<main class="demo-page page-width">
    <p class="eyebrow">MY BOOKINGS</p>
    <h1>Booking history</h1>
    <c:if test="${not empty historyError}">
        <p class="form-alert">${historyError}</p>
    </c:if>

    <c:choose>
        <c:when test="${empty bookings}">
            <section class="demo-card">
                <h2>No bookings yet</h2>
                <p>Your confirmed demo journeys will appear here.</p>
                <a class="button" href="${pageContext.request.contextPath}/home#search">
                    Search trains
                </a>
            </section>
        </c:when>
        <c:otherwise>
            <c:forEach var="booking" items="${bookings}">
                <article class="booking-row">
                    <div>
                        <span class="demo-tag">${booking.pnr}</span>
                        <h2>${booking.trainName}</h2>
                        <p>${booking.source} &rarr; ${booking.destination} &middot; ${booking.journeyDate}</p>
                        <p>${booking.trainNumber} &middot; ${booking.travelClass}</p>
                    </div>
                    <div>
                        <strong>${booking.status}</strong>
                        <p>${booking.passengers.size()} passenger(s)</p>
                        <p>&#8377;${booking.totalAmount}</p>
                    </div>
                    <div>
                        <a class="button button--outline-dark"
                           href="${pageContext.request.contextPath}/confirmation?bookingId=${booking.id}">
                            View ticket
                        </a>
                        <c:if test="${booking.status == 'CONFIRMED'}">
                            <a class="button button--outline-dark"
                               href="${pageContext.request.contextPath}/cancel?bookingId=${booking.id}">
                                Cancel
                            </a>
                        </c:if>
                    </div>
                </article>
            </c:forEach>
        </c:otherwise>
    </c:choose>
</main>
<%@ include file="fragments/footer.jspf" %>
</body>
</html>
