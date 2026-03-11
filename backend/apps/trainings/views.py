"""
Views Trainings — Pass d'abonnement et sessions.
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import SubscriptionPass, TrainingSession, TrainingRegistration
from .serializers import (
    SubscriptionPassSerializer,
    TrainingSessionSerializer,
    TrainingRegistrationSerializer,
)


class SubscriptionPassViewSet(viewsets.ModelViewSet):
    """
    API pour les pass d'abonnement.
    GET: public, POST/PUT/DELETE: admin.
    """
    queryset = SubscriptionPass.objects.filter(is_active=True)
    serializer_class = SubscriptionPassSerializer
    lookup_field = "slug"

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


class TrainingSessionViewSet(viewsets.ModelViewSet):
    """
    API pour les sessions de training.
    GET: public, POST/PUT/DELETE: admin.
    Filtres: ?upcoming=1 (sessions à venir), ?level=slug
    """
    serializer_class = TrainingSessionSerializer
    lookup_field = "slug"

    def get_queryset(self):
        qs = TrainingSession.objects.filter(is_cancelled=False)
        
        # Filtre sessions à venir
        if self.request.query_params.get("upcoming"):
            qs = qs.filter(date__gte=timezone.now())
        
        # Filtre par niveau
        level = self.request.query_params.get("level")
        if level:
            qs = qs.filter(level__slug=level)
        
        return qs.select_related("instructor", "level").prefetch_related("registrations")

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def register(self, request, slug=None):
        """Inscription à une session."""
        session = self.get_object()
        user = request.user

        # Vérifier si déjà inscrit
        if TrainingRegistration.objects.filter(user=user, session=session).exists():
            return Response(
                {"error": "Vous êtes déjà inscrit à cette session."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Vérifier la capacité
        confirmed_count = session.registrations.filter(status="confirmed").count()
        if confirmed_count >= session.capacity:
            reg_status = "waitlist"
        else:
            reg_status = "confirmed"

        registration = TrainingRegistration.objects.create(
            user=user,
            session=session,
            status=reg_status
        )
        return Response(
            TrainingRegistrationSerializer(registration).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=["delete"], permission_classes=[permissions.IsAuthenticated])
    def unregister(self, request, slug=None):
        """Désinscription d'une session."""
        session = self.get_object()
        user = request.user

        try:
            registration = TrainingRegistration.objects.get(user=user, session=session)
            registration.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except TrainingRegistration.DoesNotExist:
            return Response(
                {"error": "Vous n'êtes pas inscrit à cette session."},
                status=status.HTTP_404_NOT_FOUND
            )
