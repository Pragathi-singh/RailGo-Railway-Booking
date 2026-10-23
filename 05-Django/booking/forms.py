import re
from datetime import date

from django import forms
from django.contrib.auth import authenticate, get_user_model
from django.core.exceptions import ValidationError

from .models import Profile

User = get_user_model()


class SignupForm(forms.Form):
    full_name = forms.CharField(max_length=100, label="Full name")
    email = forms.EmailField(max_length=254)
    mobile = forms.CharField(max_length=14, label="Mobile number")
    password = forms.CharField(min_length=8, widget=forms.PasswordInput, label="Password")
    confirm_password = forms.CharField(widget=forms.PasswordInput, label="Confirm password")

    def clean_full_name(self):
        value = " ".join(self.cleaned_data["full_name"].split())
        if not value:
            raise ValidationError("Enter your name.")
        return value

    def clean_email(self):
        email = self.cleaned_data["email"].strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise ValidationError("An account with this email already exists. Try logging in instead.")
        return email

    def clean_mobile(self):
        mobile = re.sub(r"[\s()-]", "", self.cleaned_data["mobile"])
        if not re.fullmatch(r"[6-9]\d{9}", mobile):
            raise ValidationError("Enter a valid 10-digit Indian mobile number.")
        return mobile

    def clean_password(self):
        password = self.cleaned_data["password"]
        if not re.search(r"[a-z]", password) or not re.search(r"[A-Z]", password) or not re.search(r"\d", password):
            raise ValidationError("Use at least 8 characters with uppercase, lowercase and a number.")
        return password

    def clean(self):
        cleaned = super().clean()
        if cleaned.get("password") and cleaned.get("confirm_password") != cleaned["password"]:
            self.add_error("confirm_password", "Your passwords do not match.")
        return cleaned

    def save(self):
        user = User.objects.create_user(
            username=self.cleaned_data["email"],
            email=self.cleaned_data["email"],
            first_name=self.cleaned_data["full_name"],
        )
        user.set_password(self.cleaned_data["password"])
        user.save(update_fields=["password"])
        Profile.objects.create(user=user, mobile=self.cleaned_data["mobile"])
        return user


class LoginForm(forms.Form):
    email = forms.EmailField()
    password = forms.CharField(widget=forms.PasswordInput)

    def clean(self):
        cleaned = super().clean()
        if cleaned.get("email") and cleaned.get("password"):
            email = cleaned["email"].strip().lower()
            user = User.objects.filter(email__iexact=email).first()
            authenticated = authenticate(username=user.username, password=cleaned["password"]) if user else None
            if authenticated is None:
                raise ValidationError("We could not match that email and password. Check your details and try again.")
            cleaned["user"] = authenticated
        return cleaned


class TrainSearchForm(forms.Form):
    from_station = forms.CharField(max_length=80, label="From")
    to_station = forms.CharField(max_length=80, label="To")
    journey_date = forms.DateField(
        label="Journey date",
        widget=forms.DateInput(attrs={"type": "date"}),
        input_formats=["%Y-%m-%d"],
    )
    travel_class = forms.ChoiceField(
        label="Travel class",
        choices=[
            ("AC 3 Tier", "AC 3 Tier"),
            ("AC 2 Tier", "AC 2 Tier"),
            ("AC First Class", "AC First Class"),
            ("Sleeper", "Sleeper"),
            ("Chair Car", "Chair Car"),
        ],
    )

    def clean(self):
        cleaned = super().clean()
        origin = cleaned.get("from_station", "").strip()
        destination = cleaned.get("to_station", "").strip()
        if origin and destination and origin.casefold() == destination.casefold():
            raise ValidationError("Choose different departure and destination stations.")
        journey_date = cleaned.get("journey_date")
        if journey_date and journey_date < date.today():
            self.add_error("journey_date", "Choose today or a future journey date.")
        cleaned["from_station"] = origin
        cleaned["to_station"] = destination
        return cleaned
