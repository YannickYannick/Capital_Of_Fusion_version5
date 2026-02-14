"""
Routes API — menu, courses, events (lecture seule Phase 1).
"""
from django.urls import path
from apps.core.views import MenuItemListAPIView
from apps.courses.views import CourseListAPIView
from apps.events.views import EventListAPIView

urlpatterns = [
    path("menu/items/", MenuItemListAPIView.as_view()),
    path("courses/", CourseListAPIView.as_view()),
    path("events/", EventListAPIView.as_view()),
]
