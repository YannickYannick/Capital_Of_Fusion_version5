from rest_framework import viewsets
from rest_framework.response import Response

class PractitionerViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response([])

class CareServiceViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response([])
