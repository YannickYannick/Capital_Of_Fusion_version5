from rest_framework import serializers
from .models import Practitioner, CareService

class PractitionerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Practitioner
        fields = ['id', 'name', 'specialty', 'bio', 'profile_image', 'booking_url']

class CareServiceSerializer(serializers.ModelSerializer):
    practitioner = PractitionerSerializer(read_only=True)
    practitioner_id = serializers.PrimaryKeyRelatedField(
        queryset=Practitioner.objects.all(),
        source='practitioner',
        write_only=True,
        required=True
    )

    class Meta:
        model = CareService
        fields = [
            'id', 'practitioner', 'practitioner_id', 'name',
            'description', 'duration_minutes', 'price'
        ]
