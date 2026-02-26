"""
Commande : python manage.py load_organization_nodes

Peuple la table OrganizationNode avec la structure hiérarchique complète :
Capital of Fusion France
 ├── Bachata Vibe
 │   ├── Bachata Vibe Experience ⭐
 │   ├── Bachata Vibe Paris Hebdo ⭐
 │   ├── Dominican Vibe ⭐
 │   ├── Paris Bachata Festival
 │   │   ├── Jack n' Jill Vibe
 │   │   ├── Street Battle
 │   │   ├── Social World Cup
 │   │   └── Experience Palmeraie
 │   └── Bachata Vibe Lyon ⭐
 ├── Kompa Vibe
 │   └── Kompa Vibe Paris ⭐
 └── Amapiano Vibe
     └── Amapiano Vibe Paris ⭐

Utilise get_or_create sur le slug (idempotent).
"""
from django.core.management.base import BaseCommand
from apps.organization.models import OrganizationNode

# ─────────────────────────────────────────────────────────────────────────────
#  Données hiérarchiques
#  Les nœuds sont ordonnés : les parents doivent apparaître AVANT leurs enfants.
# ─────────────────────────────────────────────────────────────────────────────
NODES_DATA = [

    # ══════════════════════════════════════════
    #  Racine
    # ══════════════════════════════════════════
    {
        "slug": "capital-of-fusion",
        "name": "Capital of Fusion France",
        "type": "ROOT",
        "parent_slug": None,
        "short_description": "Organisation nationale de danse latine — Bachata, Kompa, Amapiano.",
        "description": (
            "Capital of Fusion France est l'organisation nationale qui fédère les écoles, "
            "événements et artistes autour de la danse latine. Elle regroupe plusieurs pôles "
            "actifs à Paris, Lyon et en régions."
        ),
        "cta_text": "Découvrir",
        "cta_url": "/explore/",
        "video_url": "",
        "planet_color": "#a855f7",
        "planet_scale": 1.4,
        "orbit_radius": 0.0,
        "orbit_phase": 0.0,
        "is_visible_3d": True,
    },

    # ══════════════════════════════════════════
    #  Branches principales (niveau 1)
    # ══════════════════════════════════════════
    {
        "slug": "bachata-vibe",
        "name": "Bachata Vibe",
        "type": "BRANCH",
        "parent_slug": "capital-of-fusion",
        "short_description": "Pôle Bachata — cours, soirées et festivals.",
        "description": (
            "Bachata Vibe regroupe toutes les activités liées à la bachata : "
            "cours hebdomadaires, soirées dansantes, stages et le grand Paris Bachata Festival."
        ),
        "cta_text": "Explorer Bachata Vibe",
        "cta_url": "/explore/",
        "video_url": "",
        "planet_color": "#ec4899",
        "planet_scale": 0.9,
        "orbit_radius": 4.0,
        "orbit_phase": 0.0,
        "is_visible_3d": True,
    },
    {
        "slug": "kompa-vibe",
        "name": "Kompa Vibe",
        "type": "BRANCH",
        "parent_slug": "capital-of-fusion",
        "short_description": "Pôle Kompa — cours et soirées.",
        "description": (
            "Kompa Vibe propose des cours et soirées Kompa Direkta dans une ambiance "
            "festive et authentique, en s'appuyant sur les racines haïtiennes de cette danse."
        ),
        "cta_text": "Explorer Kompa Vibe",
        "cta_url": "/explore/",
        "video_url": "",
        "planet_color": "#f59e0b",
        "planet_scale": 0.8,
        "orbit_radius": 9.0,
        "orbit_phase": 2.1,
        "is_visible_3d": True,
    },
    {
        "slug": "amapiano-vibe",
        "name": "Amapiano Vibe",
        "type": "BRANCH",
        "parent_slug": "capital-of-fusion",
        "short_description": "Pôle Amapiano — cours et soirées.",
        "description": (
            "Amapiano Vibe introduit la danse Amapiano en France avec des cours accessibles "
            "et des soirées enflammées, portant l'énergie de ce style venu d'Afrique du Sud."
        ),
        "cta_text": "Explorer Amapiano Vibe",
        "cta_url": "/explore/",
        "video_url": "",
        "planet_color": "#10b981",
        "planet_scale": 0.8,
        "orbit_radius": 14.0,
        "orbit_phase": 4.2,
        "is_visible_3d": True,
    },

    # ══════════════════════════════════════════
    #  Bachata Vibe — enfants (niveau 2)
    # ══════════════════════════════════════════
    {
        "slug": "bachata-vibe-experience",
        "name": "Bachata Vibe Experience",
        "type": "BRANCH",
        "parent_slug": "bachata-vibe",
        "short_description": "La soirée phare — danse, musique et partage.",
        "description": (
            "La Bachata Vibe Experience est la soirée emblématique de l'association. "
            "Une nuit dédiée à la danse bachata dans une ambiance chaleureuse et festive. "
            "Cours d'initiation, démonstrations d'artistes et social dancing jusqu'au bout de la nuit."
        ),
        "content": (
            '{"date_creation":"2021","lieu":"Paris","frequence":"Mensuelle",'
            '"niveau":"Tous niveaux","organisateur":"Bachata Vibe"}'
        ),
        "cta_text": "S'inscrire",
        "cta_url": "/evenements/",
        "video_url": "",
        "planet_color": "#f43f5e",
        "planet_scale": 0.6,
        "orbit_radius": 5.5,
        "orbit_phase": 0.5,
        "is_visible_3d": True,
    },
    {
        "slug": "bachata-vibe-paris-hebdo",
        "name": "Bachata Vibe Paris Hebdo",
        "type": "BRANCH",
        "parent_slug": "bachata-vibe",
        "short_description": "Cours hebdomadaires à Paris.",
        "description": (
            "Bachata Vibe Paris Hebdo propose des cours de bachata tous les jeudis soirs "
            "pour tous les niveaux. Un rendez-vous régulier pour progresser dans une ambiance conviviale."
        ),
        "content": (
            '{"date_creation":"2020","lieu":"Paris 11e","frequence":"Hebdomadaire (Jeudi)",'
            '"niveau":"Débutant à Intermédiaire","organisateur":"Bachata Vibe"}'
        ),
        "cta_text": "S'inscrire",
        "cta_url": "/cours/",
        "video_url": "",
        "planet_color": "#e879f9",
        "planet_scale": 0.55,
        "orbit_radius": 6.5,
        "orbit_phase": 1.2,
        "is_visible_3d": True,
    },
    {
        "slug": "dominican-vibe",
        "name": "Dominican Vibe",
        "type": "BRANCH",
        "parent_slug": "bachata-vibe",
        "short_description": "Bachata dominicaine — style authentique.",
        "description": (
            "Dominican Vibe met à l'honneur la bachata dominicaine dans son style originel. "
            "Des cours et soirées spécialement dédiés aux passionnés de la bachata traditionnelle, "
            "avec un accent sur la musicalité et l'authenticité."
        ),
        "content": (
            '{"date_creation":"2022","lieu":"Paris","frequence":"Bimestrielle",'
            '"niveau":"Intermédiaire à Avancé","organisateur":"Bachata Vibe"}'
        ),
        "cta_text": "En savoir plus",
        "cta_url": "/explore/",
        "video_url": "",
        "planet_color": "#fb923c",
        "planet_scale": 0.55,
        "orbit_radius": 7.5,
        "orbit_phase": 2.0,
        "is_visible_3d": True,
    },
    {
        "slug": "paris-bachata-festival",
        "name": "Paris Bachata Festival",
        "type": "BRANCH",
        "parent_slug": "bachata-vibe",
        "short_description": "Le grand festival annuel de bachata.",
        "description": (
            "Le Paris Bachata Festival est le temps fort de l'année, rassemblant danseurs, "
            "artistes et passionnés autour de la bachata. Au programme : compétitions internationales, "
            "workshops avec des artistes de renom et nuits de social dancing."
        ),
        "cta_text": "Voir le programme",
        "cta_url": "/evenements/festivals/",
        "video_url": "",
        "planet_color": "#facc15",
        "planet_scale": 0.7,
        "orbit_radius": 8.5,
        "orbit_phase": 2.8,
        "is_visible_3d": True,
    },
    {
        "slug": "bachata-vibe-lyon",
        "name": "Bachata Vibe Lyon",
        "type": "BRANCH",
        "parent_slug": "bachata-vibe",
        "short_description": "Pôle Lyon — cours et soirées bachata.",
        "description": (
            "Bachata Vibe Lyon anime la scène bachata lyonnaise avec des cours réguliers "
            "et des soirées dansantes. Un pôle régional dynamique pour apprendre et partager la bachata."
        ),
        "content": (
            '{"date_creation":"2022","lieu":"Lyon","frequence":"Hebdomadaire",'
            '"niveau":"Tous niveaux","organisateur":"Bachata Vibe"}'
        ),
        "cta_text": "Voir les cours",
        "cta_url": "/cours/",
        "video_url": "",
        "planet_color": "#06b6d4",
        "planet_scale": 0.55,
        "orbit_radius": 10.0,
        "orbit_phase": 3.7,
        "is_visible_3d": True,
    },

    # ══════════════════════════════════════════
    #  Paris Bachata Festival — sous-événements (niveau 3)
    # ══════════════════════════════════════════
    {
        "slug": "jack-n-jill-vibe",
        "name": "Jack n' Jill Vibe",
        "type": "BRANCH",
        "parent_slug": "paris-bachata-festival",
        "short_description": "Compétition Jack & Jill de bachata.",
        "description": (
            "La Jack n' Jill Vibe est la compétition phare du festival. "
            "Les couples formés aléatoirement montrent leur connexion et musicalité sur la piste. "
            "Une épreuve qui valorise l'improvisation et l'écoute."
        ),
        "cta_text": "S'inscrire",
        "cta_url": "/evenements/festivals/",
        "video_url": "",
        "planet_color": "#c084fc",
        "planet_scale": 0.45,
        "orbit_radius": 11.5,
        "orbit_phase": 0.2,
        "is_visible_3d": True,
    },
    {
        "slug": "street-battle",
        "name": "Street Battle",
        "type": "BRANCH",
        "parent_slug": "paris-bachata-festival",
        "short_description": "Battle de danse en plein air.",
        "description": (
            "Le Street Battle est la compétition de danse en extérieur du festival. "
            "Styles urbains et bachata se mêlent dans une ambiance électrique, "
            "sous les yeux du public et d'un jury d'exception."
        ),
        "cta_text": "Participer",
        "cta_url": "/evenements/festivals/",
        "video_url": "",
        "planet_color": "#818cf8",
        "planet_scale": 0.45,
        "orbit_radius": 12.5,
        "orbit_phase": 1.5,
        "is_visible_3d": True,
    },
    {
        "slug": "social-world-cup",
        "name": "Social World Cup",
        "type": "BRANCH",
        "parent_slug": "paris-bachata-festival",
        "short_description": "Compétition internationale de social dancing.",
        "description": (
            "La Social World Cup est une compétition internationale de social dancing. "
            "Elle célèbre la connexion authentique entre partenaires et la créativité "
            "sur la piste, avec des candidats du monde entier."
        ),
        "cta_text": "En savoir plus",
        "cta_url": "/evenements/festivals/",
        "video_url": "",
        "planet_color": "#34d399",
        "planet_scale": 0.45,
        "orbit_radius": 13.5,
        "orbit_phase": 2.8,
        "is_visible_3d": True,
    },
    {
        "slug": "experience-palmeraie",
        "name": "Experience Palmeraie",
        "type": "BRANCH",
        "parent_slug": "paris-bachata-festival",
        "short_description": "Soirée exclusive dans un cadre exceptionnel.",
        "description": (
            "L'Experience Palmeraie est la soirée VIP du festival. "
            "Dans un lieu d'exception, la danse rencontre l'élégance pour une nuit "
            "inoubliable mêlant performances artistiques et social dancing de prestige."
        ),
        "cta_text": "Réserver",
        "cta_url": "/evenements/festivals/",
        "video_url": "",
        "planet_color": "#fbbf24",
        "planet_scale": 0.45,
        "orbit_radius": 15.0,
        "orbit_phase": 4.0,
        "is_visible_3d": True,
    },

    # ══════════════════════════════════════════
    #  Kompa Vibe — enfants (niveau 2)
    # ══════════════════════════════════════════
    {
        "slug": "kompa-vibe-paris",
        "name": "Kompa Vibe Paris",
        "type": "BRANCH",
        "parent_slug": "kompa-vibe",
        "short_description": "Cours et soirées Kompa à Paris.",
        "description": (
            "Kompa Vibe Paris propose des cours de Kompa Direkta et des soirées dansantes "
            "dans la capitale. Une invitation à découvrir ou approfondir cette danse haïtienne "
            "dans une atmosphère chaleureuse."
        ),
        "content": (
            '{"date_creation":"2023","lieu":"Paris","frequence":"Hebdomadaire",'
            '"niveau":"Tous niveaux","organisateur":"Kompa Vibe"}'
        ),
        "cta_text": "S'inscrire",
        "cta_url": "/cours/",
        "video_url": "",
        "planet_color": "#f97316",
        "planet_scale": 0.55,
        "orbit_radius": 16.5,
        "orbit_phase": 1.0,
        "is_visible_3d": True,
    },

    # ══════════════════════════════════════════
    #  Amapiano Vibe — enfants (niveau 2)
    # ══════════════════════════════════════════
    {
        "slug": "amapiano-vibe-paris",
        "name": "Amapiano Vibe Paris",
        "type": "BRANCH",
        "parent_slug": "amapiano-vibe",
        "short_description": "Cours et soirées Amapiano à Paris.",
        "description": (
            "Amapiano Vibe Paris est pionnière de la danse Amapiano en France. "
            "Des cours hebdomadaires et des soirées pour découvrir ce style venu d'Afrique du Sud, "
            "mêlant house, jazz et rythmes afro."
        ),
        "content": (
            '{"date_creation":"2024","lieu":"Paris","frequence":"Hebdomadaire",'
            '"niveau":"Tous niveaux","organisateur":"Amapiano Vibe"}'
        ),
        "cta_text": "S'inscrire",
        "cta_url": "/cours/",
        "video_url": "",
        "planet_color": "#4ade80",
        "planet_scale": 0.55,
        "orbit_radius": 18.0,
        "orbit_phase": 3.5,
        "is_visible_3d": True,
    },
]


