<%@ page contentType="text/html;charset=UTF-8"%><%@ taglib prefix="c" uri="jakarta.tags.core"%>
<!doctype html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Booking history | RailGo</title>
    <link rel="stylesheet" href="/assets/css/style.css">
</head>

<body><%@ include file="fragments/header.jspf"%><main class="dashboard container">
        <p class="eyebrow">YOUR JOURNEYS</p>
        <h1>Booking history</h1>
        <c:choose>
            <c:when test="">
                <section class="empty-state">
                    <h2>Your journeys will appear here</h2><a class="button" href="/home#search">Search trains →</a>
                </section>
            </c:when>
            <c:otherwise>
                <div class="booking-list">
                    <c:forEach var="booking" items="">
                        <article>
                            <h2> → </h2>
                            <p>PNR  ·  ·  · </p>
                            <form method="post"><input type="hidden" name="csrf" value=""><input type="hidden" name="pnr" value=""><button class="button secondary" type="submit">Cancel demo booking</button></form>
                        </article>
                    </c:forEach>
                </div>
            </c:otherwise>
        </c:choose>
    </main><%@ include file="fragments/footer.jspf"%></body>

</html>
