# RailGo — Java Servlet Edition

The Servlet edition is an independent Jakarta Servlet 6, JSP, JDBC, Maven,
MySQL 8, and Apache Tomcat 10.1 implementation.

## Requirements

- Java 17
- Apache Maven 3.8+
- Apache Tomcat 10.1
- MySQL 8 or compatible local server
- MySQL Connector/J is packaged through Maven

## Database configuration

Copy `.env.example` to `.env`:

```powershell
Copy-Item .env.example .env
```

Set local values:

```text
RAILGO_DB_HOST=127.0.0.1
RAILGO_DB_PORT=3306
RAILGO_DB_NAME=railgo_servlet
RAILGO_DB_USERNAME=railgo_servlet_app
RAILGO_DB_PASSWORD=your-local-password
```

The `.env` file is ignored by Git. Tomcat can instead receive the same values
as environment variables. Java source files contain no database password.

Create the database and schema:

```powershell
Get-Content schema.sql -Raw |
  C:\xampp\mysql\bin\mysql.exe -u root -p
Get-Content seed.sql -Raw |
  C:\xampp\mysql\bin\mysql.exe -u root -p
```

The schema creates:

- `users`
- `trains`
- `train_schedules`
- `bookings`
- `passengers`
- `payments`
- `password_reset_tokens`

The seed is repeatable and creates fictional trains and 14 future dates for
each train. It does not represent live Indian Railways availability.

## Build and deploy

```powershell
Set-Location 02-Servlet
mvn clean test package
Copy-Item target\RailGoServlet.war
  C:\apache-tomcat-10.1.57\webapps\
```

Set database environment variables in the same shell that starts Tomcat:

```powershell
$env:RAILGO_DB_HOST="127.0.0.1"
$env:RAILGO_DB_PORT="3306"
$env:RAILGO_DB_NAME="railgo_servlet"
$env:RAILGO_DB_USERNAME="railgo_servlet_app"
$env:RAILGO_DB_PASSWORD="your-local-password"
& "C:\apache-tomcat-10.1.57\bin\catalina.bat" run
```

Open:

```text
http://127.0.0.1:8080/RailGoServlet/
```

## Demo workflow

Create an account through `/signup`, log in, search seeded routes, select a
train, enter passenger details, complete a labelled demo payment, and review
the PNR ticket.

Example local account created during browser verification:

```text
Email: servletphase@example.com
Password: account password chosen during registration
```

Password help prepares a local hashed, expiring reset token. No email is sent
and no plaintext password is stored.
