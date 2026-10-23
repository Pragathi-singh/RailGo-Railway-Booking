# RailGo JSP Edition

A standalone RailGo railway journey website built with Java 17, Jakarta JSP/Servlet 6.0, JSTL, JDBC, MySQL, Maven, and Apache Tomcat 10.1+. It includes account authentication, protected profile/dashboard/history pages, server-side validation, CSRF protection, and a polished search flow. Search intentionally does not invent train inventory: without a configured railway provider, it returns a clear unavailable state.

## Prerequisites

- JDK 17+
- Maven 3.8+
- MySQL 8+
- Apache Tomcat 10.1+

## Database and configuration

1. Run [`database/schema.sql`](database/schema.sql) in MySQL.
2. Create an application user with least-privilege access to the `railgo` database.
3. Set `RAILGO_DB_URL`, `RAILGO_DB_USER`, and `RAILGO_DB_PASSWORD` as environment variables. See [`.env.example`](.env.example). The application has safe localhost defaults for the URL/user, but no default password.

PowerShell example:

```powershell
$env:RAILGO_DB_URL = "jdbc:mysql://localhost:3306/railgo?useSSL=false&serverTimezone=Asia/Kolkata"
$env:RAILGO_DB_USER = "railgo_app"
$env:RAILGO_DB_PASSWORD = "your-local-password"
```

## Build and deploy

```powershell
$tomcat = "C:\Tomcat\apache-tomcat-10.1.61"
$env:CATALINA_HOME = $tomcat
$env:CATALINA_BASE = $tomcat
mvn clean test package
& "$tomcat\bin\catalina.bat" stop
Start-Sleep -Seconds 3
Remove-Item "$tomcat\webapps\RailGoJSP.war" -ErrorAction SilentlyContinue
Remove-Item "$tomcat\webapps\RailGoJSP" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item .\target\RailGoJSP.war "$tomcat\webapps\RailGoJSP.war"
& "$tomcat\bin\catalina.bat" start
```

Open `http://localhost:8080/RailGoJSP/`. Tomcat provides the JSP implementation and MySQL Connector/J is packaged in the WAR.

The public assets are served from `src/main/webapp/assets/` and are referenced with the
application context path. For the default deployment, verify that these URLs return
the actual files rather than an HTML error page:

```powershell
curl.exe -i http://localhost:8080/RailGoJSP/assets/css/style.css
curl.exe -i http://localhost:8080/RailGoJSP/assets/js/script.js
```

The stylesheet response should have a CSS content type and the script response should
have a JavaScript content type. Remove the old WAR and exploded directory before
redeploying so Tomcat does not continue serving a stale application.

## Security and limitations

Passwords are salted PBKDF2-HMAC-SHA-256 hashes; plaintext passwords are never stored. Prepared statements are used for all SQL. Sessions rotate after login, state-changing forms use CSRF tokens, logout is POST-only, and account routes are protected. The application is a learning project: configure HTTPS, secure cookies, secret management, connection pooling, migrations, rate limiting, monitoring, and a verified railway integration before production use. No booking, payment, PNR, fare, seat, or live train claim is made.
