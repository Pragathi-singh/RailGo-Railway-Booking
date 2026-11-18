<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ page import="com.railgo.util.Html" %>
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Search results | RailGo</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/assets/css/style.css">
</head>
<body>
<%@ include file="fragments/header.jspf" %>
<main class="demo-page page-width">
    <p class="eyebrow">DEMO TRAIN SEARCH</p>
    <h1>Choose your journey</h1>

    <c:if test="${not empty searchError}">
        <p class="form-alert">${searchError}</p>
    </c:if>

    <c:choose>
        <c:when test="${empty results}">
            <section class="demo-card">
                <h2>No matching trains</h2>
                <p>Try another route, date or travel class.</p>
                <a class="button" href="${pageContext.request.contextPath}/home#search">
                    Modify search
                </a>
            </section>
        </c:when>
        <c:otherwise>
            <div class="train-list" aria-label="Available trains">
                <c:forEach var="train" items="${results}">
                    <article class="train-card">
                        <div>
                            <span class="demo-tag">${train.trainNumber}</span>
                            <h2>${train.trainName}</h2>
                            <p>${train.source} &rarr; ${train.destination}</p>
                        </div>
                        <div>
                            <strong>${train.departureTime}</strong>
                            <span>Departure</span>
                        </div>
                        <div>
                            <strong>${train.duration}</strong>
                            <span>${train.arrivalTime} arrival</span>
                        </div>
                        <div>
                            <strong>&#8377;${train.fare}</strong>
                            <span>${train.travelClass}</span>
                        </div>
                        <form method="get" action="${pageContext.request.contextPath}/book">
                            <input type="hidden" name="scheduleId" value="${train.id}">
                            <button class="button" type="submit">Select</button>
                            <small>${train.availableSeats} seats available</small>
                        </form>
                    </article>
                </c:forEach>
            </div>
        </c:otherwise>
    </c:choose>
</main>
<%@ include file="fragments/footer.jspf" %>
</body>
</html>
