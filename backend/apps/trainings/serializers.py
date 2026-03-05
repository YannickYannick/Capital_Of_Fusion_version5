from rest_framework import serializers
from .models import SubscriptionPass, TrainingSession

class SubscriptionPassSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPass
        fields = '__all__'

class TrainingSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingSession
        fields = '__all__'
