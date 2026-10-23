from django.contrib import messages
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
from django.utils.http import url_has_allowed_host_and_scheme

from .forms import LoginForm, SignupForm, TrainSearchForm


def home(request):
    search_form = TrainSearchForm(request.POST or None)
    search_result = None
    if request.method == "POST" and search_form.is_valid():
        data = search_form.cleaned_data
        search_result = (
            f"Live train results are not available for {data['from_station']} to {data['to_station']} on "
            f"{data['journey_date'].strftime('%d %B %Y')} in {data['travel_class']}. "
            "Please try another date or route."
        )
    return render(request, "booking/home.html", {"search_form": search_form, "search_result": search_result})


def signup_view(request):
    if request.user.is_authenticated:
        return redirect("dashboard")
    form = SignupForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        user = form.save()
        login(request, user)
        messages.success(request, "Your RailGo account is ready. Welcome aboard!")
        return redirect("dashboard")
    return render(request, "booking/signup.html", {
        "form": form,
        "heading": "Create your account",
        "eyebrow": "A NEW JOURNEY STARTS HERE",
        "intro": "Join RailGo and bring your travel plans together.",
    })


def login_view(request):
    if request.user.is_authenticated:
        return redirect("dashboard")
    form = LoginForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        login(request, form.cleaned_data["user"])
        next_url = request.GET.get("next")
        if next_url and url_has_allowed_host_and_scheme(next_url, {request.get_host()}, require_https=request.is_secure()):
            return redirect(next_url)
        return redirect("dashboard")
    return render(request, "booking/login.html", {
        "form": form,
        "heading": "Welcome back",
        "eyebrow": "GOOD TO SEE YOU",
        "intro": "Log in to pick up where your next journey begins.",
    })


@login_required
def dashboard(request):
    return render(request, "booking/dashboard.html")


def logout_view(request):
    if request.method == "POST":
        logout(request)
        messages.success(request, "You have been logged out securely.")
    return redirect("home")


def custom_404(request, exception):
    return render(request, "404.html", status=404)
