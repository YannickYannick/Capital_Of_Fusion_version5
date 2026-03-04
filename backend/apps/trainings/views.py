from rest_framework import viewsets
from rest_framework.permissions import AllowAny


class SubscriptionPassViewSet(viewsets.GenericViewSet):
    queryset = []
    permission_classes = [AllowAny]


class TrainingSessionViewSet(viewsets.GenericViewSet):
    queryset = []
    permission_classes = [AllowAny]
