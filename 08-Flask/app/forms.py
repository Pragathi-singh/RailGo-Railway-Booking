import re
from datetime import date


EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
MOBILE = re.compile(r"^[0-9+() -]{7,20}$")


def signup_errors(data):
    errors = {}
    if len(data.get("name", "").strip()) < 2:
        errors["name"] = "Enter your full name."
    email = data.get("email", "").strip().lower()
    if not EMAIL.fullmatch(email):
        errors["email"] = "Enter a valid email address."
    if not MOBILE.fullmatch(data.get("mobile", "").strip()):
        errors["mobile"] = "Enter a valid mobile number."
    if len(data.get("password", "")) < 8:
        errors["password"] = "Use at least 8 characters."
    if data.get("password") != data.get("confirm_password"):
        errors["confirm_password"] = "Passwords must match."
    return errors


def journey_errors(data):
    errors = {}
    origin = data.get("origin", "").strip()
    destination = data.get("destination", "").strip()
    if len(origin) < 2:
        errors["origin"] = "Enter your departure station."
    if len(destination) < 2:
        errors["destination"] = "Enter your destination station."
    if origin and destination and origin.casefold() == destination.casefold():
        errors["destination"] = "Choose a different destination station."
    try:
        selected = date.fromisoformat(data.get("journey_date", ""))
        if selected < date.today():
            errors["journey_date"] = "Journey date cannot be in the past."
    except ValueError:
        errors["journey_date"] = "Choose a valid journey date."
    if not data.get("travel_class"):
        errors["travel_class"] = "Select a travel class."
    return errors
