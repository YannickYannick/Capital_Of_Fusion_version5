from rest_framework import viewsets
from apps.core.permissions import IsSuperUser
from .models import SubscriptionPass, TrainingSession
from .serializers import SubscriptionPassSerializer, TrainingSessionSerializer

class BaseViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsSuperUser()]
        return []

class SubscriptionPassViewSet(BaseViewSet):
    queryset = SubscriptionPass.objects.all()
    serializer_class = SubscriptionPassSerializer

class TrainingSessionViewSet(BaseViewSet):
    queryset = TrainingSession.objects.all()
    serializer_class = TrainingSessionSerializer
