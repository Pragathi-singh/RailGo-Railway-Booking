<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="com.railgo.model.PublicUser,com.railgo.util.Html" %>
<%
    PublicUser dashboardUser = (PublicUser) request.getAttribute("currentUser");
%>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#102B46">
    <meta name="description" content="Your RailGo demo account."><title>My RailGo | RailGo</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/assets/css/style.css">
    <script src="${pageContext.request.contextPath}/assets/js/script.js" defer></script>
</head>
<body>
<%@ include file="fragments/header.jspf" %>
<main id="main-content" class="dashboard page-width">
    <% Object flashMessageValue = request.getAttribute("flashMessage"); if (flashMessageValue instanceof String) { String message = (String) flashMessageValue; %><p class="notice notice--success" role="status"><%= Html.escape(message) %></p><% } %>
    <p class="eyebrow">YOUR RAILGO ACCOUNT</p>
    <h1>Welcome, <%= Html.escape(dashboardUser.fullName()) %>.</h1>
    <p class="dashboard__intro">This is your protected RailGo demo welcome page. Account data is held only in memory for this running server.</p>
    <section class="account-card" aria-labelledby="account-details">
        <div><p class="eyebrow">ACCOUNT DETAILS</p><h2 id="account-details">Your profile</h2></div>
        <dl><div><dt>Full name</dt><dd><%= Html.escape(dashboardUser.fullName()) %></dd></div><div><dt>Email</dt><dd><%= Html.escape(dashboardUser.email()) %></dd></div><div><dt>Mobile</dt><dd><%= Html.escape(dashboardUser.mobile()) %></dd></div></dl>
        <p class="notice notice--info">Bookings, train schedules, PNR status, and payments are not connected in this college project.</p>
        <a class="button" href="${pageContext.request.contextPath}/home#search">Explore the search demo</a>
    </section>
</main>
<%@ include file="fragments/footer.jspf" %>
