from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("booking.urls")),
]

handler404 = "booking.views.custom_404"
