from rest_framework import viewsets
from apps.core.permissions import IsSuperUser
from .models import Practitioner, CareService
from .serializers import PractitionerSerializer, CareServiceSerializer

class BaseViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsSuperUser()]
        return []

class PractitionerViewSet(BaseViewSet):
    queryset = Practitioner.objects.all()
    serializer_class = PractitionerSerializer

class CareServiceViewSet(BaseViewSet):
    queryset = CareService.objects.select_related('practitioner')
    serializer_class = CareServiceSerializer
