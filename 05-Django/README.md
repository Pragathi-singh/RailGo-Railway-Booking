# RailGo Django Edition

## Stack

Python 3.10+, Django 5.2, Django ORM, MySQL 8, and pytest-compatible Django tests.

## Setup

```powershell
cd 05-Django
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
python manage.py migrate
python manage.py runserver 127.0.0.1:8005
```

Configure `.env` for the dedicated `railgo_django` database. The `.env` file
must be excluded from Git.

Default local URL: `http://127.0.0.1:8005`.

```powershell
python manage.py test
```
