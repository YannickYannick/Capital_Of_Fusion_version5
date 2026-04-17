"""
Routes API — menu, courses, events, organization, projects, auth.
Routes admin — POST/PATCH/DELETE sécurisées superuser.
"""
from django.urls import path, include
from apps.core.views import (
    MenuItemListAPIView,
    health_check,
    SiteConfigurationAPIView,
    SiteConfigurationAdminAPIView,
    AdminTranslateAPIView,
    AdminTranslatePreviewAPIView,
    AdminTranslateApplyAPIView,
    AdminTranslateSubmitPendingAPIView,
    seed_database,
    ExplorePresetViewSet,
    BulletinListAPIView,
    BulletinDetailAPIView,
    BulletinAdminListCreateAPIView,
    BulletinAdminDetailAPIView,
    PendingContentEditListAPIView,
    PendingContentEditDetailAPIView,
    FaqItemListAPIView,
)
from apps.courses.views import (
    CourseListAPIView, CourseDetailAPIView, ScheduleListAPIView,
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
    PoleListAPIView,
    StaffListAPIView,
)
from apps.partners.views import (
    PartnerNodeListAPIView,
    PartnerNodeDetailAPIView,
    PartnerEventListAPIView,
    PartnerEventDetailAPIView,
    PartnerCourseListAPIView,
    PartnerCourseDetailAPIView,
)
from apps.partners.admin_views import (
    PartnerAdminListCreateAPIView,
    PartnerCourseMetaAPIView,
    PartnerNodeAdminDetailAPIView,
    PartnerNodeAdminCreateAPIView,
    PartnerBrandAdminDetailAPIView,
    PartnerEventAdminDetailAPIView,
    PartnerEventAdminCreateAPIView,
    PartnerCourseAdminDetailAPIView,
    PartnerCourseAdminCreateAPIView,
)
from apps.users.views import (
    LoginAPIView,
    GoogleLoginAPIView,
    LogoutAPIView,
    MeAPIView,
    RegisterAPIView,
    PendingStaffAPIView,
    ArtistListAPIView,
    ArtistDetailAPIView,
    ArtistAdminDetailAPIView,
    ArtistAdminListCreateAPIView,
    DanceProfessionAdminListAPIView,
)

from rest_framework.routers import DefaultRouter
from apps.shop.views import ProductCategoryViewSet, ProductViewSet
from apps.care.views import PractitionerViewSet, ServiceCategoryViewSet, CareServiceViewSet
from apps.projects.views import ProjectCategoryViewSet, ProjectViewSet
from apps.trainings.views import SubscriptionPassViewSet, TrainingSessionViewSet

router = DefaultRouter()
router.register(r'shop/categories', ProductCategoryViewSet, basename='shop-category')
router.register(r'shop/products', ProductViewSet, basename='shop-product')
router.register(r'care/practitioners', PractitionerViewSet, basename='care-practitioner')
router.register(r'care/categories', ServiceCategoryViewSet, basename='care-category')
router.register(r'care/services', CareServiceViewSet, basename='care-service')
router.register(r'projects/categories', ProjectCategoryViewSet, basename='project-category')
router.register(r'projects/projects', ProjectViewSet, basename='project')
router.register(r'trainings/passes', SubscriptionPassViewSet, basename='training-pass')
router.register(r'trainings/sessions', TrainingSessionViewSet, basename='training-session')
router.register(r'core/presets', ExplorePresetViewSet, basename='explore-preset')


