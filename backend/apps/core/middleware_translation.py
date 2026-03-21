from typing import Callable

from pathlib import Path

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

    # #region agent log
    def _log_debug(self, hypothesis_id: str, message: str, data: dict | None = None) -> None:
        """
        Ecrit une ligne NDJSON dans debug-8686e1.log pour ce debug session.
        (Langage: Python standard library, sans dépendances)
        """
        log_path = Path(__file__).resolve().parents[3] / "debug-8686e1.log"
        payload = {
            "sessionId": "8686e1",
            "runId": "pre-activation-fix",
            "hypothesisId": hypothesis_id,
            "location": "middleware_translation.py",
            "message": message,
            "data": data or {},
            "timestamp": __import__("time").time(),
        }
        try:
            with open(log_path, "a", encoding="utf-8") as f:
                import json

                f.write(json.dumps(payload, ensure_ascii=False) + "\n")
        except Exception:
            # Ne jamais bloquer le serveur à cause du logging.
            pass
    # #endregion

    def __call__(self, request):
        lang = request.GET.get("lang")
        if lang in self.ALLOWED:
            # Hypothese: modeltranslation n'exporte pas activate/deactivate.
            # Correction: on active la langue de traduction côté Django.
            django_activate(lang)
            self._log_debug(
                hypothesis_id="H1_modeltranslation_language_activation",
                message="Activated django translation language from ?lang",
                data={"lang": lang},
            )
        try:
            return self.get_response(request)
        finally:
            # Important : on remet l'état à zéro pour éviter les fuites entre requêtes.
            django_deactivate()

