from rest_framework import viewsets
from .models import SubscriptionPass, TrainingSession
from .serializers import SubscriptionPassSerializer, TrainingSessionSerializer

class SubscriptionPassViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SubscriptionPass.objects.all()
    serializer_class = SubscriptionPassSerializer

class TrainingSessionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TrainingSession.objects.filter(is_active=True).order_by('date')
    serializer_class = TrainingSessionSerializer
