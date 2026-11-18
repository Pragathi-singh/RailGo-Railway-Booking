# RailGo PHP Edition

This edition uses Core PHP 8, PDO, MySQL, server-side sessions, prepared
statements, password hashing, CSRF validation, and transactional booking.

## Requirements

- XAMPP or PHP 8.1+
- PHP PDO and `pdo_mysql`
- MySQL 8 or MariaDB/MySQL-compatible server
- Apache or the PHP built-in server

Verify the XAMPP runtime:

```powershell
C:\xampp\php\php.exe --version
C:\xampp\php\php.exe -m | Select-String "PDO|pdo_mysql"
C:\xampp\mysql\bin\mysql.exe --version
```

## Database configuration

Copy the example and set only local credentials:

```powershell
Copy-Item 01-PHP\.env.example 01-PHP\.env
```

Use values similar to:

```text
RAILGO_DB_HOST=127.0.0.1
RAILGO_DB_PORT=3306
RAILGO_DB_NAME=railgo
RAILGO_DB_USER=railgo_app
RAILGO_DB_PASSWORD=your-local-password
```

The application loads `01-PHP/.env` locally and also accepts environment
variables. `.env` is ignored by Git and must never contain production
credentials. Database host, port, name, user, and password are validated before
the PDO connection is created.

Create a local least-privilege account from MySQL with a local password:

```sql
CREATE USER 'railgo_app'@'127.0.0.1' IDENTIFIED BY 'your-local-password';
GRANT SELECT, INSERT, UPDATE, DELETE ON railgo.*
    TO 'railgo_app'@'127.0.0.1';
FLUSH PRIVILEGES;
```

The migration account needs migration privileges; a normal application account
only needs DML on the RailGo schema.

## Migrate and seed

Run migrations with an authorized migration account:

```powershell
$env:RAILGO_DB_HOST = "127.0.0.1"
$env:RAILGO_DB_PORT = "3306"
$env:RAILGO_DB_NAME = "railgo"
$env:RAILGO_DB_USER = "root"
$env:RAILGO_DB_PASSWORD = "local-migration-password"
C:\xampp\php\php.exe 01-PHP\database\migrate.php
```

Seed repeatable fictional demo inventory:

```powershell
C:\xampp\php\php.exe 01-PHP\database\seed.php
```

The seed creates three fictional routes, 14 future dates, five travel classes
per route/date, and a demo account:

```text
Email: demo@railgo.local
Password: DemoPass123
```

The seed may be run repeatedly. It does not recreate bookings or user data.

## Start locally

### PHP built-in server

```powershell
Push-Location 01-PHP
C:\xampp\php\php.exe -S 127.0.0.1:8091
```

Open `http://127.0.0.1:8091/index.php`.

### Apache/XAMPP

Place this repository inside XAMPP's `htdocs` directory or configure a virtual
host. Start Apache and MySQL, then open the local `/01-PHP/index.php` URL.

## Database tables

- `users`: account identity and password hashes
- `trains`: fictional train number, name, source, and destination
- `train_schedules`: date, timing, class, inventory, and fare
- `bookings`: owner, schedule, PNR, status, and server-calculated amount
- `passengers`: booking passenger records
- `payments`: demo payment status and transaction reference
- `password_reset_tokens`: hashed, expiring local demo reset tokens

Foreign keys preserve relational integrity. PNR values and payment references
are unique. Seat changes and booking creation use database transactions and
row locking.

## Functional workflow

The nine pages cover home, registration, login, search, passenger details,
payment, confirmation, history, and profile. The demo payment page explicitly
collects no card or bank information.

Private pages require authentication. Booking and cancellation operations also
verify that the logged-in user owns the booking. Cancellations restore only
the passenger count for a confirmed booking and cannot be applied twice.

## Password recovery

The local implementation is intentionally demo-only. It can prepare a hashed,
expiring reset token and display a local reset link because no email service is
configured. It never claims email delivery and never stores reset tokens in
plain text.

## Syntax checks

```powershell
Get-ChildItem 01-PHP -Recurse -Filter *.php |
    ForEach-Object { C:\xampp\php\php.exe -l $_.FullName }
```
