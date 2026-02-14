"""
URL Configuration — racine du projet.
Les routes API sont incluses sous /api/.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("config.api_urls")),
]
