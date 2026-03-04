from rest_framework import viewsets
from rest_framework.response import Response

class SubscriptionPassViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response([])

class TrainingSessionViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response([])
