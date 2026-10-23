<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="com.railgo.util.Html,com.railgo.util.WebSupport" %>
<%
    String pageTitle = "Plan your journey";
    String fromValue = request.getAttribute("from") instanceof String ? (String) request.getAttribute("from") : "";
    String toValue = request.getAttribute("to") instanceof String ? (String) request.getAttribute("to") : "";
    String dateValue = request.getAttribute("journeyDate") instanceof String ? (String) request.getAttribute("journeyDate") : "";
    String classValue = request.getAttribute("travelClass") instanceof String ? (String) request.getAttribute("travelClass") : "Sleeper";
%>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#102B46">
    <meta name="description" content="Discover RailGo and plan your next railway journey across India.">
    <title><%= pageTitle %> | RailGo</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/assets/css/style.css">
    <script src="${pageContext.request.contextPath}/assets/js/script.js" defer></script>
</head>
<body>
<%@ include file="fragments/header.jspf" %>
<main id="main-content">
    <% Object flashMessageValue = request.getAttribute("flashMessage"); if (flashMessageValue instanceof String) { String flashMessage = (String) flashMessageValue; %>
        <div class="page-width landing-flashes">
            <p class="notice notice--<%= Html.escape((String) request.getAttribute("flashType")) %>" role="status"><%= Html.escape(flashMessage) %></p>
        </div>
    <% } %>
    <section class="hero" aria-labelledby="hero-title">
        <div class="hero__image" role="img" aria-label="Passenger train crossing the lush Konkan landscape in India"></div>
        <div class="hero__content page-width">
            <p class="eyebrow eyebrow--light">A BETTER WAY TO BEGIN</p>
            <h1 id="hero-title">Explore India,<br>One Journey at a Time</h1>
            <p>Book train tickets with ease, comfort and confidence.</p>
            <a class="button button--outline" href="#search">Plan your journey <span aria-hidden="true">&rarr;</span></a>
        </div>
        <div class="hero__caption">Photo: Subumecher, <a href="https://commons.wikimedia.org/wiki/File:Konkan_Express.jpg" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a></div>
    </section>

    <section class="search-section page-width" id="search" aria-labelledby="search-title">
        <div class="search-panel">
            <div class="search-panel__heading">
                <div><p class="eyebrow">YOUR NEXT ADVENTURE</p><h2 id="search-title">Where would you like to go?</h2></div>
                <span class="demo-tag">SEARCH TRAINS</span>
            </div>
            <% Object searchMessageValue = request.getAttribute("searchMessage"); if (searchMessageValue instanceof String) { String searchMessage = (String) searchMessageValue; %>
                <p class="notice notice--info" role="status"><%= Html.escape(searchMessage) %></p>
            <% } %>
            <form action="${pageContext.request.contextPath}/home#search" method="post" class="search-form" novalidate>
                <input type="hidden" name="csrfToken" value="<%= Html.escape(WebSupport.csrfToken(session)) %>">
                <div class="station-fields">
                    <div class="field">
                        <label for="from">From station</label>
                        <input id="from" name="from" type="text" maxlength="120" placeholder="e.g. Mumbai Central" value="<%= Html.escape(fromValue) %>" required aria-describedby="from-hint">
                        <% Object fromErrorValue = request.getAttribute("fromError"); if (fromErrorValue instanceof String) { String error = (String) fromErrorValue; %><span class="field-error"><%= Html.escape(error) %></span><% } else { %><span class="field-hint" id="from-hint">Your departure city or station</span><% } %>
                    </div>
                    <button type="button" class="swap-button" data-swap-stations aria-label="Swap departure and destination" title="Swap stations"><span aria-hidden="true">&#8644;</span></button>
                    <div class="field">
                        <label for="to">To station</label>
                        <input id="to" name="to" type="text" maxlength="120" placeholder="e.g. New Delhi" value="<%= Html.escape(toValue) %>" required aria-describedby="to-hint">
                        <% Object toErrorValue = request.getAttribute("toError"); if (toErrorValue instanceof String) { String error = (String) toErrorValue; %><span class="field-error"><%= Html.escape(error) %></span><% } else { %><span class="field-hint" id="to-hint">Where would you like to arrive?</span><% } %>
                    </div>
                </div>
                <div class="search-form__details">
                    <div class="field">
                        <label for="journey-date">Journey date</label>
                        <input id="journey-date" name="journeyDate" type="date" min="<%= java.time.LocalDate.now() %>" value="<%= Html.escape(dateValue) %>" required>
                        <% Object dateErrorValue = request.getAttribute("dateError"); if (dateErrorValue instanceof String) { String error = (String) dateErrorValue; %><span class="field-error"><%= Html.escape(error) %></span><% } %>
                    </div>
                    <div class="field">
                        <label for="travel-class">Travel class</label>
                        <select id="travel-class" name="travelClass">
                            <% for (String travelClass : new String[]{"Sleeper", "AC 3 Tier", "AC 2 Tier", "AC First Class", "Chair Car"}) { %>
                                <option value="<%= travelClass %>" <%= classValue.equals(travelClass) ? "selected" : "" %>><%= travelClass %></option>
                            <% } %>
                        </select>
                        <% Object classErrorValue = request.getAttribute("classError"); if (classErrorValue instanceof String) { String error = (String) classErrorValue; %><span class="field-error"><%= Html.escape(error) %></span><% } %>
                    </div>
                    <button class="button search-submit" type="submit">Search Trains <span aria-hidden="true">&rarr;</span></button>
                </div>
            </form>
            <p class="demo-disclaimer">Choose your route and travel class to find the right journey.</p>
        </div>
    </section>

    <section class="benefits page-width" aria-labelledby="benefits-title">
        <div class="section-heading"><p class="eyebrow">THE RAILGO DIFFERENCE</p><h2 id="benefits-title">A little more ease in every journey</h2></div>
        <div class="benefit-grid">
            <article class="benefit"><span class="benefit__icon" aria-hidden="true">&#10003;</span><h3>Easy Booking</h3><p>A clear, simple experience from planning to your next stop.</p></article>
            <article class="benefit"><span class="benefit__icon" aria-hidden="true">&#9678;</span><h3>Journey clarity</h3><p>Keep your route, date and travel class clear from the very beginning.</p></article>
            <article class="benefit"><span class="benefit__icon" aria-hidden="true">&#9830;</span><h3>Thoughtful planning</h3><p>Make confident choices with a calm, focused booking experience.</p></article>
            <article class="benefit"><span class="benefit__icon" aria-hidden="true">&#9742;</span><h3>Helpful guidance</h3><p>Find helpful guidance whenever you need a smoother journey.</p></article>
        </div>
    </section>

    <section class="why-section" id="why-railgo" aria-labelledby="why-title">
        <div class="why-section__inner page-width">
            <div class="why-section__image" role="img" aria-label="A passenger train passing through India's Konkan region"></div>
            <div class="why-section__copy">
                <p class="eyebrow">MORE THAN A TICKET</p>
                <h2 id="why-title">Your journey deserves a thoughtful start.</h2>
                <p>RailGo brings the essentials of planning together in one welcoming place. Get ready to discover new cities, reconnect with familiar places, and make the most of the miles in between.</p>
                <a class="text-link" href="${pageContext.request.contextPath}/signup">Get started with RailGo <span aria-hidden="true">&rarr;</span></a>
                <p class="small-print" id="terms">Please use information you are comfortable storing in this local installation.</p>
            </div>
        </div>
    </section>
</main>
<%@ include file="fragments/footer.jspf" %>
