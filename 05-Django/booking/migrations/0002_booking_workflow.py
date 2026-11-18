from datetime import date, timedelta
from decimal import Decimal
from django.db import migrations, models
import django.db.models.deletion
import booking.models


def seed_demo(apps, schema_editor):
    Train = apps.get_model("booking", "Train")
    Schedule = apps.get_model("booking", "TrainSchedule")
    routes = [
        (
            "RG101",
            "Deccan Coast Express",
            "Mumbai Central",
            "Pune Junction",
            "06:15",
            "09:40",
            "3h 25m",
        ),
        (
            "RG202",
            "Capital Sunrise",
            "New Delhi",
            "Jaipur Junction",
            "07:00",
            "11:35",
            "4h 35m",
        ),
        (
            "RG303",
            "Southern Breeze",
            "Bengaluru City",
            "Chennai Central",
            "08:30",
            "13:15",
            "4h 45m",
        ),
    ]
    for number, name, source, destination, departure, arrival, duration in routes:
        train = Train.objects.create(
            train_number=number,
            train_name=name,
            source_station=source,
            destination_station=destination,
            departure_time=departure,
            arrival_time=arrival,
            duration=duration,
        )
        for offset in range(31):
            for index, travel_class in enumerate(
                ["Sleeper", "AC 3 Tier", "AC 2 Tier", "AC First Class", "Chair Car"]
            ):
                Schedule.objects.create(
                    train=train,
                    journey_date=date.today() + timedelta(days=offset),
                    travel_class=travel_class,
                    total_seats=72,
                    available_seats=72,
                    fare=Decimal(450 + index * 650),
                )


class Migration(migrations.Migration):
    dependencies = [("booking", "0001_initial")]
    operations = [
        migrations.CreateModel(
            name="Train",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("train_number", models.CharField(max_length=20, unique=True)),
                ("train_name", models.CharField(max_length=120)),
                ("source_station", models.CharField(max_length=120)),
                ("destination_station", models.CharField(max_length=120)),
                ("departure_time", models.CharField(max_length=10)),
                ("arrival_time", models.CharField(max_length=10)),
                ("duration", models.CharField(max_length=30)),
                ("running_days", models.CharField(default="Daily", max_length=80)),
            ],
        ),
        migrations.CreateModel(
            name="TrainSchedule",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("journey_date", models.DateField()),
                ("travel_class", models.CharField(max_length=60)),
                ("total_seats", models.PositiveIntegerField(default=72)),
                ("available_seats", models.PositiveIntegerField(default=72)),
                ("fare", models.DecimalField(decimal_places=2, max_digits=10)),
                (
                    "train",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="schedules",
                        to="booking.train",
                    ),
                ),
            ],
        ),
        migrations.AddConstraint(
            model_name="trainschedule",
            constraint=models.UniqueConstraint(
                fields=("train", "journey_date", "travel_class"), name="unique_schedule"
            ),
        ),
        migrations.CreateModel(
            name="Booking",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "pnr",
                    models.CharField(
                        default=booking.models.new_pnr, max_length=20, unique=True
                    ),
                ),
                ("origin", models.CharField(max_length=120)),
                ("destination", models.CharField(max_length=120)),
                ("journey_date", models.DateField()),
                ("travel_class", models.CharField(max_length=60)),
                ("passenger_count", models.PositiveIntegerField()),
                ("total_fare", models.DecimalField(decimal_places=2, max_digits=10)),
                (
                    "booking_status",
                    models.CharField(default="CONFIRMED", max_length=30),
                ),
                ("created_at", models.DateTimeField()),
                (
                    "schedule",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        to="booking.trainschedule",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="bookings",
                        to="auth.user",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Passenger",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("passenger_name", models.CharField(max_length=120)),
                ("age", models.PositiveIntegerField()),
                ("gender", models.CharField(max_length=20)),
                ("seat_number", models.CharField(max_length=20)),
                (
                    "booking",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="passengers",
                        to="booking.booking",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Payment",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("amount", models.DecimalField(decimal_places=2, max_digits=10)),
                ("payment_method", models.CharField(default="DEMO", max_length=30)),
                (
                    "payment_status",
                    models.CharField(default="DEMO_CONFIRMED", max_length=30),
                ),
                ("transaction_reference", models.CharField(max_length=40, unique=True)),
                (
                    "booking",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="payment",
                        to="booking.booking",
                    ),
                ),
            ],
        ),
        migrations.RunPython(seed_demo, migrations.RunPython.noop),
    ]
