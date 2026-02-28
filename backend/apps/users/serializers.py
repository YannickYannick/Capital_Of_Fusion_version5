from rest_framework import serializers
from apps.core.models import DanceProfession, Level
from .models import User

class DanceProfessionPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = DanceProfession
        fields = ['id', 'name', 'slug']

class LevelPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Level
        fields = ['id', 'name', 'slug', 'color']

class ArtistSerializer(serializers.ModelSerializer):
    professions = DanceProfessionPublicSerializer(many=True, read_only=True)
    dance_level = LevelPublicSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 
            'username', 
            'first_name', 
            'last_name', 
            'bio', 
            'profile_picture', 
            'professions', 
            'dance_level', 
            'is_vibe'
        ]
