# RailGo Flask Edition

A polished RailGo railway journey website built with Flask, Jinja2, SQLAlchemy,
server-side sessions, MySQL-ready configuration and pytest. It is independent of
the other RailGo implementations.

## Windows CMD setup

Install Python 3.11+ and MySQL 8+, then run:

```cmd
cd 08-Flask
py -3.11 -m venv .venv
call .venv\Scripts\activate
python -m pip install -r requirements.txt
copy .env.example .env
```

Create the database and least-privilege user in MySQL:

```sql
CREATE DATABASE railgo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'railgo_app'@'localhost' IDENTIFIED BY 'choose-a-local-password';
GRANT ALL PRIVILEGES ON railgo.* TO 'railgo_app'@'localhost';
FLUSH PRIVILEGES;
```

Edit `.env` with a long secret and your local connection:

```text
SECRET_KEY=replace-with-a-long-random-value
DATABASE_URL=mysql+pymysql://railgo_app:choose-a-local-password@127.0.0.1:3306/railgo
```

Run tests and start the development server:

```cmd
python -m pytest
flask --app run.py run --debug
```

Open `http://127.0.0.1:5000/`. Tables are created automatically on startup for
this local demo. Routes include `/`, `/results`, `/signup`, `/login`,
`/forgot-password`, `/dashboard`, `/history`, and `/profile`.

## Features and limitations

- Server-side validation, duplicate-email checks, password hashing and signed sessions.
- Per-session CSRF protection on signup, login, logout, profile, search and recovery forms.
- Dashboard, profile and user-scoped booking history.
- Honest empty search results: no live train inventory, fares, schedules, PNRs, payments
  or booking confirmation are fabricated.
- Password recovery only explains that email delivery requires configuration; no reset
  token is exposed or generated.
- Set `SESSION_COOKIE_SECURE=1` only when serving over HTTPS. Do not commit `.env`,
  local databases or credentials.
