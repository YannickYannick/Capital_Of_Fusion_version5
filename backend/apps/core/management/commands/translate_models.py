from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any

from django.core.management.base import BaseCommand
from django.db import transaction
from django.apps import apps

from google import genai

from apps.core.gemini_utils import gemini_error_message


@dataclass(frozen=True)
class TranslationTarget:
    app_label: str
    model_name: str
    fields: tuple[str, ...]


# Liste volontairement "ciblée" : uniquement les modèles / champs où tu affiches du texte.
# On peut ensuite élargir, mais ça suffit pour valider le pipeline.
TRANSLATION_TARGETS: tuple[TranslationTarget, ...] = (
    # core
    TranslationTarget("core", "DanceStyle", ("name", "description")),
    TranslationTarget("core", "Level", ("name", "description")),
    TranslationTarget("core", "DanceProfession", ("name", "description")),
    TranslationTarget(
        "core",
        "SiteConfiguration",
        (
            "site_name",
            "hero_title",
            "hero_subtitle",
            "hero_top_text",
            "hero_descr_1",
            "hero_descr_2",
            "hero_btn_1_text",
            "hero_btn_2_text",
            "hero_footer_text",
            "vision_markdown",
            "history_markdown",
        ),
    ),
    TranslationTarget("core", "MenuItem", ("name",)),
    TranslationTarget("core", "Bulletin", ("title", "content_markdown")),
    # courses
    TranslationTarget("courses", "Course", ("name", "description")),
    TranslationTarget("courses", "Schedule", ("location_name",)),
    TranslationTarget("courses", "TheoryLesson", ("title", "content")),
    # events
    TranslationTarget("events", "Event", ("name", "description", "location_name")),
    TranslationTarget("events", "EventPass", ("name",)),
    # organization
    TranslationTarget(
        "organization",
        "Pole",
        ("name",),
    ),
    TranslationTarget(
        "organization",
        "OrganizationNode",
        ("name", "description", "short_description", "content", "cta_text"),
    ),
    TranslationTarget(
        "organization",
        "OrganizationRole",
        ("name", "description"),
    ),
    TranslationTarget(
        "organization",
        "NodeEvent",
        ("title", "description", "location"),
    ),
    TranslationTarget(
        "organization",
        "TeamMember",
        ("name", "role", "bio"),
    ),
)


class Command(BaseCommand):
    help = "Translate les champs modeltranslation manquants via Gemini Flash."

    def add_arguments(self, parser) -> None:
        parser.add_argument("--target", required=True, choices=["en", "es"], help="Langue cible")
        parser.add_argument("--model", default="", help="Optionnel : app_label.ModelName (ex: courses.Course)")
        parser.add_argument(
            "--fields",
            default="",
            help="Optionnel : liste de champs séparés par virgule (ex: vision_markdown,history_markdown)",
        )
        parser.add_argument("--limit", type=int, default=20, help="Nombre max d'objets à traiter")
        parser.add_argument("--dry-run", action="store_true", help="Ne sauvegarde rien")

    def _gemini_translate(self, *, client: genai.Client, model_name: str, text: str, target_lang: str, context: str) -> str:
        """
        Appel Gemini pour traduire un texte court/moyen.
        """
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
            resp = client.models.generate_content(
                model=model_name,
                contents=prompt,
            )
        except Exception as e:
            msg = str(e)
            raise RuntimeError(
                gemini_error_message(msg, api_key=api_key, model_name=model_name)
            ) from e

        # SDK expose généralement `text`
        return (getattr(resp, "text", None) or str(resp)).strip()

    def handle(self, *args: Any, **options: Any) -> None:
        target: str = options["target"]
        model_filter: str = options["model"].strip()
        fields_filter_raw: str = options.get("fields") or ""
        fields_filter = tuple(
            f.strip() for f in fields_filter_raw.split(",") if f.strip()
        )
        limit: int = options["limit"]
        dry_run: bool = bool(options["dry_run"])

        api_key = os.getenv("GEMINI_API_KEY") or ""
        if not api_key:
            raise RuntimeError("Missing GEMINI_API_KEY environment variable")

        model_name = os.getenv("GEMINI_MODEL_NAME") or "gemini-2.5-flash"
        client = genai.Client(api_key=api_key)

        # Filtre cibles
        targets = TRANSLATION_TARGETS
        if model_filter:
            # ex: courses.Course
            parts = model_filter.split(".")
            if len(parts) != 2:
                raise RuntimeError("Format --model attendu: app_label.ModelName")
            app_label, model_name_filter = parts
            targets = tuple(
                t for t in targets if t.app_label == app_label and t.model_name == model_name_filter
            )

        # Optionnel : restreindre à une sous-liste de champs.
        if fields_filter:
            new_targets: list[TranslationTarget] = []
            for t in targets:
                chosen_fields = tuple(f for f in t.fields if f in fields_filter)
                if chosen_fields:
                    new_targets.append(
                        TranslationTarget(app_label=t.app_label, model_name=t.model_name, fields=chosen_fields)
                    )
            targets = tuple(new_targets)
            if not targets:
                raise RuntimeError(
                    f"Aucun champ ne correspond à --fields pour --model={model_filter or '<vide>'}"
                )

        translated_count = 0

        for t in targets:
            Model = apps.get_model(t.app_label, t.model_name)

            # Construction d'un queryset d'objets où au moins un champ cible n'est pas rempli
            # (on se limite à la base : champs *_<target>).
            # Note : on fait un check "OR" minimal.
            filter_kwargs = {}
            for field in t.fields:
                filter_kwargs[f"{field}_{target}__isnull"] = True
                # On ne peut pas faire un OR simple sans Q ; on traite brut en itérant
                # et en checkant la valeur après coup.
                # (On garde filter_kwargs vide pour éviter des erreurs si besoin d'élargissement)
            # queryset simple, puis filtrage côté python
            qs = Model.objects.all()[:limit]

            for obj in qs:
                # Vérifier si besoin de traduire
                need_any = False
                for field in t.fields:
                    if getattr(obj, f"{field}_{target}", None) in (None, ""):
                        need_any = True
                        break
                if not need_any:
                    continue

                with transaction.atomic():
                    for field in t.fields:
                        current = getattr(obj, f"{field}_{target}", None)
                        if current not in (None, ""):
                            continue

                        source_val = getattr(obj, field, None)
                        if not source_val:
                            continue

                        context = f"{t.app_label}.{t.model_name}.{field}"
                        translated = self._gemini_translate(
                            client=client,
                            api_key=api_key,
                            model_name=model_name,
                            text=str(source_val),
                            target_lang=target,
                            context=context,
                        )
                        setattr(obj, f"{field}_{target}", translated)

                    if not dry_run:
                        obj.save()

                translated_count += 1
                if translated_count >= limit:
                    break

            if translated_count >= limit:
                break

        self.stdout.write(self.style.SUCCESS(f"Done. Updated objects: {translated_count}"))

