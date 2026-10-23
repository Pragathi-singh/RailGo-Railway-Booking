from datetime import date
from flask import Blueprint, flash, redirect, render_template, request, session, url_for
from werkzeug.security import check_password_hash, generate_password_hash
from .extensions import db
from .forms import journey_errors, signup_errors
from .models import Booking, User
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
    return render_template("results.html", journey=journey)


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
            user = User(name=data["name"].strip(), email=email, mobile=data["mobile"].strip(),
                        password_hash=generate_password_hash(data["password"]))
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
        if not user or not check_password_hash(user.password_hash, request.form.get("password", "")):
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
        flash("Password recovery email delivery needs to be configured by the site administrator.", "success")
        return redirect(url_for("main.forgot_password"))
    return render_template("forgot-password.html")


@main.get("/dashboard")
@login_required
def dashboard():
    return render_template("dashboard.html", user=db.session.get(User, session["user_id"]))


@main.get("/history")
@login_required
def history():
    bookings = Booking.query.filter_by(user_id=session["user_id"]).order_by(Booking.created_at.desc()).all()
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
        errors = signup_errors({"name": name, "email": user.email, "mobile": mobile,
                                "password": "valid-password", "confirm_password": "valid-password"})
        errors.pop("email", None)
        errors.pop("password", None)
        errors.pop("confirm_password", None)
        if not errors:
            user.name, user.mobile = name, mobile
            db.session.commit()
            flash("Your profile has been updated.", "success")
            return redirect(url_for("main.profile"))
    return render_template("profile.html", user=user, errors=errors)
