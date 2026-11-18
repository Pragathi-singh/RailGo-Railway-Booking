<%@ page contentType="text/html;charset=UTF-8"%><%@ page import="com.railgo.jsp.model.DemoBooking"%><%DemoBooking b=(DemoBooking)session.getAttribute("lastBooking");%>
<!doctype html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Booking confirmed | RailGo</title>
    <link rel="stylesheet" href="/assets/css/style.css">
</head>

<body><%@ include file="fragments/header.jspf"%><main class="container">
        <p class="eyebrow">DEMO CONFIRMATION</p>
        <h1>Your journey is confirmed.</h1>
        <section class="empty-state">
            <h2>PNR
                <c:out value="" />
            </h2>
            <p>
                <c:out value="" /> →
                <c:out value="" />
            </p>
            <p>This is session-only demo data; no payment or live reservation was made.</p><a class="button" href="/history">View booking history</a>
        </section>
    </main><%@ include file="fragments/footer.jspf"%></body>

</html>
