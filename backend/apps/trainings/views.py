from rest_framework import viewsets, permissions
from .models import SubscriptionPass, TrainingSession
from .serializers import SubscriptionPassSerializer, TrainingSessionSerializer

class SubscriptionPassViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionPass.objects.all()
    serializer_class = SubscriptionPassSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

class TrainingSessionViewSet(viewsets.ModelViewSet):
    queryset = TrainingSession.objects.all()
    serializer_class = TrainingSessionSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