class Command(BaseCommand):
    help = "Peuple la table OrganizationNode avec la structure hiérarchique complète."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Supprime tous les nœuds existants avant de recréer (ATTENTION : irréversible).",
        )

    def handle(self, *args, **options):
        if options.get("reset"):
            count = OrganizationNode.objects.count()
            OrganizationNode.objects.all().delete()
            self.stdout.write(self.style.WARNING(f"  {count} nœuds supprimés."))

        # Index slug → objet pour résoudre les FK parent
        created_nodes: dict[str, OrganizationNode] = {}

        created = updated = 0
        for data in NODES_DATA:
            parent_slug = data.pop("parent_slug", None)
            parent = created_nodes.get(parent_slug) if parent_slug else None

            # Si nœud existant avec ce slug, on le met à jour
            node = OrganizationNode.objects.filter(slug=data["slug"]).first()
            if node:
                for field, value in data.items():
                    setattr(node, field, value)
                if parent is not None or parent_slug is None:
                    node.parent = parent
                node.save()
                created_nodes[node.slug] = node
                updated += 1
                self.stdout.write(f"  ✔ MàJ  : {node.name}")
            else:
                node = OrganizationNode.objects.create(**data, parent=parent)
                created_nodes[node.slug] = node
                created += 1
                self.stdout.write(f"  ✚ Créé : {node.name}")

            # Restaurer parent_slug dans le dict (non modifié = pas nécessaire, mais propre)
            data["parent_slug"] = parent_slug

        self.stdout.write(
            self.style.SUCCESS(
                f"\nTerminé — {created} créés, {updated} mis à jour. "
                f"Total : {OrganizationNode.objects.count()} nœuds."
            )
        )
