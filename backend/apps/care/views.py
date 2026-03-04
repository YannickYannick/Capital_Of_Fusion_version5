from rest_framework import viewsets
from rest_framework.permissions import AllowAny


class PractitionerViewSet(viewsets.GenericViewSet):
    queryset = []
    permission_classes = [AllowAny]


class CareServiceViewSet(viewsets.GenericViewSet):
    queryset = []
    permission_classes = [AllowAny]
