import secrets
from functools import wraps
from flask import abort, session, redirect, url_for


def csrf_token():
    token = session.get("_csrf")
    if not token:
        token = secrets.token_urlsafe(32)
        session["_csrf"] = token
    return token


def validate_csrf(value):
    expected = session.get("_csrf")
    if not expected or not value or not secrets.compare_digest(expected, value):
        abort(400, description="The form expired. Please try again.")


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if "user_id" not in session:
            return redirect(url_for("main.login", next=request_path()))
        return view(*args, **kwargs)
    return wrapped


def request_path():
    from flask import request
    return request.full_path
