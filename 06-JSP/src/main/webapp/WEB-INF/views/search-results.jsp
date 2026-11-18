<%@ page contentType="text/html;charset=UTF-8"%><%@ taglib prefix="c" uri="jakarta.tags.core"%>
<%@ page import="com.railgo.jsp.web.BookingServlet.Journey,com.railgo.jsp.util.Csrf"%><%Journey j=(Journey)request.getAttribute("journey");%>
<!doctype html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Search results | RailGo</title>
    <link rel="stylesheet" href="/assets/css/style.css">
</head>

<body><%@ include file="fragments/header.jspf"%><main class="results container">
        <p class="eyebrow">SEARCH RESULTS</p>
        <h1>Your demo journey</h1>
        <c:choose>
            <c:when test="">
                <section class="empty-state">
                    <h2>
                        <c:out value="" /> →
                        <c:out value="" />
                    </h2>
                    <p>
                        <c:out value="" /> ·
                        <c:out value="" />
                    </p>
                    <p>Live inventory is not connected, but you can complete the session-only demo workflow.</p><a class="button" href="/book">Enter passenger details →</a>
                </section>
            </c:when>
            <c:otherwise>
                <section class="empty-state error-state">
                    <h2>Search details are missing</h2><a class="button" href="/home#search">Edit search →</a>
                </section>
            </c:otherwise>
        </c:choose>
    </main><%@ include file="fragments/footer.jspf"%></body>

</html>
