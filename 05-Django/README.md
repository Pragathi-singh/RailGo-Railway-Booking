# RailGo Django demo

RailGo is a standalone Django 5.2 railway booking **demo**. It uses SQLite and Django's built-in authentication/password hashing. It does not connect to Indian Railways, retrieve live availability, make bookings, process payments, or use real personal data.

## Windows / VS Code setup

From the repository root, open a terminal and run:

```powershell
cd 05-Django
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Open http://127.0.0.1:8000/. If PowerShell blocks activation, run the commands with `.venv\Scripts\python.exe` instead.

To create an optional admin account:

```powershell
python manage.py createsuperuser
```

## Authentication and demo limitations

Email is used as the login identifier by looking up the Django user model's normalized email address, then `authenticate()` verifies the password using Django's password hashers. User records and sessions are stored in local SQLite. This is suitable for learning and local demos only; use HTTPS, environment-managed secrets, a production database, rate limiting and a proper deployment configuration for a real service.
