<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Demo payment | RailGo</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/assets/css/style.css">
</head>
<body>
<%@ include file="fragments/header.jspf" %>
<main class="demo-page page-width">
    <p class="eyebrow">DEMO PAYMENT</p>
    <h1>Review &amp; pay</h1>
    <c:if test="${not empty error}">
        <p class="form-alert">${error}</p>
    </c:if>

    <c:if test="${not empty schedule}">
        <div class="payment-layout">
            <section class="demo-card">
                <h2>Fare summary</h2>
                <p>${schedule.trainName} (${schedule.trainNumber})</p>
                <p>${schedule.source} &rarr; ${schedule.destination}</p>
                <p>${passengerCount} passenger(s) &times; &#8377;${schedule.fare}</p>
                <hr>
                <strong>Total &#8377;${totalAmount}</strong>
            </section>
            <form method="post" class="demo-card">
                <input type="hidden" name="csrfToken" value="${csrfToken}">
                <h2>Choose demo payment</h2>
                <label class="checkbox-label">
                    <input type="radio" name="paymentMethod" value="DEMO_UPI" checked>
                    Demo UPI
                </label>
                <label class="checkbox-label">
                    <input type="radio" name="paymentMethod" value="DEMO_WALLET">
                    Demo wallet
                </label>
                <label class="checkbox-label">
                    <input type="radio" name="paymentMethod" value="PAY_ON_COUNTER">
                    Pay at counter
                </label>
                <p class="field-hint">
                    Demonstration only. No card number, CVV or banking credentials are collected.
                </p>
                <button class="button" type="submit">Confirm demo booking</button>
            </form>
        </div>
    </c:if>
</main>
<%@ include file="fragments/footer.jspf" %>
</body>
</html>
