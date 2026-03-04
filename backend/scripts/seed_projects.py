"""Script pour injecter des données de test dans l'app projects."""
import django
import os
import sys
import datetime

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local")
django.setup()

from apps.projects.models import ProjectCategory, Project  # noqa: E402

cat1, created = ProjectCategory.objects.get_or_create(
    slug="incubation",
    defaults={"name": "Incubation", "description": "Accompagnement de projets artistiques"},
)
print(f"Catégorie '{cat1.name}' — {'créée' if created else 'existante'} (id={cat1.pk})")

cat2, created = ProjectCategory.objects.get_or_create(
    slug="initiatives",
    defaults={"name": "Initiatives", "description": "Actions collectives dans la danse"},
)
print(f"Catégorie '{cat2.name}' — {'créée' if created else 'existante'} (id={cat2.pk})")

projects_data = [
    {
        "slug": "bachatavibe-studio-paris",
        "defaults": {
            "title": "BachataVibe Studio Paris",
            "category": cat1,
            "summary": "Création d'un studio de danse permanent à Paris avec espaces de répétition, enseignement et événements.",
            "status": "IN_PROGRESS",
            "start_date": datetime.date(2025, 9, 1),
        },
    },
    {
        "slug": "capital-of-fusion-records",
        "defaults": {
            "title": "Capital of Fusion Records",
            "category": cat1,
            "summary": "Label indépendant dédié aux artistes de musique latine et afro.",
            "status": "UPCOMING",
            "start_date": datetime.date(2026, 3, 1),
        },
    },
    {
        "slug": "bachata-dans-les-quartiers",
        "defaults": {
            "title": "Bachata dans les Quartiers",
            "category": cat2,
            "summary": "Programme d'ateliers gratuits de bachata dans les quartiers prioritaires de Paris et Lyon.",
            "status": "IN_PROGRESS",
            "start_date": datetime.date(2025, 1, 1),
        },
    },
    {
        "slug": "social-dancing-summit",
        "defaults": {
            "title": "Social Dancing Summit",
            "category": cat2,
            "summary": "Convention annuelle réunissant les acteurs de la danse sociale.",
            "status": "UPCOMING",
            "start_date": datetime.date(2026, 11, 1),
        },
    },
    {
        "slug": "fusion-lab",
        "defaults": {
            "title": "Fusion Lab — Recherche Chorégraphique",
            "category": cat1,
            "summary": "Résidences artistiques de recherche sur les danses de fusion.",
            "status": "COMPLETED",
            "start_date": datetime.date(2024, 6, 1),
        },
    },
]

for p in projects_data:
    obj, created = Project.objects.get_or_create(slug=p["slug"], defaults=p["defaults"])
    print(f"  Projet '{obj.title}' — {'créé' if created else 'existant'} (id={obj.pk})")

print(f"\nTotal: {Project.objects.count()} projets, {ProjectCategory.objects.count()} catégories")
