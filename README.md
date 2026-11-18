# RailGo — Railway Reservation System

RailGo is a railway reservation project with nine independent implementations
of the same RailGo booking experience. The repository is intended for
academic study, framework comparison, and local demonstration.

## Objectives

- Demonstrate railway booking workflows across multiple technologies.
- Preserve responsive RailGo branding and navigation.
- Compare independent PHP, Java, JavaScript, Python, and Spring architecture.
- Use server-side validation and protected booking operations.
- Use demo payment only; no real card or banking information is collected.

## Technology Editions

| Folder | Technology stack |
|---|---|
| [01-PHP](./01-PHP/) | Core PHP, MySQL, PDO |
| [02-Servlet](./02-Servlet/) | Java 17, Jakarta Servlet 6, JSP, JDBC, Tomcat, MySQL |
| [03-NodeJS](./03-NodeJS/) | Node.js, Express, EJS, mysql2, sessions |
| [04-React](./04-React/) | React, Vite, REST API integration |
| [05-Django](./05-Django/) | Python, Django ORM, MySQL |
| [06-JSP](./06-JSP/) | Java 17, JSP, Jakarta Servlets, JDBC, Tomcat, MySQL |
| [07-AngularJS](./07-AngularJS/) | AngularJS 1.x, REST API integration |
| [08-Flask](./08-Flask/) | Python, Flask, Flask-SQLAlchemy, MySQL |
| [09-SpringBoot](./09-SpringBoot/) | Java 17, Spring Boot, Spring Data JPA, MySQL |

## Main Functionality

- Home and train search
- Registration and login
- Password hashing and protected routes
- Passenger details and server-calculated fares
- Unique PNR generation
- Demo payment confirmation
- Printable booking confirmation
- User booking history
- Ownership-checked cancellation
- Seat restoration and duplicate-cancellation prevention
- Profile editing and logout

## Database Architecture

Backend editions use separate or shared MySQL databases according to their
edition configuration. The common reservation structure contains users,
trains, train schedules, bookings, passengers, and payments. PNR values and
payment references are unique, and foreign keys preserve booking relationships.

The frontend-only React and AngularJS editions communicate through REST APIs;
they do not contain MySQL credentials or direct database drivers.

## Prerequisites

- PHP 8.1+ and optionally XAMPP for Apache/MySQL.
- JDK 17, Maven, and Apache Tomcat 10.1 for Servlet/JSP/Spring.
- Node.js 20+ and npm for Node, React, and AngularJS.
- Python 3.10+ and pip for Django and Flask.
- MySQL 8 or a compatible local MySQL server.

Use local placeholder configuration files for database credentials. Never
commit `.env` files or real passwords.

## Database Setup

Copy an edition's `.env.example` or `application-example.properties` file to
the ignored local configuration file. Create the edition database using its
schema or migration/ORM command, then seed demo data using the documented
edition script or startup process.

Example environment names used by the backend editions include
`RAILGO_DB_HOST`, `RAILGO_DB_PORT`, `RAILGO_DB_NAME`, `RAILGO_DB_USER`,
`RAILGO_DB_PASSWORD`, and `DATABASE_URL`. Each edition README gives exact
local instructions.

## Edition Run Guide

Read the README in each folder for prerequisites, environment setup,
database initialization, startup commands, and default local URLs:

- [01-PHP README](./01-PHP/README.md)
- [02-Servlet README](./02-Servlet/README.md)
- [03-NodeJS README](./03-NodeJS/README.md)
- [04-React README](./04-React/README.md)
- [05-Django README](./05-Django/README.md)
- [06-JSP README](./06-JSP/README.md)
- [07-AngularJS README](./07-AngularJS/README.md)
- [08-Flask README](./08-Flask/README.md)
- [09-SpringBoot README](./09-SpringBoot/README.md)

## Demo Payment Disclaimer

RailGo payment workflows are local demonstrations only. The application does
not collect or store real card numbers, CVVs, banking passwords, or real
payment credentials.

## Security

- Never commit `.env`, credentials, private keys, database dumps, or local
  SQLite/MySQL files.
- Use environment variables or ignored local configuration files.
- Keep prepared statements or ORM parameterization in database operations.
- Hash passwords and regenerate sessions after login.
- Protect private pages and verify booking ownership.
- Validate forms and use CSRF protection on state-changing requests.
