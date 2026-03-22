"""
Vues API Core — menu (items racine avec children récursifs), health check.
"""
import os
from django.http import JsonResponse
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.core.management import call_command
from django.apps import apps
from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from google import genai
from .gemini_utils import gemini_error_message
from .models import MenuItem, SiteConfiguration, ExplorePreset, Bulletin, PendingContentEdit
from .serializers import (
    MenuItemSerializer,
    SiteConfigurationSerializer,
    ExplorePresetSerializer,
    BulletinSerializer,
    BulletinAdminSerializer,
    PendingContentEditSerializer,
)
from .permissions import IsStaffOrSuperUser, IsSuperUser, IsSuperUserOrAdminType
from .pending_edits import apply_pending_edit

# Langues alignées sur modeltranslation (vision_markdown_fr / _en / _es).
TRANSLATION_LANGS = frozenset({"fr", "en", "es"})


def _request_translation_lang(request):
    lang = (request.GET.get("lang") or "fr").strip().lower()
    return lang if lang in TRANSLATION_LANGS else "fr"


def _apply_siteconfig_translated_payload(config: SiteConfiguration, payload: dict, lang: str) -> None:
    """
    Écrit sur les colonnes réelles modeltranslation (ex. vision_markdown_fr).
    setattr(config, "vision_markdown", ...) ne persiste pas de façon fiable sans
    activation de langue cohérente avec modeltranslation.
    """
    for base in ("vision_markdown", "history_markdown"):
        if base in payload:
            setattr(config, f"{base}_{lang}", payload[base])
    config.save()


def _user_is_admin_direct(user) -> bool:
    """Superuser ou compte ADMIN (même si is_superuser désynchronisé en base)."""
    if not user or not user.is_authenticated:
        return False
    if getattr(user, "is_superuser", False):
        return True
    return getattr(user, "user_type", None) == "ADMIN"


class SiteConfigurationAPIView(APIView):
    """GET /api/config/ — lecture publique de la configuration."""
    def get(self, request):
        config = SiteConfiguration.objects.first()
        if not config:
            config = SiteConfiguration.objects.create()
        serializer = SiteConfigurationSerializer(config, context={'request': request})
        return Response(serializer.data)


def health_check(request):
    """
    GET /api/health/ — ne touche pas à la DB. Pour vérifier que Django répond (diagnostic déploiement).
    """
    return JsonResponse({"status": "ok"})


class MenuItemListAPIView(APIView):
    """
    GET /api/menu/items/
    Liste des MenuItem racine (parent=None), avec enfants récursifs. Ordre par order.
    """

    def get(self, request):
        items = MenuItem.objects.filter(parent=None, is_active=True).order_by("order")
        serializer = MenuItemSerializer(items, many=True)
        return Response(serializer.data)


class BulletinListAPIView(APIView):
    """
    GET /api/identite/bulletins/
    Liste des bulletins publiés, ordre chronologique inverse (plus récent en premier).
    """
    def get(self, request):
        qs = Bulletin.objects.filter(is_published=True).order_by("-published_at", "-created_at")
        serializer = BulletinSerializer(qs, many=True)
        return Response(serializer.data)


class BulletinDetailAPIView(APIView):
    """
    GET /api/identite/bulletins/<slug>/
    Détail d'un bulletin par slug (publiés uniquement).
    """
    def get(self, request, slug):
        bulletin = get_object_or_404(Bulletin, slug=slug, is_published=True)
        serializer = BulletinSerializer(bulletin)
        return Response(serializer.data)


def _siteconfig_identity_translations_payload(config: SiteConfiguration) -> dict:
    """Valeurs EN/ES stockées (modeltranslation) pour la modale de traduction Identité COF."""
    out = {}
    for base in ("vision_markdown", "history_markdown"):
        out[base] = {
            "en": (getattr(config, f"{base}_en", None) or "") or "",
            "es": (getattr(config, f"{base}_es", None) or "") or "",
        }
    return out


