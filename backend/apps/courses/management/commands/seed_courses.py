"""Management command seed_courses — crée Style, Level, Cours et Leçons théorie."""
from django.core.management.base import BaseCommand
from apps.core.models import DanceStyle, Level
from apps.courses.models import Course, Schedule, TheoryLesson
from apps.organization.models import OrganizationNode


STYLES = [
    {"name": "Bachata Sensual", "slug": "bachata-sensual", "icon": "💃", "description": "Style moderne et fluide, influencé par le contemporain."},
    {"name": "Bachata Moderna", "slug": "bachata-moderna", "icon": "🎶", "description": "Fusion entre traditionnelle et sensuelle."},
    {"name": "Bachata Dominicana", "slug": "bachata-dominicana", "icon": "🌴", "description": "Style original des Caraïbes, rythmique et festif."},
    {"name": "Urban Kiz", "slug": "urban-kiz", "icon": "🏙️", "description": "Dérivé du Kizomba, fusion urbaine parisienne."},
]

LEVELS = [
    {"name": "Débutant", "slug": "debutant", "order": 1, "color": "#22c55e"},
    {"name": "Intermédiaire", "slug": "intermediaire", "order": 2, "color": "#f59e0b"},
    {"name": "Avancé", "slug": "avance", "order": 3, "color": "#ef4444"},
    {"name": "Professionnel", "slug": "professionnel", "order": 4, "color": "#8b5cf6"},
]

THEORY_LESSONS = [
    {
        "title": "Le clave : le cœur du rythme",
        "slug": "le-clave-le-coeur-du-rythme",
        "category": "rythme",
        "level_slug": "debutant",
        "duration_minutes": 8,
        "content": "## Le clave\n\nLe clave est la structure rythmique fondamentale de la musique latine. Il existe deux formes principales :\n\n- **Clave 3-2** : 3 temps de base, puis 2 temps\n- **Clave 2-3** : 2 temps, puis 3 temps\n\n### Comment l'entendre ?\n\nÉcoute les percussions et cherche le pattern répétitif de 8 temps. Le clave guide toute la structure musicale.",
        "video_url": "",
    },
    {
        "title": "Compter en bachata : les 8 temps",
        "slug": "compter-en-bachata-les-8-temps",
        "category": "rythme",
        "level_slug": "debutant",
        "duration_minutes": 5,
        "content": "## Les 8 temps de la Bachata\n\nLa bachata se danse sur un cycle de **8 temps** :\n\n1. Pas à gauche\n2. Ferme pied\n3. Pas à gauche\n4. **Tap** (frappe légère)\n5. Pas à droite\n6. Ferme pied\n7. Pas à droite\n8. **Tap** (frappe légère)\n\nLe tap tombe sur les temps 4 et 8, marquant la structure musicale.",
        "video_url": "",
    },
    {
        "title": "La connexion corps à corps",
        "slug": "la-connexion-corps-a-corps",
        "category": "technique",
        "level_slug": "intermediaire",
        "duration_minutes": 10,
        "content": "## Connexion en Bachata Sensual\n\nLa connexion est l'essence même de la bachata sensual. Elle passe par :\n\n- **Le cadre** : tension légère des bras, espace maintenu\n- **Le poitrine** : point de contact principal\n- **Le bassin** : suit le mouvement de l'autre\n\n### Le principe \"lead & follow\"\n\nLe meneur propose, le suiveur répond. Jamais de force, toujours de l'intention.",
        "video_url": "",
    },
    {
        "title": "Ondulations du corps",
        "slug": "ondulations-du-corps",
        "category": "technique",
        "level_slug": "intermediaire",
        "duration_minutes": 12,
        "content": "## Les ondulations\n\nL'ondulation est le mouvement signature de la bachata sensual. Elle part du bassin et remonte jusqu'aux épaules.\n\n### Exercice\n\n1. Debout, pieds joints\n2. Poussez le bassin en avant\n3. Laissez la vague remonter jusqu'à la poitrine\n4. Terminez par les épaules\n\nRépétez lentement, puis accélérez progressivement.",
        "video_url": "",
    },
    {
        "title": "Origines de la Bachata",
        "slug": "origines-de-la-bachata",
        "category": "histoire",
        "level_slug": "debutant",
        "duration_minutes": 7,
        "content": "## Histoire de la Bachata\n\nLa bachata est née en **République Dominicaine** dans les années 1960. Initialement musique des quartiers pauvres, elle était méprisée par les élites.\n\n### Les pionniers\n\n- **José Manuel Calderón** : premier disque de bachata (1962)\n- **Blas Durán** : modernisation avec la guitare électrique\n- **Juan Luis Guerra** : popularisation internationale dans les années 90\n\nEn 2019, l'UNESCO a inscrit la bachata au patrimoine culturel immatériel.",
        "video_url": "",
    },
    {
        "title": "La culture des soirées bachata",
        "slug": "la-culture-des-soirees-bachata",
        "category": "culture",
        "level_slug": "debutant",
        "duration_minutes": 6,
        "content": "## Étiquette en soirée bachata\n\n### Inviter à danser\n\n- On invite avec un sourire et un geste de la main, ou verbalement\n- Un refus doit toujours être respecté\n- On peut demander et se faire refuser : c'est normal\n\n### Sur la piste\n\n- Respecter l'espace des autres couples\n- Le meneur guide la trajectoire, pas seulement les figures\n- Fin de la danse : remerciements mutuels",
        "video_url": "",
    },
]


