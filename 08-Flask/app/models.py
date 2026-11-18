from datetime import datetime, timezone
from .extensions import db


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    mobile = db.Column(db.String(30), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    bookings = db.relationship(
        "Booking", backref="user", lazy=True, cascade="all, delete-orphan"
    )


class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pnr = db.Column(db.String(16), unique=True, nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    schedule_id = db.Column(
        db.Integer, db.ForeignKey("train_schedule.id"), nullable=False
    )
    origin = db.Column(db.String(120), nullable=False)
    destination = db.Column(db.String(120), nullable=False)
    journey_date = db.Column(db.Date, nullable=False)
    travel_class = db.Column(db.String(60), nullable=False)
    passenger_count = db.Column(db.Integer, nullable=False)
    total_fare = db.Column(db.Numeric(10, 2), nullable=False)
    booking_status = db.Column(db.String(30), nullable=False, default="CONFIRMED")
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    passengers = db.relationship(
        "Passenger", backref="booking", cascade="all, delete-orphan"
    )
    payment = db.relationship(
        "Payment", backref="booking", uselist=False, cascade="all, delete-orphan"
    )


class Train(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    train_number = db.Column(db.String(20), unique=True, nullable=False)
    train_name = db.Column(db.String(120), nullable=False)
    source_station = db.Column(db.String(120), nullable=False)
    destination_station = db.Column(db.String(120), nullable=False)
    departure_time = db.Column(db.String(10), nullable=False)
    arrival_time = db.Column(db.String(10), nullable=False)
    duration = db.Column(db.String(30), nullable=False)
    running_days = db.Column(db.String(80), nullable=False)
    schedules = db.relationship(
        "TrainSchedule", backref="train", cascade="all, delete-orphan"
    )


class TrainSchedule(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    train_id = db.Column(db.Integer, db.ForeignKey("train.id"), nullable=False)
    journey_date = db.Column(db.Date, nullable=False, index=True)
    travel_class = db.Column(db.String(60), nullable=False)
    total_seats = db.Column(db.Integer, nullable=False)
    available_seats = db.Column(db.Integer, nullable=False)
    fare = db.Column(db.Numeric(10, 2), nullable=False)
    __table_args__ = (db.UniqueConstraint("train_id", "journey_date", "travel_class"),)


class Passenger(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey("booking.id"), nullable=False)
    passenger_name = db.Column(db.String(120), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(20), nullable=False)
    seat_number = db.Column(db.String(20), nullable=False)


class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(
        db.Integer, db.ForeignKey("booking.id"), nullable=False, unique=True
    )
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    payment_method = db.Column(db.String(30), nullable=False, default="DEMO")
    payment_status = db.Column(db.String(30), nullable=False, default="DEMO_CONFIRMED")
    transaction_reference = db.Column(db.String(40), nullable=False, unique=True)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
