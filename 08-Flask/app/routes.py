from datetime import date
from decimal import Decimal
from secrets import token_hex
from flask import Blueprint, flash, redirect, render_template, request, session, url_for
from werkzeug.security import check_password_hash, generate_password_hash
from .extensions import db
from .forms import journey_errors, signup_errors
from .models import Booking, Passenger, Payment, Train, TrainSchedule, User
from .security import login_required, validate_csrf

main = Blueprint("main", __name__)
CLASSES = ["Sleeper", "AC 3 Tier", "AC 2 Tier", "AC First Class", "Chair Car"]


@main.context_processor
def current_user():
    user = db.session.get(User, session["user_id"]) if session.get("user_id") else None
    return {"current_user": user}


@main.route("/", methods=["GET", "POST"])
def home():
    data = {"journey_date": date.today().isoformat(), "travel_class": CLASSES[0]}
    errors = {}
    if request.method == "POST":
        validate_csrf(request.form.get("csrf"))
        data = request.form.to_dict()
        errors = journey_errors(data)
        if not errors:
            session["journey"] = data
            return redirect(url_for("main.results"))
    return render_template("home.html", data=data, errors=errors, classes=CLASSES)


@main.route("/results")
def results():
    journey = session.get("journey")
    schedules = []
    if journey:
        schedules = (
            TrainSchedule.query.join(Train)
            .filter(
                TrainSchedule.journey_date
                == date.fromisoformat(journey["journey_date"]),
                TrainSchedule.travel_class == journey["travel_class"],
                TrainSchedule.available_seats > 0,
                Train.source_station.ilike(journey["origin"]),
                Train.destination_station.ilike(journey["destination"]),
            )
            .all()
        )
    return render_template("results.html", journey=journey, schedules=schedules)


@main.route("/book/<int:schedule_id>", methods=["GET", "POST"])
@login_required
def book(schedule_id):
    schedule = db.session.get(TrainSchedule, schedule_id)
    if not schedule or schedule.available_seats < 1:
        flash("That schedule is no longer available.", "error")
        return redirect(url_for("main.results"))
    if request.method == "POST":
        validate_csrf(request.form.get("csrf"))
        try:
            count = int(request.form.get("passenger_count", "0"))
        except ValueError:
            count = 0
        if count < 1 or count > schedule.available_seats or count > 6:
            return render_template(
                "booking.html",
                schedule=schedule,
                error="Choose between 1 and 6 available passengers.",
            )
        passengers = []
        for index in range(1, count + 1):
            name = request.form.get(f"passenger_name_{index}", "").strip()
            gender = request.form.get(f"passenger_gender_{index}", "").strip()
            try:
                age = int(request.form.get(f"passenger_age_{index}", "0"))
            except ValueError:
                age = 0
            if (
                len(name) < 2
                or not 1 <= age <= 120
                or gender not in {"Female", "Male", "Other"}
            ):
                return render_template(
                    "booking.html",
                    schedule=schedule,
                    error="Enter valid name, age and gender for every passenger.",
                )
            passengers.append((name, age, gender))
        pnr = f"RG{date.today():%y%m%d}{token_hex(3).upper()}"
        booking = Booking(
            pnr=pnr,
            user_id=session["user_id"],
            schedule_id=schedule.id,
            origin=schedule.train.source_station,
            destination=schedule.train.destination_station,
            journey_date=schedule.journey_date,
            travel_class=schedule.travel_class,
            passenger_count=count,
            total_fare=Decimal(schedule.fare) * count,
        )
        schedule.available_seats -= count
        db.session.add(booking)
        db.session.flush()
        for offset, (name, age, gender) in enumerate(passengers, 1):
            db.session.add(
                Passenger(
                    booking_id=booking.id,
                    passenger_name=name,
                    age=age,
                    gender=gender,
                    seat_number=f"{schedule.travel_class[:2].upper()}-{schedule.total_seats - schedule.available_seats + offset}",
                )
            )
        db.session.add(
            Payment(
                booking_id=booking.id,
                amount=booking.total_fare,
                transaction_reference=f"DEMO-{token_hex(6).upper()}",
            )
        )
        db.session.commit()
        return redirect(url_for("main.confirmation", booking_id=booking.id))
    return render_template("booking.html", schedule=schedule)


