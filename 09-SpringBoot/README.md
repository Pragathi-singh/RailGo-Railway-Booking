# RailGo Spring Boot Edition

## Stack

Java 17, Spring Boot 3.4, Spring MVC, Spring Security, Spring Data JPA,
Thymeleaf, MySQL Connector/J and Maven.

## Setup

```powershell
cd 09-SpringBoot
Copy-Item .env.example .env
mvn clean test package
mvn spring-boot:run
```

Set `RAILGO_DB_URL`, `RAILGO_DB_USER`, `RAILGO_DB_PASSWORD`, and
`RAILGO_SECRET` for the dedicated `railgo_springboot` database.
The `.env` file is ignored by Git.

Default local URL: `http://127.0.0.1:8080`.
