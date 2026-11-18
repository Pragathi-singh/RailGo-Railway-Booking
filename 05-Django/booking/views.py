from django.contrib import messages
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
from django.db import transaction
from django.contrib.auth.models import User
import secrets
from django.utils.http import url_has_allowed_host_and_scheme

from .forms import LoginForm, SignupForm, TrainSearchForm
from .models import Booking, Passenger, Payment, Train, TrainSchedule


def home(request):
    search_form = TrainSearchForm(request.POST or None)
    schedules = []
    if request.method == "POST" and search_form.is_valid():
        data = search_form.cleaned_data
        schedules = TrainSchedule.objects.select_related("train").filter(
            train__source_station__iexact=data["from_station"],
            train__destination_station__iexact=data["to_station"],
            journey_date=data["journey_date"],
            travel_class=data["travel_class"],
            available_seats__gt=0,
        )
    return render(
        request,
        "booking/home.html",
        {"search_form": search_form, "schedules": schedules},
    )


def signup_view(request):
    if request.user.is_authenticated:
        return redirect("dashboard")
    form = SignupForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        user = form.save()
        login(request, user)
        messages.success(request, "Your RailGo account is ready. Welcome aboard!")
        return redirect("dashboard")
    return render(
        request,
        "booking/signup.html",
        {
            "form": form,
            "heading": "Create your account",
            "eyebrow": "A NEW JOURNEY STARTS HERE",
            "intro": "Join RailGo and bring your travel plans together.",
        },
    )


def login_view(request):
    if request.user.is_authenticated:
        return redirect("dashboard")
    form = LoginForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        login(request, form.cleaned_data["user"])
        next_url = request.GET.get("next")
        if next_url and url_has_allowed_host_and_scheme(
            next_url, {request.get_host()}, require_https=request.is_secure()
        ):
            return redirect(next_url)
        return redirect("dashboard")
    return render(
        request,
        "booking/login.html",
        {
            "form": form,
            "heading": "Welcome back",
            "eyebrow": "GOOD TO SEE YOU",
            "intro": "Log in to pick up where your next journey begins.",
        },
    )


@login_required
def dashboard(request):
    return render(request, "booking/dashboard.html")


@login_required
def book(request, schedule_id):
    schedule = TrainSchedule.objects.select_related("train").get(pk=schedule_id)
    if request.method == "POST":
        names = request.POST.getlist("passenger_name")
        ages = request.POST.getlist("passenger_age")
        genders = request.POST.getlist("passenger_gender")
        if (
            not names
            or len(names) > 6
            or len(names) != len(ages)
            or len(names) != len(genders)
        ):
            return render(
                request,
                "booking/book.html",
                {"schedule": schedule, "error": "Enter valid passenger details."},
            )
        with transaction.atomic():
            locked = TrainSchedule.objects.select_for_update().get(pk=schedule.id)
            if locked.available_seats < len(names):
                return render(
                    request,
                    "booking/book.html",
                    {"schedule": schedule, "error": "Not enough seats available."},
                )
            booking = Booking.objects.create(
                user=request.user,
                schedule=locked,
                origin=locked.train.source_station,
                destination=locked.train.destination_station,
                journey_date=locked.journey_date,
                travel_class=locked.travel_class,
                passenger_count=len(names),
                total_fare=locked.fare * len(names),
            )
            locked.available_seats -= len(names)
            locked.save(update_fields=["available_seats"])
            for index, (name, age, gender) in enumerate(zip(names, ages, genders), 1):
                Passenger.objects.create(
                    booking=booking,
                    passenger_name=name.strip(),
                    age=int(age),
                    gender=gender,
                    seat_number=f"{locked.travel_class[:2].upper()}-{locked.total_seats - locked.available_seats + index}",
                )
            Payment.objects.create(
                booking=booking,
                amount=booking.total_fare,
                transaction_reference=f"DEMO-{secrets.token_hex(6).upper()}",
            )
        return redirect("confirmation", booking_id=booking.id)
    return render(request, "booking/book.html", {"schedule": schedule})


@login_required
def confirmation(request, booking_id):
    booking = Booking.objects.prefetch_related("passengers").get(
        pk=booking_id, user=request.user
    )
    return render(request, "booking/confirmation.html", {"booking": booking})


@login_required
def history(request):
    return render(
        request,
        "booking/history.html",
        {"bookings": request.user.bookings.order_by("-created_at")},
    )


@login_required
def cancel_booking(request, booking_id):
    if request.method != "POST":
        return redirect("history")
    with transaction.atomic():
        booking = Booking.objects.select_for_update().get(
            pk=booking_id, user=request.user
        )
        if booking.booking_status == "CONFIRMED":
            schedule = TrainSchedule.objects.select_for_update().get(
                pk=booking.schedule_id
            )
            schedule.available_seats += booking.passenger_count
            schedule.save(update_fields=["available_seats"])
            booking.booking_status = "CANCELLED"
            booking.save(update_fields=["booking_status"])
    return redirect("history")


def logout_view(request):
    if request.method == "POST":
        logout(request)
        messages.success(request, "You have been logged out securely.")
    return redirect("home")


def custom_404(request, exception):
    return render(request, "404.html", status=404)