@main.get("/booking/<int:booking_id>")
@login_required
def confirmation(booking_id):
    booking = Booking.query.filter_by(
        id=booking_id, user_id=session["user_id"]
    ).first_or_404()
    return render_template("confirmation.html", booking=booking)


@main.post("/booking/<int:booking_id>/cancel")
@login_required
def cancel_booking(booking_id):
    validate_csrf(request.form.get("csrf"))
    booking = Booking.query.filter_by(
        id=booking_id, user_id=session["user_id"]
    ).first_or_404()
    if booking.booking_status != "CONFIRMED" or booking.journey_date < date.today():
        flash("This booking can no longer be cancelled.", "error")
    else:
        schedule = db.session.get(TrainSchedule, booking.schedule_id)
        if schedule:
            schedule.available_seats += booking.passenger_count
        booking.booking_status = "CANCELLED"
        db.session.commit()
        flash("Your booking was cancelled and the seats were released.", "success")
    return redirect(url_for("main.history"))


@main.route("/signup", methods=["GET", "POST"])
def signup():
    data = {}
    errors = {}
    if request.method == "POST":
        validate_csrf(request.form.get("csrf"))
        data = request.form.to_dict()
        errors = signup_errors(data)
        email = data.get("email", "").strip().lower()
        if User.query.filter_by(email=email).first():
            errors["email"] = "An account with this email already exists."
        if not errors:
            user = User(
                name=data["name"].strip(),
                email=email,
                mobile=data["mobile"].strip(),
                password_hash=generate_password_hash(data["password"]),
            )
            db.session.add(user)
            db.session.commit()
            session["user_id"] = user.id
            flash("Your account is ready.", "success")
            return redirect(url_for("main.dashboard"))
    return render_template("signup.html", data=data, errors=errors)


@main.route("/login", methods=["GET", "POST"])
def login():
    errors = {}
    if request.method == "POST":
        validate_csrf(request.form.get("csrf"))
        email = request.form.get("email", "").strip().lower()
        user = User.query.filter_by(email=email).first()
        if not user or not check_password_hash(
            user.password_hash, request.form.get("password", "")
        ):
            errors["form"] = "We could not sign you in with those details."
        else:
            session.clear()
            session["user_id"] = user.id
            return redirect(url_for("main.dashboard"))
    return render_template("login.html", errors=errors)


@main.post("/logout")
def logout():
    validate_csrf(request.form.get("csrf"))
    session.clear()
    flash("You have been signed out.", "success")
    return redirect(url_for("main.home"))


@main.route("/forgot-password", methods=["GET", "POST"])
def forgot_password():
    if request.method == "POST":
        validate_csrf(request.form.get("csrf"))
        flash(
            "Password recovery email delivery needs to be configured by the site administrator.",
            "success",
        )
        return redirect(url_for("main.forgot_password"))
    return render_template("forgot-password.html")


@main.get("/dashboard")
@login_required
def dashboard():
    return render_template(
        "dashboard.html", user=db.session.get(User, session["user_id"])
    )


@main.get("/history")
@login_required
def history():
    bookings = (
        Booking.query.filter_by(user_id=session["user_id"])
        .order_by(Booking.created_at.desc())
        .all()
    )
    return render_template("history.html", bookings=bookings)


@main.route("/profile", methods=["GET", "POST"])
@login_required
def profile():
    user = db.session.get(User, session["user_id"])
    errors = {}
    if request.method == "POST":
        validate_csrf(request.form.get("csrf"))
        name = request.form.get("name", "").strip()
        mobile = request.form.get("mobile", "").strip()
        errors = signup_errors(
            {
                "name": name,
                "email": user.email,
                "mobile": mobile,
                "password": "valid-password",
                "confirm_password": "valid-password",
            }
        )
        errors.pop("email", None)
        errors.pop("password", None)
        errors.pop("confirm_password", None)
        if not errors:
            user.name, user.mobile = name, mobile
            db.session.commit()
            flash("Your profile has been updated.", "success")
            return redirect(url_for("main.profile"))
    return render_template("profile.html", user=user, errors=errors)
