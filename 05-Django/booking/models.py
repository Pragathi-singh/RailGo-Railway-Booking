from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone
import secrets


def new_pnr():
    return f"RG{secrets.token_hex(5).upper()}"


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    mobile = models.CharField(max_length=10)

    def __str__(self):
        return self.user.email or self.user.username


class Train(models.Model):
    train_number = models.CharField(max_length=20, unique=True)
    train_name = models.CharField(max_length=120)
    source_station = models.CharField(max_length=120)
    destination_station = models.CharField(max_length=120)
    departure_time = models.CharField(max_length=10)
    arrival_time = models.CharField(max_length=10)
    duration = models.CharField(max_length=30)
    running_days = models.CharField(max_length=80, default="Daily")


class TrainSchedule(models.Model):
    train = models.ForeignKey(Train, on_delete=models.CASCADE, related_name="schedules")
    journey_date = models.DateField()
    travel_class = models.CharField(max_length=60)
    total_seats = models.PositiveIntegerField(default=72)
    available_seats = models.PositiveIntegerField(default=72)
    fare = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("train", "journey_date", "travel_class"), name="unique_schedule"
            )
        ]


class Booking(models.Model):
    pnr = models.CharField(max_length=20, unique=True, default=new_pnr)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bookings")
    schedule = models.ForeignKey(TrainSchedule, on_delete=models.PROTECT)
    origin = models.CharField(max_length=120)
    destination = models.CharField(max_length=120)
    journey_date = models.DateField()
    travel_class = models.CharField(max_length=60)
    passenger_count = models.PositiveIntegerField()
    total_fare = models.DecimalField(max_digits=10, decimal_places=2)
    booking_status = models.CharField(max_length=30, default="CONFIRMED")
    created_at = models.DateTimeField(default=timezone.now)


class Passenger(models.Model):
    booking = models.ForeignKey(
        Booking, on_delete=models.CASCADE, related_name="passengers"
    )
    passenger_name = models.CharField(max_length=120)
    age = models.PositiveIntegerField()
    gender = models.CharField(max_length=20)
    seat_number = models.CharField(max_length=20)


class Payment(models.Model):
    booking = models.OneToOneField(
        Booking, on_delete=models.CASCADE, related_name="payment"
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=30, default="DEMO")
    payment_status = models.CharField(max_length=30, default="DEMO_CONFIRMED")
    transaction_reference = models.CharField(max_length=40, unique=True)
