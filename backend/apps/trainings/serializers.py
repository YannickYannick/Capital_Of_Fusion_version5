from rest_framework import serializers
from .models import SubscriptionPass, TrainingSession

class SubscriptionPassSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPass
        fields = ['id', 'name', 'description', 'price', 'validity_months', 'stripe_payment_url']

class TrainingSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingSession
        fields = ['id', 'theme', 'date', 'location', 'available_spots', 'is_active']
