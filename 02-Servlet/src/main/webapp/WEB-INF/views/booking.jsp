<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Passenger details | RailGo</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/assets/css/style.css">
</head>
<body>
<%@ include file="fragments/header.jspf" %>
<main class="form-page page-width">
    <p class="eyebrow">PASSENGER DETAILS</p>
    <h1>Selected journey</h1>

    <c:if test="${not empty error}">
        <p class="form-alert">${error}</p>
    </c:if>

    <c:if test="${not empty schedule}">
        <p>
            ${schedule.trainName} (${schedule.trainNumber})
            &middot; ${schedule.source} &rarr; ${schedule.destination}
            &middot; ${schedule.journeyDate}
            &middot; ${schedule.travelClass}
        </p>
        <p>Server fare: &#8377;${schedule.fare} per passenger</p>

        <form method="post" class="profile-form">
            <input type="hidden" name="csrfToken" value="${csrfToken}">
            <input type="hidden" name="scheduleId" value="${schedule.id}">

            <label class="field">
                Passenger count
                <select name="passengerCount" id="passengerCount">
                    <c:forEach begin="1" end="6" var="count">
                        <option value="${count}">${count}</option>
                    </c:forEach>
                </select>
            </label>

            <div id="passengerFields">
                <fieldset>
                    <legend>Passenger 1</legend>
                    <label class="field">
                        Passenger name
                        <input name="passengerName" required maxlength="100">
                    </label>
                    <label class="field">
                        Age
                        <input name="passengerAge" type="number" min="1" max="120" required>
                    </label>
                    <label class="field">
                        Gender
                        <select name="passengerGender">
                            <option>Female</option>
                            <option>Male</option>
                            <option>Other</option>
                        </select>
                    </label>
                </fieldset>
            </div>
            <button class="button" type="submit">Continue to demo payment</button>
        </form>
    </c:if>
</main>
<%@ include file="fragments/footer.jspf" %>
<script>
    (function () {
        var countSelect = document.getElementById("passengerCount");
        var fields = document.getElementById("passengerFields");
        if (!countSelect || !fields) {
            return;
        }
        countSelect.addEventListener("change", function () {
            var template = fields.firstElementChild.cloneNode(true);
            fields.innerHTML = "";
            var count = Number(countSelect.value);
            for (var index = 1; index <= count; index++) {
                var copy = template.cloneNode(true);
                copy.querySelector("legend").textContent = "Passenger " + index;
                copy.querySelectorAll("input").forEach(function (input) {
                    input.value = "";
                });
                fields.appendChild(copy);
            }
        });
    })();
</script>
</body>
</html>
