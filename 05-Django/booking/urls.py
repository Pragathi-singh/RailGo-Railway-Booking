from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("signup/", views.signup_view, name="signup"),
    path("login/", views.login_view, name="login"),
    path("dashboard/", views.dashboard, name="dashboard"),
    path("book/<int:schedule_id>/", views.book, name="book"),
    path("booking/<int:booking_id>/", views.confirmation, name="confirmation"),
    path("history/", views.history, name="history"),
    path(
        "booking/<int:booking_id>/cancel/", views.cancel_booking, name="cancel_booking"
    ),
    path("logout/", views.logout_view, name="logout"),
]
