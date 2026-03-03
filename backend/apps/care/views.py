from rest_framework import viewsets
from .models import Practitioner, CareService
from .serializers import PractitionerSerializer, CareServiceSerializer

class PractitionerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Practitioner.objects.all()
    serializer_class = PractitionerSerializer

class CareServiceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CareService.objects.all()
    serializer_class = CareServiceSerializer
