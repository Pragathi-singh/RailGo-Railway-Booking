# RailGo Railway Booking — Project Collection

This collection contains nine independent implementations of the RailGo authentication-focused railway booking website. Each project will have its own source code, dependencies, and configuration; no application code or backend is shared between projects.

The applications will use the same RailGo design and Home, Login, and Signup pages. Train search is a demonstration only: it does not query real railway inventory or process payments.

## Projects

| Folder | Technology | Authentication approach |
| --- | --- | --- |
| `01-PHP` | PHP | Server-backed demo authentication; store password hashes, not plaintext passwords. |
| `02-Servlet` | Java Servlets | Server-backed demo authentication; store password hashes, not plaintext passwords. |
| `03-NodeJS` | Node.js with Express | Server-backed demo authentication; store password hashes, not plaintext passwords. |
| `04-React` | React | Frontend-only demonstration; no real or secure authentication. |
| `05-Django` | Python with Django | Server-backed demo authentication; store password hashes, not plaintext passwords. |
| `06-JSP` | JavaServer Pages (JSP) | Server-backed demo authentication; store password hashes, not plaintext passwords. |
| `07-AngularJS` | AngularJS 1.x | Frontend-only demonstration; no real or secure authentication. |
| `08-Flask` | Python with Flask | Server-backed demo authentication; store password hashes, not plaintext passwords. |
| `09-SpringBoot` | Java with Spring Boot | Server-backed demo authentication; store password hashes, not plaintext passwords. |

Server-backed authentication is for coursework and local demonstration only. It does not provide production-grade account security. Frontend-only projects must clearly identify authentication as a demonstration and must not claim to securely authenticate users.

## Prerequisites

Install only the tools for the project you want to run:

- **PHP:** PHP 8.1 or later.
- **Servlet and JSP:** JDK 17 or later, Apache Maven 3.8 or later, and Apache Tomcat 10.1.
- **Node.js and React:** Node.js 18 or later with npm.
- **Django and Flask:** Python 3.10 or later with pip.
- **AngularJS:** Node.js 18 or later with npm.
- **Spring Boot:** JDK 17 or later and Apache Maven 3.8 or later.

The commands below use PowerShell. Run them from the relevant project folder unless stated otherwise. Install each project's dependencies only in that project's folder. These are the planned commands and local addresses; they become runnable as each project is implemented.

## Install and run

### 01 — PHP

```powershell
Set-Location .\01-PHP
php -S 127.0.0.1:8001
```

Open <http://127.0.0.1:8001>. Stop with **Ctrl+C**.

### 02 — Servlet

Build the WAR from the project folder, deploy it to the `webapps` folder of your Tomcat 10.1 installation, then start Tomcat:

```powershell
Set-Location .\02-Servlet
mvn clean package
Copy-Item .\target\railgo-servlet.war "$env:CATALINA_HOME\webapps\"
& "$env:CATALINA_HOME\bin\catalina.bat" run
```

Open <http://localhost:8080/railgo-servlet/>. Stop Tomcat with **Ctrl+C**.

### 03 — Node.js

```powershell
Set-Location .\03-NodeJS
npm install
npm start
```

Open <http://localhost:3000>. Stop with **Ctrl+C**.

### 04 — React

```powershell
Set-Location .\04-React
npm install
npm run dev
```

Open <http://localhost:5173>. Stop with **Ctrl+C**.

### 05 — Django

```powershell
Set-Location .\05-Django
py -m venv .venv
.\.venv\Scripts\Activate.ps1
py -m pip install -r requirements.txt
py manage.py migrate
py manage.py runserver 127.0.0.1:8000
```

Open <http://127.0.0.1:8000>. Stop with **Ctrl+C**.

### 06 — JSP

Build the WAR from the project folder, deploy it to the `webapps` folder of your Tomcat 10.1 installation, then start Tomcat:

```powershell
Set-Location .\06-JSP
mvn clean package
Copy-Item .\target\railgo-jsp.war "$env:CATALINA_HOME\webapps\"
& "$env:CATALINA_HOME\bin\catalina.bat" run
```

Open <http://localhost:8080/railgo-jsp/>. Stop Tomcat with **Ctrl+C**.

### 07 — AngularJS

```powershell
Set-Location .\07-AngularJS
npm install
npm run dev
```

Open <http://localhost:8081>. Stop with **Ctrl+C**.

### 08 — Flask

```powershell
Set-Location .\08-Flask
py -m venv .venv
.\.venv\Scripts\Activate.ps1
py -m pip install -r requirements.txt
py app.py
```

Open <http://127.0.0.1:5000>. Stop with **Ctrl+C**.

### 09 — Spring Boot

```powershell
Set-Location .\09-SpringBoot
mvn spring-boot:run
```

Open <http://localhost:8082>. Stop with **Ctrl+C**.

## Notes

- The Servlet and JSP projects both use Tomcat's default port, `8080`; run them separately unless you configure distinct Tomcat ports.
- The listed ports are project defaults. If a port is already in use, stop the other server or change that project's local configuration.
- Authentication and signup data are local demonstrations. No project connects to a real railway booking, inventory, or payment service.
