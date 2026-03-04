"""
Routes API — menu, courses, events, organization, projects, auth.
Routes admin — POST/PATCH/DELETE sécurisées superuser.
"""
from django.urls import path
from apps.core.views import MenuItemListAPIView, health_check, SiteConfigurationAPIView, seed_database
from apps.courses.views import (
    CourseListAPIView, CourseDetailAPIView,
    TheoryLessonListAPIView, TheoryLessonDetailAPIView,
    CourseAdminAPIView, CourseAdminDetailAPIView,
    TheoryLessonAdminAPIView, TheoryLessonAdminDetailAPIView,
)
from apps.events.views import (
    EventListAPIView, EventDetailAPIView,
    EventAdminAPIView, EventAdminDetailAPIView,
)
from apps.organization.views import (
    OrganizationNodeListAPIView,
    OrganizationNodeDetailAPIView,
    OrganizationNodeAdminDetailAPIView,
)
from apps.users.views import (
    LoginAPIView,
    GoogleLoginAPIView,
    LogoutAPIView,
    MeAPIView,
    RegisterAPIView,
    PendingStaffAPIView,
    ArtistListAPIView,
    ArtistDetailAPIView
)

from rest_framework.routers import DefaultRouter
from apps.shop.views import ProductCategoryViewSet, ProductViewSet
from apps.care.views import PractitionerViewSet, CareServiceViewSet
from apps.projects.views import ProjectCategoryViewSet, ProjectViewSet
from apps.trainings.views import SubscriptionPassViewSet, TrainingSessionViewSet

router = DefaultRouter()
router.register(r'shop/categories', ProductCategoryViewSet, basename='shop-category')
router.register(r'shop/products', ProductViewSet, basename='shop-product')
router.register(r'care/practitioners', PractitionerViewSet, basename='care-practitioner')
router.register(r'care/services', CareServiceViewSet, basename='care-service')
router.register(r'projects/categories', ProjectCategoryViewSet, basename='project-category')
router.register(r'projects/projects', ProjectViewSet, basename='project')
router.register(r'trainings/passes', SubscriptionPassViewSet, basename='training-pass')
router.register(r'trainings/sessions', TrainingSessionViewSet, basename='training-session')


urlpatterns = [
    # ── Core ────────────────────────────────────────────────────────────────
    path("health/", health_check),
    path("config/", SiteConfigurationAPIView.as_view()),
    path("menu/items/", MenuItemListAPIView.as_view()),
    path("seed/", seed_database),

    # ── Courses (lecture) ────────────────────────────────────────────────────
    path("courses/", CourseListAPIView.as_view()),
    path("courses/theory/", TheoryLessonListAPIView.as_view()),
    path("courses/theory/<slug:slug>/", TheoryLessonDetailAPIView.as_view()),
    path("courses/<slug:slug>/", CourseDetailAPIView.as_view()),

    # ── Events (lecture) ─────────────────────────────────────────────────────
    path("events/", EventListAPIView.as_view()),
    path("events/<slug:slug>/", EventDetailAPIView.as_view()),

    # ── Organization (lecture) ───────────────────────────────────────────────
    path("organization/nodes/", OrganizationNodeListAPIView.as_view()),
    path("organization/nodes/<slug:slug>/", OrganizationNodeDetailAPIView.as_view()),

    # ── Auth ─────────────────────────────────────────────────────────────────
    path("auth/login/", LoginAPIView.as_view()),
    path("auth/register/", RegisterAPIView.as_view()),
    path("auth/google/", GoogleLoginAPIView.as_view()),
    path("auth/logout/", LogoutAPIView.as_view()),
    path("auth/me/", MeAPIView.as_view()),
    path("auth/pending-staff/", PendingStaffAPIView.as_view()),
    path("auth/pending-staff/<int:user_id>/", PendingStaffAPIView.as_view()),

    # ── Users / Artists ──────────────────────────────────────────────────────
    path("users/artists/", ArtistListAPIView.as_view()),
    path("users/artists/<str:username>/", ArtistDetailAPIView.as_view()),

    # ── Admin routes (POST / PATCH / DELETE) — superuser only ────────────────
    path("admin/events/", EventAdminAPIView.as_view()),
    path("admin/events/<slug:slug>/", EventAdminDetailAPIView.as_view()),
    path("admin/courses/", CourseAdminAPIView.as_view()),
    path("admin/courses/<slug:slug>/", CourseAdminDetailAPIView.as_view()),
    path("admin/courses/theory/", TheoryLessonAdminAPIView.as_view()),
    path("admin/courses/theory/<slug:slug>/", TheoryLessonAdminDetailAPIView.as_view()),
    path("admin/organization/nodes/<slug:slug>/", OrganizationNodeAdminDetailAPIView.as_view()),
]

urlpatterns += router.urls
