"""Réponses API avec en-têtes anti-cache (listes JSON souvent obsolètes sinon)."""
from rest_framework.response import Response


def json_response_no_store(data, status=200):
    r = Response(data, status=status)
    r["Cache-Control"] = "no-store, max-age=0"
    return r
