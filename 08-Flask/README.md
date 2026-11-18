# RailGo Flask Edition

## Stack

Python 3.10+, Flask, Jinja2, Flask-SQLAlchemy, PyMySQL and pytest.

## Setup

```powershell
cd 08-Flask
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
python -m pytest
flask --app run.py run --debug
```

Set `DATABASE_URL` in `.env` to the dedicated `railgo_flask` MySQL database.
The ignored `.env` file must contain no real shared credentials.

Default local URL: `http://127.0.0.1:5000`.
