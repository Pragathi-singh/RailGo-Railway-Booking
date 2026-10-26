# RailGo Spring Boot Edition

RailGo is a server-rendered railway journey website built with Java 17, Spring Boot
3.4, Spring MVC, Thymeleaf, Spring Security, Spring Data JPA, MySQL Connector/J
and Jakarta Bean Validation.

## Windows CMD setup

Prerequisites: JDK 17+, Maven 3.9+, and MySQL 8+.

Create the database and application user in MySQL:

```sql
CREATE DATABASE railgo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'railgo_app'@'localhost' IDENTIFIED BY 'choose-a-local-password';
GRANT ALL PRIVILEGES ON railgo.* TO 'railgo_app'@'localhost';
FLUSH PRIVILEGES;
```

Apply [`src/main/resources/schema.sql`](src/main/resources/schema.sql), then configure
environment variables in CMD without putting credentials in source:

```cmd
cd 09-SpringBoot
set RAILGO_DB_URL=jdbc:mysql://127.0.0.1:3306/railgo?useSSL=false&serverTimezone=Asia/Kolkata
set RAILGO_DB_USER=railgo_app
set RAILGO_DB_PASSWORD=your-local-password
set RAILGO_SECRET=replace-with-a-long-random-value
mvn clean test package
mvn spring-boot:run
```

Open `http://127.0.0.1:8080/`. `application.properties` uses
`spring.jpa.hibernate.ddl-auto=validate`, so the application does not create, drop,
or recreate MySQL tables. The default no-environment configuration uses a local H2
file only for a quick development launch.

## Features

- Home route search with station swap, travel class and server-side validation.
- Honest empty search results when no railway provider is configured.
- BCrypt password hashing, Spring Security authentication and POST CSRF-protected logout.
- Duplicate-email validation, protected dashboard/profile/history and user-scoped repository query.
- Split-screen signup/login, password help guidance, responsive navigation and custom error page.
- Static CSS/JavaScript under `/css/style.css` and `/js/script.js`.

No live railway schedules, fares, availability, PNRs, payment processing or booking
confirmation is fabricated. Password recovery email delivery requires an external
service and is intentionally not enabled.
