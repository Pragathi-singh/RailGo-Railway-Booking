from datetime import date, timedelta
from app.extensions import db
from app.models import Train, TrainSchedule, User


def token(client):
    with client.session_transaction() as session:
        return session.get("_csrf")


def signup(client, email="person@example.com"):
    client.get("/signup")
    return client.post(
        "/signup",
        data={
            "csrf": token(client),
            "name": "Asha Rao",
            "email": email,
            "mobile": "9876543210",
            "password": "StrongPass1",
            "confirm_password": "StrongPass1",
        },
    )


def test_signup_hashes_password_and_rejects_duplicate(client, app):
    response = signup(client)
    assert response.status_code == 302
    with app.app_context():
        user = User.query.one()
        assert user.password_hash != "StrongPass1"
        assert user.password_hash.startswith(
            "scrypt:"
        ) or user.password_hash.startswith("pbkdf2:")
    duplicate = signup(client)
    assert duplicate.status_code == 200
    assert b"already exists" in duplicate.data


def test_login_logout_and_protected_route(client):
    signup(client)
    client.post("/logout", data={"csrf": token(client)})
    protected = client.get("/dashboard")
    assert protected.status_code == 302
    client.get("/login")
    response = client.post(
        "/login",
        data={
            "csrf": token(client),
            "email": "person@example.com",
            "password": "StrongPass1",
        },
    )
    assert response.status_code == 302
    assert client.get("/dashboard").status_code == 200
    client.post("/logout", data={"csrf": token(client)})
    assert client.get("/dashboard").status_code == 302


def test_search_validation_rejects_same_and_past_date(client):
    client.get("/")
    response = client.post(
        "/",
        data={
            "csrf": token(client),
            "origin": "Mumbai",
            "destination": "mumbai",
            "journey_date": date.today().isoformat(),
            "travel_class": "Sleeper",
        },
    )
    assert response.status_code == 200
    assert b"different destination" in response.data
    response = client.post(
        "/",
        data={
            "csrf": token(client),
            "origin": "Mumbai",
            "destination": "Delhi",
            "journey_date": (date.today() - timedelta(days=1)).isoformat(),
            "travel_class": "Sleeper",
        },
    )
    assert b"cannot be in the past" in response.data


def test_csrf_blocks_state_change(client):
    response = client.post("/signup", data={"name": "Asha"})
    assert response.status_code == 400


def test_search_booking_confirmation_and_cancellation_restore_seats(client, app):
    with app.app_context():
        train = Train(
            train_number="RG999",
            train_name="Demo Express",
            source_station="Mumbai",
            destination_station="Pune",
            departure_time="06:00",
            arrival_time="09:00",
            duration="3h",
            running_days="Daily",
        )
        db.session.add(train)
        db.session.flush()
        schedule = TrainSchedule(
            train_id=train.id,
            journey_date=date.today(),
            travel_class="Sleeper",
            total_seats=2,
            available_seats=2,
            fare=500,
        )
        db.session.add(schedule)
        db.session.commit()
        schedule_id = schedule.id

    signup(client, "booking@example.com")
    client.post("/logout", data={"csrf": token(client)})
    client.get("/login")
    client.post(
        "/login",
        data={
            "csrf": token(client),
            "email": "booking@example.com",
            "password": "StrongPass1",
        },
    )
    client.get("/")
    response = client.post(
        "/",
        data={
            "csrf": token(client),
            "origin": "Mumbai",
            "destination": "Pune",
            "journey_date": date.today().isoformat(),
            "travel_class": "Sleeper",
        },
    )
    assert response.status_code == 302
    assert b"Demo Express" in client.get("/results").data
    response = client.get(f"/book/{schedule_id}")
    assert response.status_code == 200
    response = client.post(
        f"/book/{schedule_id}",
        data={
            "csrf": token(client),
            "passenger_count": "1",
            "passenger_name_1": "Test Passenger",
            "passenger_age_1": "30",
            "passenger_gender_1": "Other",
        },
    )
    assert response.status_code == 302
    confirmation = client.get(response.location)
    assert b"PNR RG" in confirmation.data
    with app.app_context():
        schedule = db.session.get(TrainSchedule, schedule_id)
        assert schedule.available_seats == 1
        booking = User.query.filter_by(email="booking@example.com").one().bookings[0]
        booking_id = booking.id
    response = client.post(
        f"/booking/{booking_id}/cancel", data={"csrf": token(client)}
    )
    assert response.status_code == 302
    with app.app_context():
        assert db.session.get(TrainSchedule, schedule_id).available_seats == 2