urlpatterns = [
    # ── Core ────────────────────────────────────────────────────────────────
    path("artists/", include("apps.artists.urls")),
    path("health/", health_check),
    path("config/", SiteConfigurationAPIView.as_view()),
    path("menu/items/", MenuItemListAPIView.as_view()),
    path("identite/bulletins/", BulletinListAPIView.as_view()),
    path("identite/bulletins/<slug:slug>/", BulletinDetailAPIView.as_view()),
    path("faq/", FaqItemListAPIView.as_view()),
    path("seed/", seed_database),

    # ── Courses (lecture) ────────────────────────────────────────────────────
    path("courses/", CourseListAPIView.as_view()),
    path("courses/schedules/", ScheduleListAPIView.as_view()),
    path("courses/theory/", TheoryLessonListAPIView.as_view()),
    path("courses/theory/<slug:slug>/", TheoryLessonDetailAPIView.as_view()),
    path("courses/<slug:slug>/", CourseDetailAPIView.as_view()),

    # ── Events (lecture) ─────────────────────────────────────────────────────
    path("events/", EventListAPIView.as_view()),
    path("events/<slug:slug>/", EventDetailAPIView.as_view()),

    # ── Organization (lecture) ───────────────────────────────────────────────
    path("organization/nodes/", OrganizationNodeListAPIView.as_view()),
    path("organization/nodes/<slug:slug>/", OrganizationNodeDetailAPIView.as_view()),
    path("organization/poles/", PoleListAPIView.as_view()),
    path("organization/staff/", StaffListAPIView.as_view()),

    # ── Partners (lecture) ────────────────────────────────────────────────────
    path("partners/nodes/", PartnerNodeListAPIView.as_view()),
    path("partners/nodes/<slug:slug>/", PartnerNodeDetailAPIView.as_view()),
    path("partners/events/", PartnerEventListAPIView.as_view()),
    path("partners/events/<slug:slug>/", PartnerEventDetailAPIView.as_view()),
    path("partners/courses/", PartnerCourseListAPIView.as_view()),
    path("partners/courses/<slug:slug>/", PartnerCourseDetailAPIView.as_view()),

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

    # ── Admin routes (POST / PATCH / DELETE) — staff/superuser ──────────────
    path("admin/events/", EventAdminAPIView.as_view()),
    path("admin/events/<slug:slug>/", EventAdminDetailAPIView.as_view()),
    path("admin/courses/", CourseAdminAPIView.as_view()),
    path("admin/courses/<slug:slug>/", CourseAdminDetailAPIView.as_view()),
    path("admin/courses/theory/", TheoryLessonAdminAPIView.as_view()),
    path("admin/courses/theory/<slug:slug>/", TheoryLessonAdminDetailAPIView.as_view()),
    path("admin/users/artists/", ArtistAdminListCreateAPIView.as_view()),
    path("admin/users/artists/professions/", DanceProfessionAdminListAPIView.as_view()),
    path("admin/users/artists/<str:username>/", ArtistAdminDetailAPIView.as_view()),
    path("admin/organization/nodes/<slug:slug>/", OrganizationNodeAdminDetailAPIView.as_view()),
    path("admin/config/", SiteConfigurationAdminAPIView.as_view()),
    path("admin/translate/", AdminTranslateAPIView.as_view()),
    path("admin/translate/preview/", AdminTranslatePreviewAPIView.as_view()),
    path("admin/translate/apply/", AdminTranslateApplyAPIView.as_view()),
    path("admin/translate/submit-pending/", AdminTranslateSubmitPendingAPIView.as_view()),
    path("admin/identite/bulletins/", BulletinAdminListCreateAPIView.as_view()),
    path("admin/identite/bulletins/<slug:slug>/", BulletinAdminDetailAPIView.as_view()),
    path("admin/pending-edits/", PendingContentEditListAPIView.as_view()),
    path("admin/pending-edits/<int:pk>/", PendingContentEditDetailAPIView.as_view()),
    path("admin/partners/", PartnerAdminListCreateAPIView.as_view()),
    path("admin/partners/course-meta/", PartnerCourseMetaAPIView.as_view()),
    path("admin/partners/brands/<slug:slug>/", PartnerBrandAdminDetailAPIView.as_view()),
    path("admin/partners/nodes/<slug:slug>/", PartnerNodeAdminDetailAPIView.as_view()),
    path("admin/partners/nodes/", PartnerNodeAdminCreateAPIView.as_view()),
    path("admin/partners/events/<slug:slug>/", PartnerEventAdminDetailAPIView.as_view()),
    path("admin/partners/events/", PartnerEventAdminCreateAPIView.as_view()),
    path("admin/partners/courses/<slug:slug>/", PartnerCourseAdminDetailAPIView.as_view()),
    path("admin/partners/courses/", PartnerCourseAdminCreateAPIView.as_view()),
]

urlpatterns += router.urls
