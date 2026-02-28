"""
Routes API — menu, courses, events (lecture seule Phase 1).
"""
from django.urls import path
from apps.core.views import MenuItemListAPIView, health_check, SiteConfigurationAPIView
from apps.courses.views import CourseListAPIView, CourseDetailAPIView, TheoryLessonListAPIView, TheoryLessonDetailAPIView
from apps.events.views import EventListAPIView, EventDetailAPIView
from apps.organization.views import (
    OrganizationNodeListAPIView,
    OrganizationNodeDetailAPIView,
)
from apps.users.views import (
    LoginAPIView, 
    GoogleLoginAPIView, 
    LogoutAPIView, 
    MeAPIView,
    ArtistListAPIView,
    ArtistDetailAPIView
)

urlpatterns = [
    path("health/", health_check),
    path("config/", SiteConfigurationAPIView.as_view()),
    path("menu/items/", MenuItemListAPIView.as_view()),
    path("courses/", CourseListAPIView.as_view()),
    path("courses/theory/", TheoryLessonListAPIView.as_view()),
    path("courses/theory/<slug:slug>/", TheoryLessonDetailAPIView.as_view()),
    path("courses/<slug:slug>/", CourseDetailAPIView.as_view()),
    path("events/", EventListAPIView.as_view()),
    path("events/<slug:slug>/", EventDetailAPIView.as_view()),
    path("organization/nodes/", OrganizationNodeListAPIView.as_view()),
    path("organization/nodes/<slug:slug>/", OrganizationNodeDetailAPIView.as_view()),
    path("auth/login/", LoginAPIView.as_view()),
    path("auth/google/", GoogleLoginAPIView.as_view()),
    path("auth/logout/", LogoutAPIView.as_view()),
    path("auth/me/", MeAPIView.as_view()),
    path("users/artists/", ArtistListAPIView.as_view()),
    path("users/artists/<str:username>/", ArtistDetailAPIView.as_view()),
]