class Command(BaseCommand):
    help = "Seed la base de données avec des cours et leçons de théorie de démo."

    def handle(self, *args, **options):
        self.stdout.write("🌱 Seed courses & théorie...")

        # Styles
        styles = {}
        for s in STYLES:
            obj, created = DanceStyle.objects.get_or_create(slug=s["slug"], defaults={
                "name": s["name"], "icon": s["icon"], "description": s["description"]
            })
            styles[s["slug"]] = obj
            if created:
                self.stdout.write(f"  ✅ Style créé : {obj.name}")

        # Levels
        levels = {}
        for l in LEVELS:
            obj, created = Level.objects.get_or_create(slug=l["slug"], defaults={
                "name": l["name"], "order": l["order"], "color": l["color"]
            })
            levels[l["slug"]] = obj
            if created:
                self.stdout.write(f"  ✅ Niveau créé : {obj.name}")

        # Récupère un nœud existant pour les cours (le premier disponible)
        node = OrganizationNode.objects.first()
        if not node:
            self.stdout.write("  ⚠️  Aucun nœud d'organisation trouvé. Lancez d'abord seed_nodes.")
            return

        # Cours
        courses_data = [
            {"name": "Bachata Sensual Débutant", "slug": "bachata-sensual-debutant", "style": "bachata-sensual", "level": "debutant", "description": "Cours d'initiation à la bachata sensual. Bases du pas, connexion et musicalité."},
            {"name": "Bachata Moderna Intermédiaire", "slug": "bachata-moderna-intermediaire", "style": "bachata-moderna", "level": "intermediaire", "description": "Approfondissement des figures et des transitions en Bachata Moderna."},
            {"name": "Bachata Dominicana Avancé", "slug": "bachata-dominicana-avance", "style": "bachata-dominicana", "level": "avance", "description": "Style original dominicain : footwork, syncopations et improvisation."},
            {"name": "Urban Kiz Découverte", "slug": "urban-kiz-decouverte", "style": "urban-kiz", "level": "debutant", "description": "Introduction à l'Urban Kiz parisien. Posture, fluidité et connexion."},
            {"name": "Sensual Avancé — Corps et Fluidité", "slug": "sensual-avance-corps-fluidite", "style": "bachata-sensual", "level": "avance", "description": "Ondulations, dips, et chorégraphies avancées en Bachata Sensual."},
            {"name": "Moderna — Figures et Créativité", "slug": "moderna-figures-creativite", "style": "bachata-moderna", "level": "intermediaire", "description": "Répertoire de figures et improvisation musicale en Bachata Moderna."},
        ]

        for c in courses_data:
            obj, created = Course.objects.get_or_create(slug=c["slug"], defaults={
                "name": c["name"],
                "description": c["description"],
                "style": styles[c["style"]],
                "level": levels[c["level"]],
                "node": node,
                "is_active": True,
            })
            if created:
                self.stdout.write(f"  ✅ Cours créé : {obj.name}")

        # Leçons de théorie
        for t in THEORY_LESSONS:
            level_obj = levels.get(t["level_slug"])
            obj, created = TheoryLesson.objects.get_or_create(slug=t["slug"], defaults={
                "title": t["title"],
                "category": t["category"],
                "level": level_obj,
                "content": t["content"],
                "video_url": t.get("video_url", ""),
                "duration_minutes": t["duration_minutes"],
                "is_active": True,
            })
            if created:
                self.stdout.write(f"  ✅ Théorie créée : {obj.title}")

        self.stdout.write(self.style.SUCCESS("✅ Seed terminé !"))
