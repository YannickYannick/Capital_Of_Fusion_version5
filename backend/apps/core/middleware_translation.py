from typing import Callable

from django.utils.translation import activate as django_activate
from django.utils.translation import deactivate as django_deactivate


class TranslationLanguageMiddleware:
    """
    Active la langue modeltranslation à partir du paramètre d'URL `?lang=fr|en|es`.

    Objectif : que les serializers DRF renvoient automatiquement les champs traduits
    (ex: `name` → `name_en` / `name_es`) pour les modèles enregistrés via modeltranslation.
    """

    ALLOWED = {"fr", "en", "es"}

    def __init__(self, get_response: Callable):
        self.get_response = get_response

    def __call__(self, request):
        lang = request.GET.get("lang")
        if lang in self.ALLOWED:
            django_activate(lang)
        try:
            return self.get_response(request)
        finally:
            # Important : on remet l'état à zéro pour éviter les fuites entre requêtes.
            django_deactivate()