class SiteConfigurationAdminAPIView(APIView):
    """GET /api/admin/config/ — traductions identité EN/ES. PATCH — vision_markdown, history_markdown (lang via ?lang=)."""
    permission_classes = [IsStaffOrSuperUser]

    def get(self, request):
        """Expose les textes EN/ES déjà enregistrés pour Notre vision / Notre histoire (rappel avant traduction)."""
        config = SiteConfiguration.objects.first()
        if not config:
            config = SiteConfiguration.objects.create()
        return Response({"identity_translations": _siteconfig_identity_translations_payload(config)})

    def patch(self, request):
        lang = _request_translation_lang(request)
        config = SiteConfiguration.objects.first()
        if not config:
            config = SiteConfiguration.objects.create()
        payload = {}
        if request.data.get("vision_markdown") is not None:
            payload["vision_markdown"] = request.data["vision_markdown"]
        if request.data.get("history_markdown") is not None:
            payload["history_markdown"] = request.data["history_markdown"]
        if not payload:
            serializer = SiteConfigurationSerializer(config, context={'request': request})
            return Response(serializer.data)
        if _user_is_admin_direct(request.user):
            _apply_siteconfig_translated_payload(config, payload, lang)
            serializer = SiteConfigurationSerializer(config, context={'request': request})
            return Response(serializer.data)
        pending_payload = {**payload, "_lang": lang}
        PendingContentEdit.objects.create(
            content_type=PendingContentEdit.ContentType.SITECONFIG,
            object_id="",
            payload=pending_payload,
            requested_by=request.user,
        )
        return Response(
            {"message": "Modification enregistrée. Elle sera visible après approbation par un administrateur.", "pending": True},
            status=status.HTTP_202_ACCEPTED,
        )


