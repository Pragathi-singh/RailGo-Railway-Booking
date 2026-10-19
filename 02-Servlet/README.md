# RailGo — Java Servlet Edition

An independent RailGo authentication and train-search demonstration built with Java 17, Jakarta Servlet 6.0, JSP views, HTML, CSS, and vanilla JavaScript. JSP files are under `WEB-INF/views` and are rendered by Servlet controllers. This project does not use a database, railway API, payment service, or external authentication provider.

## Requirements

- JDK 17 or later
- Apache Maven 3.8 or later
- Apache Tomcat 10.1 (Servlet 6.0 / Jakarta EE 10)

## Build and deploy

From PowerShell, change into `02-Servlet` and build the WAR:

```powershell
Set-Location .\02-Servlet
mvn clean package
```

Deploy `target\RailGoServlet.war` to Tomcat 10.1's `webapps` directory:

```powershell
Copy-Item .\target\RailGoServlet.war "$env:CATALINA_HOME\webapps\"
& "$env:CATALINA_HOME\bin\catalina.bat" run
```

Open <http://localhost:8080/RailGoServlet/>. The WAR filename determines the `/RailGoServlet` context path. Stop Tomcat with **Ctrl+C**.

If `CATALINA_HOME` is not set, replace it with your Tomcat installation path, for example:

```powershell
Copy-Item .\target\RailGoServlet.war 'C:\tools\apache-tomcat-10.1\webapps\'
& 'C:\tools\apache-tomcat-10.1\bin\catalina.bat' run
```

Alternatively, deploy the WAR using the Tomcat Manager or your IDE's Tomcat integration. Do not run both Servlet and JSP editions in the same Tomcat instance if their context names or port settings conflict.

## Demo behavior

- Signup validates name, email, Indian mobile number, password strength, password confirmation, and terms on the server. Email addresses are normalized before duplicate checks.
- Accounts live only in a concurrent in-memory map. Restarting the application clears all demo accounts.
- Passwords are salted and hashed using PBKDF2-HMAC-SHA-256 before storage in memory; plaintext passwords are not stored.
- Login uses an HTTP session, changes the session ID on success, includes CSRF tokens for state-changing forms, and applies a basic per-session login attempt limit.
- The dashboard requires an authenticated session. Logout is a CSRF-protected POST.
- Train search validates origin, destination, date, and class, then explains that live availability is not connected. It does not invent train results, bookings, PNR status, or payments.

This implementation is for a local college demonstration, not production authentication. In-memory storage is temporary, and the demo has not been hardened for deployment to the public internet. A production service needs persistent secured storage, operational controls, HTTPS, and a complete security review.

## Image credit

The local Konkan Express image is by Subumecher, from [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Konkan_Express.jpg), under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The home hero links to the credit.

## Manual test checklist

- [ ] Load the home page at `/RailGoServlet/` and check desktop, tablet, and mobile layouts.
- [ ] Submit search with empty fields, identical stations, a past date, and valid values; confirm validation and the demo-only response.
- [ ] Swap the search stations and verify the values exchange.
- [ ] Try signup with invalid email/mobile, weak and mismatched passwords, missing fields, and unaccepted terms.
- [ ] Create an account and verify the success message; create another with the same email in different casing and verify duplicate rejection.
- [ ] Sign in with valid credentials, inspect the protected dashboard, and sign out.
- [ ] Try invalid login credentials and repeated failures; verify generic errors and the rate limit.
- [ ] Submit a form without a valid CSRF token and confirm the request is rejected.
- [ ] Confirm direct access to `/WEB-INF/views/home.jsp` is not served by Tomcat.

Build locally with `mvn clean package`; generated Maven output is excluded from Git via `.gitignore`.
