# RailGo — PHP project

This folder contains an independent PHP, HTML, CSS, and vanilla JavaScript implementation of the RailGo authentication-focused college project. It uses PHP sessions and a local JSON account file; it does not use a shared backend, a database, railway APIs, payment services, or external authentication.

> **Demo security notice:** JSON-file authentication is only for a local college demonstration and is not suitable for production. Passwords are stored as PHP password hashes, but a production application should use a properly secured database, hardened server-side authentication, HTTPS, operational monitoring, and a carefully configured web server.

## Prerequisites

- Windows with [XAMPP](https://www.apachefriends.org/download.html) (Apache and PHP 8.1 or later).
- A browser with JavaScript enabled.
- PHP CLI is useful for syntax checks but is not required to serve the project through XAMPP Apache.

## Install and run with XAMPP

1. Install XAMPP from [apachefriends.org](https://www.apachefriends.org/download.html).
2. Place the repository at `C:\xampp\htdocs\RailGo-Railway-Booking\`, or configure an Apache virtual host/document root for this repository.
3. In the XAMPP Control Panel, start **Apache**.
4. Open <http://localhost/RailGo-Railway-Booking/01-PHP/>.
5. Create a demo account on **Sign Up**, then log in with its email (or full name) and password.

Apache/PHP must be able to write to `01-PHP/data/`. The application creates `data/accounts.json` on first account registration and uses file locking for concurrent access. It attempts restrictive directory/file permissions where the operating system supports them. The file is excluded by this project's `.gitignore` and direct access is denied by `data/.htaccess` when Apache honors per-directory configuration.

## Image credit

The locally stored Konkan Express photograph is by Subumecher, from [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Konkan_Express.jpg), licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The image credit is also linked on the home-page hero.

## Demo behavior and limitations

- Signup validates the name, email, Indian mobile number, password strength, confirmation, and terms on both the browser and server. Email addresses are lowercased for duplicate checks.
- Passwords are stored using `password_hash()` and verified using `password_verify()`; plaintext passwords are not written to the account file or logs.
- Login uses a PHP session, renews the session ID after success, includes CSRF tokens, and applies a basic per-session login-attempt limit.
- Train search validates the input and displays an informational response. Live availability, reservations, PNR lookup, payment, and customer support are not connected.
- Password recovery does not send email. The page explains how to reset local demonstration data.
- The JSON account file is local demo storage, not a secure database. Do not put real personal information or reused passwords in it. Delete `data/accounts.json` after the assignment demo if appropriate.
- Apache must deny direct HTTP access to the `data/` directory. If using a server that does not honor `.htaccess`, configure an equivalent deny rule before running the app.

## Stop the application

In the XAMPP Control Panel, click **Stop** next to Apache.

## Testing checklist

- [ ] Open the home page and follow Home, Trains, Bookings, Help, Login, and Sign Up navigation.
- [ ] Submit search with missing fields, a past date, and identical stations; confirm validation. Swap the stations and submit valid values; confirm the demo-only availability message appears without invented results.
- [ ] Try signup with invalid email/mobile, weak or mismatched passwords, missing required fields, and unaccepted terms.
- [ ] Sign up with valid details; inspect `data/accounts.json` locally and confirm it contains `password_hash` rather than a plaintext password.
- [ ] Try signing up again with the same email in different letter case and confirm it is rejected.
- [ ] Log in with a valid account, test the password visibility control, and log out. Try incorrect credentials and confirm the generic error appears.
- [ ] Open Forgot password and confirm it clearly says email recovery is not configured.
- [ ] Check the navigation, forms, and image layout at desktop, tablet, and mobile widths, and verify keyboard focus is visible.

If PHP CLI is installed, run this from the project directory to check PHP syntax:

```powershell
Get-ChildItem -Recurse -Filter *.php | ForEach-Object { php -l $_.FullName }
```
