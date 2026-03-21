"""
Helpers pour les messages d'erreur Gemini (clé API masquée, nom de modèle).
"""
import os


def mask_gemini_api_key(key: str) -> str:
    """
    Affiche une forme reconnaissable mais non exploitable de la clé (debug / support).
    Pour afficher la clé complète en local uniquement : GEMINI_ERROR_SHOW_FULL_KEY=1
    (ne jamais activer en production).
    """
    if not key or not str(key).strip():
        return "(absente)"
    k = str(key).strip()
    if os.getenv("GEMINI_ERROR_SHOW_FULL_KEY", "").strip().lower() in ("1", "true", "yes"):
        return k
    if len(k) <= 8:
        return f"*** (longueur {len(k)})"
    return f"{k[:4]}…{k[-4:]} (longueur {len(k)})"


def gemini_error_message(detail: str, *, api_key: str, model_name: str) -> str:
    """Message d'erreur enrichi : modèle + clé masquée + détail API / SDK."""
    masked = mask_gemini_api_key(api_key)
    return f"[GEMINI] model={model_name!r} api_key={masked} — {detail}"
