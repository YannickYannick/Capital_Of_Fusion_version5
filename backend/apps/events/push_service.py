"""
Service d'envoi de notifications push via Expo Push API.
Documentation: https://docs.expo.dev/push-notifications/sending-notifications/

Usage:
    from apps.events.push_service import send_push_notification, send_push_to_all

    # Envoyer à un token spécifique
    send_push_notification(
        token="ExponentPushToken[xxx]",
        title="Nouveau message",
        body="Contenu de la notification",
    )

    # Envoyer à tous les tokens actifs
    send_push_to_all(
        title="Annonce festival",
        body="Le festival commence bientôt !",
    )
"""
import json
import logging
from typing import Optional

import requests

from .models import PushToken

logger = logging.getLogger(__name__)

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"


def send_push_notification(
    token: str,
    title: str,
    body: str,
    data: Optional[dict] = None,
    sound: str = "default",
    badge: Optional[int] = None,
    channel_id: str = "default",
) -> dict:
    """
    Envoie une notification push à un token Expo.

    Args:
        token: Expo push token (ExponentPushToken[xxx])
        title: Titre de la notification
        body: Corps de la notification
        data: Données additionnelles (optionnel)
        sound: Son de la notification ("default" ou None)
        badge: Nombre à afficher sur l'icône (iOS)
        channel_id: Canal Android ("default")

    Returns:
        Réponse de l'API Expo ({"status": "ok"} ou {"status": "error", ...})
    """
    message = {
        "to": token,
        "title": title,
        "body": body,
        "sound": sound,
        "channelId": channel_id,
    }

    if data:
        message["data"] = data

    if badge is not None:
        message["badge"] = badge

    try:
        response = requests.post(
            EXPO_PUSH_URL,
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            data=json.dumps(message),
            timeout=10,
        )
        result = response.json()

        # Vérifier si le token est invalide
        if isinstance(result.get("data"), list) and result["data"]:
            ticket = result["data"][0]
            if ticket.get("status") == "error":
                # Désactiver le token invalide
                if ticket.get("details", {}).get("error") in (
                    "DeviceNotRegistered",
                    "InvalidCredentials",
                ):
                    PushToken.objects.filter(token=token).update(is_active=False)
                    logger.warning(f"Disabled invalid push token: {token[:30]}...")

        return result

    except requests.RequestException as e:
        logger.error(f"Expo push request failed: {e}")
        return {"status": "error", "message": str(e)}


def send_push_to_all(
    title: str,
    body: str,
    data: Optional[dict] = None,
    platform: Optional[str] = None,
) -> dict:
    """
    Envoie une notification push à tous les tokens actifs.

    Args:
        title: Titre de la notification
        body: Corps de la notification
        data: Données additionnelles (optionnel)
        platform: Filtrer par plateforme ("ios", "android", "web") ou None pour tous

    Returns:
        Statistiques d'envoi {sent: int, failed: int, skipped: int}
    """
    tokens_qs = PushToken.objects.filter(is_active=True)

    if platform:
        tokens_qs = tokens_qs.filter(platform=platform)

    tokens = list(tokens_qs.values_list("token", flat=True))

    if not tokens:
        logger.info("No active push tokens found")
        return {"sent": 0, "failed": 0, "skipped": 0}

    # Expo supporte jusqu'à 100 tokens par requête
    batch_size = 100
    stats = {"sent": 0, "failed": 0, "skipped": 0}

    for i in range(0, len(tokens), batch_size):
        batch = tokens[i : i + batch_size]
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
                headers={
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                data=json.dumps(messages),
                timeout=30,
            )
            result = response.json()

            # Analyser les résultats
            for j, ticket in enumerate(result.get("data", [])):
                if ticket.get("status") == "ok":
                    stats["sent"] += 1
                elif ticket.get("status") == "error":
                    stats["failed"] += 1
                    # Désactiver les tokens invalides
                    if ticket.get("details", {}).get("error") in (
                        "DeviceNotRegistered",
                        "InvalidCredentials",
                    ):
                        token = batch[j]
                        PushToken.objects.filter(token=token).update(is_active=False)

        except requests.RequestException as e:
            logger.error(f"Batch push failed: {e}")
            stats["failed"] += len(batch)

    logger.info(
        f"Push notifications sent: {stats['sent']} success, {stats['failed']} failed"
    )
    return stats


def send_announcement_notification(announcement) -> dict:
    """
    Envoie une notification pour une annonce festival.

    Args:
        announcement: Instance de FestivalAnnouncement

    Returns:
        Statistiques d'envoi
    """
    data = {"type": "announcement", "id": str(announcement.id)}

    if announcement.link_url:
        data["link"] = announcement.link_url

    return send_push_to_all(
        title=announcement.title,
        body=announcement.body[:150] + "..." if len(announcement.body) > 150 else announcement.body,
        data=data,
    )
