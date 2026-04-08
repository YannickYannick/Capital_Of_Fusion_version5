"""
Schéma commun pour liens sociaux / contact sur nœuds org., structures partenaires, artistes.
Max 3 Instagram, 3 sites web, 1 Facebook ; contact : email, téléphone, WhatsApp.
"""
from __future__ import annotations

import json
from typing import Any

DEFAULT_EXTERNAL_LINKS: dict[str, Any] = {
    "instagram": [],
    "websites": [],
    "facebook": "",
    "contact": {
        "email": "",
        "phone": "",
        "whatsapp": "",
    },
}


def normalize_external_links(raw: Any) -> dict[str, Any]:
    """Valide et normalise le payload (dict ou JSON-parsable)."""
    if raw is None:
        return dict(DEFAULT_EXTERNAL_LINKS)
    if not isinstance(raw, dict):
        return dict(DEFAULT_EXTERNAL_LINKS)

    out = dict(DEFAULT_EXTERNAL_LINKS)
    ig = raw.get("instagram") or []
    if isinstance(ig, list):
        urls = [str(x).strip() for x in ig[:3] if str(x).strip()]
        out["instagram"] = urls
    ws = raw.get("websites") or []
    if isinstance(ws, list):
        urls = [str(x).strip() for x in ws[:3] if str(x).strip()]
        out["websites"] = urls
    fb = raw.get("facebook")
    out["facebook"] = str(fb).strip() if fb is not None else ""

    contact = raw.get("contact") or {}
    if isinstance(contact, dict):
        out["contact"] = {
            "email": str(contact.get("email") or "").strip()[:254],
            "phone": str(contact.get("phone") or "").strip()[:80],
            "whatsapp": str(contact.get("whatsapp") or "").strip()[:80],
        }
    return out


def parse_external_links_param(raw: Any) -> dict[str, Any] | None:
    """Interprète la valeur issue d'un formulaire ou JSON API (None = absent)."""
    if raw is None:
        return None
    if isinstance(raw, dict):
        return normalize_external_links(raw)
    if isinstance(raw, str):
        s = raw.strip()
        if not s:
            return normalize_external_links({})
        try:
            return normalize_external_links(json.loads(s))
        except json.JSONDecodeError:
            return normalize_external_links({})
    return normalize_external_links({})
