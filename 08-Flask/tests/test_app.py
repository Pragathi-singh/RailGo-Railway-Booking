from datetime import date, timedelta
from app.extensions import db
from app.models import User


def token(client):
    with client.session_transaction() as session:
        return session.get("_csrf")


def signup(client, email="person@example.com"):
    client.get("/signup")
    return client.post("/signup", data={
        "csrf": token(client), "name": "Asha Rao", "email": email,
        "mobile": "9876543210", "password": "StrongPass1", "confirm_password": "StrongPass1"
    })


def test_signup_hashes_password_and_rejects_duplicate(client, app):
    response = signup(client)
    assert response.status_code == 302
    with app.app_context():
        user = User.query.one()
        assert user.password_hash != "StrongPass1"
        assert user.password_hash.startswith("scrypt:") or user.password_hash.startswith("pbkdf2:")
    duplicate = signup(client)
    assert duplicate.status_code == 200
    assert b"already exists" in duplicate.data


def test_login_logout_and_protected_route(client):
    signup(client)
    client.post("/logout", data={"csrf": token(client)})
    protected = client.get("/dashboard")
    assert protected.status_code == 302
    client.get("/login")
    response = client.post("/login", data={"csrf": token(client), "email": "person@example.com", "password": "StrongPass1"})
    assert response.status_code == 302
    assert client.get("/dashboard").status_code == 200
    client.post("/logout", data={"csrf": token(client)})
    assert client.get("/dashboard").status_code == 302


def test_search_validation_rejects_same_and_past_date(client):
    client.get("/")
    response = client.post("/", data={"csrf": token(client), "origin": "Mumbai", "destination": "mumbai",
                                      "journey_date": date.today().isoformat(), "travel_class": "Sleeper"})
    assert response.status_code == 200
    assert b"different destination" in response.data
    response = client.post("/", data={"csrf": token(client), "origin": "Mumbai", "destination": "Delhi",
                                      "journey_date": (date.today() - timedelta(days=1)).isoformat(), "travel_class": "Sleeper"})
    assert b"cannot be in the past" in response.data


def test_csrf_blocks_state_change(client):
    response = client.post("/signup", data={"name": "Asha"})
    assert response.status_code == 400
