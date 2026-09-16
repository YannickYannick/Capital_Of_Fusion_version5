"""
Service d'envoi de notifications push via Expo Push API et Web Push.

Usage:
    from apps.events.push_service import send_push_to_all

    # Envoyer à tous les appareils (Expo + Web Push)
    send_push_to_all(
        title="Annonce festival",
        body="Le festival commence bientôt !",
    )
"""
import json
import logging
from typing import Optional

import requests
from django.conf import settings

from .models import PushToken

logger = logging.getLogger(__name__)

# Expo Push API
EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"

# VAPID keys pour Web Push (à configurer dans settings/env)
VAPID_PRIVATE_KEY = getattr(settings, "VAPID_PRIVATE_KEY", "scnv9hg8IJkJ7rflhlRmWMoZi_y3YThIRIfGsSGvZns")
VAPID_CLAIMS = {"sub": "mailto:contact@capitaloffusion.com"}


# ─────────────────────────────────────────────────────────────────────────────
# EXPO PUSH (Native iOS/Android)
# ─────────────────────────────────────────────────────────────────────────────

def send_expo_push(
    token: str,
    title: str,
    body: str,
    data: Optional[dict] = None,
) -> dict:
    """Envoie une notification via Expo Push API."""
    message = {
        "to": token,
        "title": title,
        "body": body,
        "sound": "default",
        "channelId": "default",
    }
    if data:
        message["data"] = data

    try:
        response = requests.post(
            EXPO_PUSH_URL,
            headers={"Content-Type": "application/json"},
            data=json.dumps(message),
            timeout=10,
        )
        result = response.json()

        # Désactiver les tokens invalides
        if isinstance(result.get("data"), list) and result["data"]:
            ticket = result["data"][0]
            if ticket.get("status") == "error":
                if ticket.get("details", {}).get("error") in (
                    "DeviceNotRegistered",
                    "InvalidCredentials",
                ):
                    PushToken.objects.filter(token=token).update(is_active=False)
                    logger.warning(f"Disabled invalid Expo token: {token[:30]}...")

        return result
    except requests.RequestException as e:
        logger.error(f"Expo push failed: {e}")
        return {"status": "error", "message": str(e)}


# ─────────────────────────────────────────────────────────────────────────────
# WEB PUSH (PWA)
# ─────────────────────────────────────────────────────────────────────────────

def _is_expired_subscription(exc) -> bool:
    """True si FCM/Mozilla a répondu 404/410 (souscription morte)."""
    response = getattr(exc, "response", None)
    status = getattr(response, "status_code", None)
    if status in (404, 410):
        return True
    message = str(exc).lower()
    return "410" in message or "unsubscribed" in message or "expired" in message


def send_web_push(
    endpoint: str,
    p256dh: str,
    auth: str,
    title: str,
    body: str,
    data: Optional[dict] = None,
) -> dict:
    """Envoie une notification via Web Push Protocol."""
    try:
        from pywebpush import webpush, WebPushException
    except ImportError:
        logger.error("pywebpush not installed")
        return {"status": "error", "message": "pywebpush not installed"}

    subscription_info = {
        "endpoint": endpoint,
        "keys": {
            "p256dh": p256dh,
            "auth": auth,
        },
    }

    payload = json.dumps({
        "title": title,
        "body": body,
        "url": data.get("url", "/") if data else "/",
        **(data or {}),
    })

    try:
        webpush(
            subscription_info=subscription_info,
            data=payload,
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_claims=VAPID_CLAIMS,
        )
        return {"status": "ok"}
    except WebPushException as e:
        logger.error(f"Web push failed: {e}")
        if _is_expired_subscription(e):
            PushToken.objects.filter(endpoint=endpoint).update(is_active=False)
            logger.warning(f"Disabled expired Web Push endpoint: {endpoint[:50]}...")
        return {"status": "error", "message": str(e)}
    except Exception as e:
        logger.error(f"Web push error: {e}")
        return {"status": "error", "message": str(e)}


# ─────────────────────────────────────────────────────────────────────────────
# UNIFIED SEND
# ─────────────────────────────────────────────────────────────────────────────

def send_push_to_all(
    title: str,
    body: str,
    data: Optional[dict] = None,
    platform: Optional[str] = None,
) -> dict:
    """
    Envoie une notification à tous les appareils enregistrés.
    Supporte Expo Push (native) et Web Push (PWA).

    Args:
        title: Titre de la notification
        body: Corps de la notification
        data: Données additionnelles (optionnel)
        platform: Filtrer par plateforme ("ios", "android", "web") ou None pour tous

    Returns:
        Statistiques d'envoi {sent: int, failed: int, expo: int, webpush: int}
    """
    stats = {"sent": 0, "failed": 0, "expo": 0, "webpush": 0}

    # Récupère tous les tokens actifs
    tokens_qs = PushToken.objects.filter(is_active=True)
    if platform:
        tokens_qs = tokens_qs.filter(platform=platform)

    # Sépare Expo et Web Push
    expo_tokens = list(
        tokens_qs.filter(token_type=PushToken.TokenType.EXPO)
        .values_list("token", flat=True)
    )
    webpush_subscriptions = list(
        tokens_qs.filter(token_type=PushToken.TokenType.WEBPUSH)
        .values("endpoint", "p256dh_key", "auth_key")
    )

    # ── Expo Push (batch) ────────────────────────────────────────────────────
    if expo_tokens:
        batch_size = 100
        for i in range(0, len(expo_tokens), batch_size):
            batch = expo_tokens[i : i + batch_size]
            messages = [
                {
                    "to": token,
                    "title": title,
                    "body": body,
                    "sound": "default",
                    "channelId": "default",
                    **({"data": data} if data else {}),
                }
                for token in batch
            ]
            try:
                response = requests.post(
                    EXPO_PUSH_URL,
                    headers={"Content-Type": "application/json"},
                    data=json.dumps(messages),
                    timeout=30,
                )
                result = response.json()
                for j, ticket in enumerate(result.get("data", [])):
                    if ticket.get("status") == "ok":
                        stats["sent"] += 1
                        stats["expo"] += 1
                    else:
                        stats["failed"] += 1
                        if ticket.get("details", {}).get("error") in (
                            "DeviceNotRegistered",
                            "InvalidCredentials",
                        ):
                            PushToken.objects.filter(token=batch[j]).update(is_active=False)
            except requests.RequestException as e:
                logger.error(f"Expo batch failed: {e}")
                stats["failed"] += len(batch)

    # ── Web Push (un par un) ─────────────────────────────────────────────────
    for sub in webpush_subscriptions:
        result = send_web_push(
            endpoint=sub["endpoint"],
            p256dh=sub["p256dh_key"],
            auth=sub["auth_key"],
            title=title,
            body=body,
            data=data,
        )
        if result.get("status") == "ok":
            stats["sent"] += 1
            stats["webpush"] += 1
        else:
            stats["failed"] += 1

    logger.info(
        f"Push sent: {stats['sent']} (expo: {stats['expo']}, web: {stats['webpush']}), failed: {stats['failed']}"
    )
    return stats


def send_announcement_notification(announcement) -> dict:
    """Envoie une notification pour une annonce festival, selon son type."""
    data = {
        "type": announcement.kind,
        "kind": announcement.kind,
        "id": str(announcement.id),
        "url": announcement.push_open_url(),
    }
    body = announcement.body or ""
    return send_push_to_all(
        title=announcement.title,
        body=body[:150] + ("..." if len(body) > 150 else ""),
        data=data,
    )
