from datetime import date, timedelta

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse


class RailGoTests(TestCase):
    def signup_data(self, **overrides):
        data = {
            "full_name": "Asha Railgo",
            "email": "asha@example.com",
            "mobile": "9876543210",
            "password": "Railgo123",
            "confirm_password": "Railgo123",
        }
        data.update(overrides)
        return data

    def test_signup_creates_hashed_user_and_redirects(self):
        response = self.client.post(reverse("signup"), self.signup_data())
        self.assertRedirects(response, reverse("dashboard"))
        user = User.objects.get(email="asha@example.com")
        self.assertTrue(user.check_password("Railgo123"))
        self.assertNotEqual(user.password, "Railgo123")

    def test_duplicate_email_is_rejected_case_insensitively(self):
        User.objects.create_user(username="existing", email="asha@example.com", password="Railgo123")
        response = self.client.post(reverse("signup"), self.signup_data(email="ASHA@EXAMPLE.COM"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "already exists")
        self.assertEqual(User.objects.count(), 1)

    def test_invalid_login_shows_friendly_error(self):
        User.objects.create_user(username="asha@example.com", email="asha@example.com", password="Railgo123")
        response = self.client.post(reverse("login"), {"email": "asha@example.com", "password": "wrongpass"})
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "could not match")

    def test_dashboard_requires_login(self):
        response = self.client.get(reverse("dashboard"))
        self.assertRedirects(response, f"{reverse('login')}?next={reverse('dashboard')}")

    def test_logout_requires_post_and_clears_session(self):
        user = User.objects.create_user(username="asha@example.com", email="asha@example.com", password="Railgo123")
        self.client.force_login(user)
        response = self.client.post(reverse("logout"))
        self.assertRedirects(response, reverse("home"))
        self.assertNotIn("_auth_user_id", self.client.session)

    def test_train_search_rejects_same_and_past_stations(self):
        same = self.client.post(reverse("home"), {
            "from_station": "Delhi",
            "to_station": "delhi",
            "journey_date": (date.today() + timedelta(days=1)).isoformat(),
            "travel_class": "Sleeper",
        })
        self.assertContains(same, "different departure")
        past = self.client.post(reverse("home"), {
            "from_station": "Delhi",
            "to_station": "Jaipur",
            "journey_date": (date.today() - timedelta(days=1)).isoformat(),
            "travel_class": "Sleeper",
        })
        self.assertContains(past, "today or a future")