class BulletinAdminListCreateAPIView(APIView):
    """
    GET /api/admin/identite/bulletins/ — liste tous les bulletins (dont brouillons) pour staff.
    POST /api/admin/identite/bulletins/ — création (staff/superuser).
    """
    permission_classes = [IsStaffOrSuperUser]

    def get(self, request):
        qs = Bulletin.objects.all().order_by("-published_at", "-created_at")
        serializer = BulletinAdminSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = BulletinAdminSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class BulletinAdminDetailAPIView(APIView):
    """
    GET/PATCH /api/admin/identite/bulletins/<slug>/ — détail et mise à jour (staff/superuser).
    Retourne aussi les bulletins non publiés.
    """
    permission_classes = [IsStaffOrSuperUser]

    def get(self, request, slug):
        bulletin = get_object_or_404(Bulletin, slug=slug)
        serializer = BulletinAdminSerializer(bulletin)
        return Response(serializer.data)

    def patch(self, request, slug):
        bulletin = get_object_or_404(Bulletin, slug=slug)
        lang = _request_translation_lang(request)
        if _user_is_admin_direct(request.user):
            data = request.data
            if "title" in data:
                setattr(bulletin, f"title_{lang}", data["title"])
            if "content_markdown" in data:
                setattr(bulletin, f"content_markdown_{lang}", data["content_markdown"])
            if "slug" in data:
                bulletin.slug = data["slug"]
            if "published_at" in data:
                bulletin.published_at = data["published_at"]
            if "is_published" in data:
                bulletin.is_published = data["is_published"]
            bulletin.save()
            serializer = BulletinAdminSerializer(bulletin, context={"request": request})
            return Response(serializer.data)
        serializer = BulletinAdminSerializer(bulletin, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        payload = dict(serializer.validated_data)
        payload["_lang"] = lang
        PendingContentEdit.objects.create(
            content_type=PendingContentEdit.ContentType.BULLETIN,
            object_id=slug,
            payload=payload,
            requested_by=request.user,
        )
        return Response(
            {"message": "Modification enregistrée. Elle sera visible après approbation par un administrateur.", "pending": True},
            status=status.HTTP_202_ACCEPTED,
        )


def seed_database(request):
    """
    POST /api/seed/?key=SECRET_KEY
    Endpoint sécurisé pour initialiser la base de données (noeuds + superuser).
    """
    import json
    secret = request.GET.get("key", "")
    expected = getattr(settings, 'SEED_SECRET_KEY', 'change-me-in-prod')
    if secret != expected:
        return JsonResponse({"error": "Unauthorized"}, status=403)

    results = {}

    # 1. Seed organization nodes
    try:
        from django.core.management import call_command
        from io import StringIO
        out = StringIO()
        call_command('load_initial_data', stdout=out)
        call_command('load_demo_data', stdout=out)
        results['seed_data'] = out.getvalue().strip()
    except Exception as e:
        results['seed_data'] = f"Error: {str(e)}"

    # 2. Create admin superuser
    try:
        call_command('create_admin', stdout=out)
        results['create_admin'] = out.getvalue().strip()
    except Exception as e:
        results['create_admin'] = f"Error: {str(e)}"

    return JsonResponse({"status": "done", "results": results})


class ExplorePresetViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les presets Explore 3D.
    """
    queryset = ExplorePreset.objects.all().order_by("-created_at")
    serializer_class = ExplorePresetSerializer
    permission_classes = []


class PendingContentEditListAPIView(APIView):
    """
    GET /api/admin/pending-edits/ — liste des modifications en attente.
    Admin : toutes les demandes PENDING. Staff : uniquement les siennes.
    """
    permission_classes = [IsStaffOrSuperUser]

    def get(self, request):
        qs = PendingContentEdit.objects.filter(status=PendingContentEdit.Status.PENDING)
        if not getattr(request.user, "is_superuser", False):
            qs = qs.filter(requested_by=request.user)
        qs = qs.select_related("requested_by", "reviewed_by").order_by("-created_at")
        serializer = PendingContentEditSerializer(qs, many=True)
        return Response(serializer.data)


class PendingContentEditDetailAPIView(APIView):
    """
    PATCH /api/admin/pending-edits/<id>/ — approuver ou refuser (admin uniquement).
    Body: { "action": "approve" | "reject" }
    """
    permission_classes = [IsSuperUser]

    def patch(self, request, pk):
        edit = get_object_or_404(PendingContentEdit, pk=pk, status=PendingContentEdit.Status.PENDING)
        action = (request.data.get("action") or "").strip().lower()
        if action == "approve":
            try:
                apply_pending_edit(edit)
            except Exception as e:
                return Response(
                    {"error": f"Erreur lors de l'application: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            edit.status = PendingContentEdit.Status.APPROVED
        elif action == "reject":
            edit.status = PendingContentEdit.Status.REJECTED
        else:
            return Response(
                {"error": "action doit être 'approve' ou 'reject'"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        edit.reviewed_by = request.user
        edit.reviewed_at = timezone.now()
        edit.save(update_fields=["status", "reviewed_by", "reviewed_at", "updated_at"])
        serializer = PendingContentEditSerializer(edit)
        return Response(serializer.data)


class AdminTranslateAPIView(APIView):
    """
    POST /api/admin/translate/

    Permet de déclencher la commande management `translate_models` pour les traductions EN/ES.
    Ce endpoint est prévu pour l'UX "bouton admin → popup → lancer traduction".
    """

    permission_classes = [IsSuperUser]

    def post(self, request):
        targets = request.data.get("targets") or []
        if isinstance(targets, str):
            targets = [targets]

        targets = [str(t).lower().strip() for t in targets]
        allowed = {"en", "es"}
        if not targets or any(t not in allowed for t in targets):
            return Response(
                {"error": "targets doit contenir uniquement 'en' et/ou 'es'"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Limite prudente : translate_models peut consommer plusieurs requêtes Gemini par objet (un champ manquant = une requête)
        limit = request.data.get("limit", 1)
        try:
            limit = int(limit)
        except (TypeError, ValueError):
            return Response({"error": "limit doit être un entier"}, status=status.HTTP_400_BAD_REQUEST)

        dry_run = bool(request.data.get("dry_run", False))

        model_filter = str(request.data.get("model") or "").strip()
        fields_filter = request.data.get("fields") or []
        if isinstance(fields_filter, str):
            fields_filter = [f.strip() for f in fields_filter.split(",") if f.strip()]
        fields_filter = [str(f).strip() for f in fields_filter if str(f).strip()]

        results = {}
        # Important: call_command peut être long, mais c'est un endpoint admin.
        from io import StringIO

        for lang in targets:
            out = StringIO()
            try:
                call_command(
                    "translate_models",
                    target=lang,
                    limit=limit,
                    dry_run=dry_run,
                    model=model_filter,
                    fields=",".join(fields_filter) if fields_filter else "",
                    stdout=out,
                )
                results[lang] = {"status": "ok", "output": out.getvalue().strip()}
            except Exception as e:
                results[lang] = {"status": "error", "error": str(e)}

        return Response({"results": results}, status=status.HTTP_200_OK)


class _TranslationAdminMixin:
    ALLOWED_TARGETS = {"en", "es"}
    # Liste blanche explicite (extensible) des champs traduisibles via popup admin.
    ALLOWED_MODEL_FIELDS = {
        "core.SiteConfiguration": {"vision_markdown", "history_markdown"},
        "core.Bulletin": {"title", "content_markdown"},
        "users.User": {"bio"},
    }

    def _parse_target(self, request):
        target = str(request.data.get("target") or "").strip().lower()
        if target not in self.ALLOWED_TARGETS:
            raise ValueError("target doit être 'en' ou 'es'")
        return target

    def _parse_model_field(self, request):
        model_name = str(request.data.get("model") or "").strip()
        field_name = str(request.data.get("field") or "").strip()
        if model_name not in self.ALLOWED_MODEL_FIELDS:
            raise ValueError("model non autorisé")
        if field_name not in self.ALLOWED_MODEL_FIELDS[model_name]:
            raise ValueError("field non autorisé pour ce model")
        return model_name, field_name

    def _resolve_object(self, *, model_name: str, request):
        import uuid as uuid_mod

        app_label, model_label = model_name.split(".", 1)
        Model = apps.get_model(app_label, model_label)

        object_id = request.data.get("object_id")
        if model_name == "core.SiteConfiguration":
            if object_id in (None, "", 0, "0"):
                obj = Model.objects.first()
                if not obj:
                    obj = Model.objects.create()
                return obj
        if object_id in (None, ""):
            raise ValueError("object_id est requis pour ce model")
        if model_name == "core.Bulletin":
            try:
                uid = uuid_mod.UUID(str(object_id).strip())
            except (ValueError, TypeError, AttributeError):
                raise ValueError("object_id doit être l'UUID du bulletin") from None
            return get_object_or_404(Model, pk=uid)
        try:
            object_id = int(object_id)
        except (TypeError, ValueError):
            raise ValueError("object_id doit être un entier")
        return get_object_or_404(Model, pk=object_id)

    def _gemini_translate(self, *, text: str, target_lang: str, context: str) -> str:
        api_key = os.getenv("GEMINI_API_KEY", "")
        if not api_key:
            raise RuntimeError("Missing GEMINI_API_KEY environment variable")
        model_name = os.getenv("GEMINI_MODEL_NAME", "gemini-2.5-flash")
        client = genai.Client(api_key=api_key)

        prompt = (
            f"Tu es un traducteur professionnel.\n"
            f"Contexte du champ : {context}\n"
            f"Langue cible : {target_lang}\n\n"
            f"Règles :\n"
            f"- Traduire uniquement.\n"
            f"- Conserver la mise en forme (Markdown si présent) et les retours à la ligne.\n"
            f"- Ne pas altérer les slugs / codes / URLs.\n\n"
            f"Texte à traduire :\n{text}"
        )
        try:
            resp = client.models.generate_content(model=model_name, contents=prompt)
        except Exception as e:
            msg = str(e)
            raise RuntimeError(
                gemini_error_message(msg, api_key=api_key, model_name=model_name)
            ) from e
        return (getattr(resp, "text", None) or str(resp)).strip()


class AdminTranslatePreviewAPIView(_TranslationAdminMixin, APIView):
    """
    POST /api/admin/translate/preview/
    Body: { model, object_id?, field, target, source_text? }
    source_text optionnel : texte FR du textarea (même non sauvegardé).
    Retour: source + valeur cible actuelle + suggestion Gemini.
    """

    permission_classes = [IsStaffOrSuperUser]

    def post(self, request):
        try:
            target = self._parse_target(request)
            model_name, field_name = self._parse_model_field(request)
            obj = self._resolve_object(model_name=model_name, request=request)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        override = request.data.get("source_text")
        if override is not None and str(override).strip() != "":
            source_val = str(override)
        else:
            src_fr = getattr(obj, f"{field_name}_fr", None)
            source_val = (src_fr if src_fr is not None else "") or getattr(obj, field_name, "") or ""
        if not source_val:
            return Response(
                {"error": "Le champ source FR est vide, rien à traduire."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        current_target = getattr(obj, f"{field_name}_{target}", "") or ""
        context = f"{model_name}.{field_name}"
        try:
            suggestion = self._gemini_translate(
                text=str(source_val),
                target_lang=target,
                context=context,
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {
                "model": model_name,
                "object_id": obj.pk,
                "field": field_name,
                "target": target,
                "source": str(source_val),
                "current_target": str(current_target),
                "suggestion": suggestion,
            },
            status=status.HTTP_200_OK,
        )


class AdminTranslateApplyAPIView(_TranslationAdminMixin, APIView):
    """
    POST /api/admin/translate/apply/
    Body: { model, object_id?, field, target, value }
    Écrit explicitement la traduction choisie par l'admin.
    """

    permission_classes = [IsSuperUserOrAdminType]

    def post(self, request):
        try:
            target = self._parse_target(request)
            model_name, field_name = self._parse_model_field(request)
            obj = self._resolve_object(model_name=model_name, request=request)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        value = request.data.get("value")
        if value is None:
            return Response({"error": "value est requis"}, status=status.HTTP_400_BAD_REQUEST)
        value = str(value)

        setattr(obj, f"{field_name}_{target}", value)
        uf = [f"{field_name}_{target}"]
        if hasattr(obj, "updated_at"):
            uf.append("updated_at")
        obj.save(update_fields=uf)

        return Response(
            {
                "model": model_name,
                "object_id": str(obj.pk),
                "field": field_name,
                "target": target,
                "saved": True,
            },
            status=status.HTTP_200_OK,
        )


class AdminTranslateSubmitPendingAPIView(_TranslationAdminMixin, APIView):
    """
    POST /api/admin/translate/submit-pending/
    Staff uniquement : enregistre une proposition de traductions EN/ES en attente de validation admin.

    Body: {
      "model": "core.SiteConfiguration",
      "translation_proposal": {
        "en": { "vision_markdown": "..." },
        "es": { "history_markdown": "..." }
      }
    }
    """

    permission_classes = [IsStaffOrSuperUser]

    def post(self, request):
        if _user_is_admin_direct(request.user):
            return Response(
                {
                    "error": "Les administrateurs enregistrent les traductions via « Appliquer » (pas de file d'attente).",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        model_name = str(request.data.get("model") or "").strip()
        if model_name not in self.ALLOWED_MODEL_FIELDS:
            return Response({"error": "model non autorisé"}, status=status.HTTP_400_BAD_REQUEST)

        proposal = request.data.get("translation_proposal")
        if not isinstance(proposal, dict):
            return Response(
                {"error": "translation_proposal doit être un objet { en?: {...}, es?: {...} }"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        allowed_fields = self.ALLOWED_MODEL_FIELDS[model_name]
        allowed_csv = ", ".join(sorted(allowed_fields))
        cleaned: dict = {}
        for lang in ("en", "es"):
            block = proposal.get(lang)
            if not block:
                continue
            if not isinstance(block, dict):
                return Response(
                    {"error": f"translation_proposal.{lang} doit être un objet"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            inner = {}
            for k, v in block.items():
                if k not in allowed_fields:
                    continue
                inner[k] = str(v) if v is not None else ""
            if inner:
                cleaned[lang] = inner

        if not cleaned:
            return Response(
                {"error": f"Aucune traduction valide (champs autorisés pour ce modèle : {allowed_csv})."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        object_id_str = ""
        ct = PendingContentEdit.ContentType.SITECONFIG
        if model_name == "core.Bulletin":
            oid = request.data.get("object_id")
            if oid in (None, ""):
                return Response(
                    {"error": "object_id (UUID du bulletin) est requis pour core.Bulletin"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            try:
                bulletin = Bulletin.objects.get(pk=oid)
            except (Bulletin.DoesNotExist, ValueError, TypeError):
                return Response({"error": "Bulletin introuvable pour cet object_id"}, status=status.HTTP_400_BAD_REQUEST)
            object_id_str = bulletin.slug
            ct = PendingContentEdit.ContentType.BULLETIN

        elif model_name == "users.User":
            from django.contrib.auth import get_user_model

            User = get_user_model()
            oid = request.data.get("object_id")
            if oid in (None, ""):
                return Response(
                    {"error": "object_id (identifiant utilisateur) est requis pour users.User"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            try:
                u = User.objects.get(pk=int(oid))
            except (User.DoesNotExist, ValueError, TypeError):
                return Response({"error": "Utilisateur introuvable pour cet object_id"}, status=status.HTTP_400_BAD_REQUEST)
            object_id_str = str(u.pk)
            ct = PendingContentEdit.ContentType.USER_ARTIST_BIO

        PendingContentEdit.objects.create(
            content_type=ct,
            object_id=object_id_str,
            payload={
                "kind": "translation",
                "translation_proposal": cleaned,
            },
            requested_by=request.user,
        )
        return Response({"ok": True, "pending": True}, status=status.HTTP_201_CREATED)
