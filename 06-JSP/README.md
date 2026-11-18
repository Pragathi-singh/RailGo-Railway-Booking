# RailGo JSP Edition

## Stack

Java 17, Jakarta JSP/Servlet, JSTL, JDBC, MySQL Connector/J, Maven and Tomcat 10.1.

## Setup

```powershell
cd 06-JSP
Copy-Item .env.example .env
mvn clean test package
```

Set the `RAILGO_DB_URL`, `RAILGO_DB_USER`, and `RAILGO_DB_PASSWORD` variables
for the dedicated `railgo_jsp` database. Apply `database/schema.sql` and
`database/seed.sql` using a migration-capable MySQL account.

Deploy `target/RailGoJSP.war` to Tomcat and open the WAR context route.
