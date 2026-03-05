from rest_framework import viewsets, permissions
from django.contrib.auth import get_user_model

User = get_user_model()

# Les vues artistes sont actuellement dans apps.users.views (ArtistListAPIView, ArtistDetailAPIView)
# On peut laisser ce fichier vide ou y mettre des outils spécifiques aux artistes si besoin.
