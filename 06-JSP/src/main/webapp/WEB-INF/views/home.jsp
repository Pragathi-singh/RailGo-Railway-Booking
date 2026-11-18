<%@ page contentType="text/html;charset=UTF-8"%><%@ taglib prefix="c" uri="jakarta.tags.core"%>
<!doctype html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>RailGo | Your Journey, Our Priority</title>
    <link rel="stylesheet" href="/assets/css/style.css">
    <script src="/assets/js/script.js" defer></script>
</head>

<body>
    <%@ include file="fragments/header.jspf"%><main>
        <section class="hero">
            <div class="hero-content container">
                <p class="eyebrow eyebrow-light">YOUR JOURNEY, OUR PRIORITY</p>
                <h1>Explore India,<br><em>One Journey at a Time</em></h1>
                <p>From bustling cities to quiet coastlines, plan your next railway journey with clarity.</p><a class="button button-outline" href="#search">Plan your journey →</a>
            </div>
        </section>
        <section class="search-card container" id="search">
            <div class="search-heading">
                <div>
                    <p class="eyebrow">PLAN YOUR JOURNEY</p>
                    <h2>Where will you go next?</h2>
                </div><span class="pill">Search trains</span>
            </div>
            <form method="post" action="/search" class="search-form" novalidate><input type="hidden" name="csrf" value="">
                <div class="station-fields">
                    <div class="field"><label for="from">From station</label><input id="from" name="from" value="" placeholder="e.g. Mumbai Central" required>
                        <c:if test=""><span class="error"></span></c:if>
                    </div><button type="button" class="swap" data-swap aria-label="Swap stations">⇄</button>
                    <div class="field"><label for="to">To station</label><input id="to" name="to" value="" placeholder="e.g. New Delhi" required>
                        <c:if test=""><span class="error"></span></c:if>
                    </div>
                </div>
                <div class="field"><label for="journeyDate">Journey date</label><input id="journeyDate" name="journeyDate" type="date" min="<%= java.time.LocalDate.now()%>" value="" required>
                    <c:if test=""><span class="error"></span></c:if>
                </div>
                <div class="field"><label for="travelClass">Travel class</label><select id="travelClass" name="travelClass">
                        <c:forEach var="clazz" items="">
                            <option value="" ></option>
                        </c:forEach>
                    </select></div><button class="button" type="submit">Search trains →</button>
            </form>
        </section>
        <section class="section container">
            <div class="section-heading">
                <p class="eyebrow">THE RAILGO DIFFERENCE</p>
                <h2>Travel thoughtfully. <em>Arrive inspired.</em></h2>
                <p>Everything you need for a smoother, more memorable railway journey.</p>
            </div>
            <div class="cards">
                <article><b>✦</b>
                    <h3>Simple planning</h3>
                    <p>Bring your route, date and class together in one calm experience.</p>
                </article>
                <article><b>⌁</b>
                    <h3>Journey clarity</h3>
                    <p>Make confident choices from the very beginning of your journey.</p>
                </article>
                <article><b>♡</b>
                    <h3>Made for India</h3>
                    <p>Thoughtful details for the journeys that connect our country.</p>
                </article>
            </div>
        </section>
    </main><%@ include file="fragments/footer.jspf"%></body>

</html>
