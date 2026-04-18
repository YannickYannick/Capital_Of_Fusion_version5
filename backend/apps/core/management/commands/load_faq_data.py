"""
Management command to load FAQ data in 3 languages.
Usage: python manage.py load_faq_data
"""
from django.core.management.base import BaseCommand
from apps.core.models import FaqItem


FAQ_DATA = [
    {
        "order": 1,
        "question_fr": "L'hôtel est-il situé près du lieu de l'événement ?",
        "question_en": "Is the hotel located near the venue?",
        "question_es": "¿Está el hotel cerca del lugar del evento?",
        "answer_fr": """L'hôtel est à 15 minutes en voiture du lieu de l'événement. Un service de navette sera proposé (2 euros) pendant toute la durée du séjour.

40 Av. du Maréchal de Lattre de Tassigny, 92360 Meudon""",
        "answer_en": """The hotel is a 15-minute drive from the venue. A shuttle bus service will be provided (2 euros) throughout the entire stay.

40 Av. du Maréchal de Lattre de Tassigny, 92360 Meudon""",
        "answer_es": """El hotel está a 15 minutos en coche del lugar del evento. Se proporcionará un servicio de autobús lanzadera (2 euros) durante toda la estancia.

40 Av. du Maréchal de Lattre de Tassigny, 92360 Meudon""",
    },
    {
        "order": 2,
        "question_fr": "Quels types de pass sont disponibles ?",
        "question_en": "What kind of passes can I find?",
        "question_es": "¿Qué tipos de pases hay disponibles?",
        "answer_fr": """Nous proposons 3 catégories :
• Tout inclus (hôtel + full pass)
• Full pass
• Party pass

Tous les pass donnent accès à 4 jours et 4 nuits de festival. Vous pouvez retrouver tous les détails et ce que chaque pass inclut directement sur notre site.""",
        "answer_en": """We offer 3 categories:
• All-inclusive (hotel + full pass)
• Full pass
• Party pass

All passes give you access to 4 days and 4 nights of the festival. You can find all the details and what each pass includes directly on our website.""",
        "answer_es": """Ofrecemos 3 categorías:
• Todo incluido (hotel + full pass)
• Full pass
• Party pass

Todos los pases dan acceso a 4 días y 4 noches del festival. Puedes encontrar todos los detalles y lo que incluye cada pase directamente en nuestro sitio web.""",
    },
    {
        "order": 3,
        "question_fr": "Le festival offre-t-il des qualifications directes pour la Social World Cup ?",
        "question_en": "Does the festival offer direct qualifications for the Social World Cup?",
        "question_es": "¿El festival ofrece clasificaciones directas para la Social World Cup?",
        "answer_fr": """Oui, nous organisons une compétition Jack & Jill avec des places de qualification directe. Elle offre 3 places pour les leaders et 3 pour les followers.

Cependant, elle n'est accessible que par des présélections organisées dans toute la France, ainsi que lors des présélections du festival organisées le vendredi.""",
        "answer_en": """Yes, we host a Jack & Jill competition with direct qualification spots. It offers 3 spots for leaders and 3 for followers.

However, it is only accessible through pre-selections held across France, as well as during the festival pre-selections organized on Friday.""",
        "answer_es": """Sí, organizamos una competición Jack & Jill con plazas de clasificación directa. Ofrece 3 plazas para leaders y 3 para followers.

Sin embargo, solo es accesible a través de preselecciones realizadas en toda Francia, así como durante las preselecciones del festival organizadas el viernes.""",
    },
    {
        "order": 4,
        "question_fr": "Est-il possible d'obtenir un pass journalier ou un pass pour une seule soirée ?",
        "question_en": "Is it possible to get a day pass or a single-night pass?",
        "question_es": "¿Es posible obtener un pase de un día o un pase para una sola noche?",
        "answer_fr": """Non, notre festival est conçu comme une expérience complète de 4 jours. Comme il affiche complet chaque année, nous ne sommes pas en mesure de proposer des pass journaliers.

Cependant, un nombre limité de party pass peut être disponible pour les soirées du jeudi et du dimanche.""",
        "answer_en": """No, our festival is designed as a full 4-day experience. As it sells out every year, we are not able to offer day passes.

However, a limited number of party passes may be available for Thursday and Sunday nights.""",
        "answer_es": """No, nuestro festival está diseñado como una experiencia completa de 4 días. Como se agota cada año, no podemos ofrecer pases de un día.

Sin embargo, un número limitado de party passes puede estar disponible para las noches del jueves y del domingo.""",
    },
    {
        "order": 5,
        "question_fr": "Quelle est votre politique concernant le vestiaire, les bouteilles et la nourriture ?",
        "question_en": "What is your cloakroom, bottle and food policy?",
        "question_es": "¿Cuál es su política de guardarropa, botellas y comida?",
        "answer_fr": """Notre vestiaire est inclus dans tous les pass, mais il est obligatoire.

Les bouteilles d'eau réutilisables sont autorisées pendant les ateliers, mais pas pendant les soirées.

Pour des raisons de sécurité, les bouteilles externes, les gourdes et la nourriture extérieure ne sont pas autorisées à l'intérieur de l'événement.

Des points d'eau seront disponibles sur place, et de l'eau en bouteille sera également disponible à l'achat.""",
        "answer_en": """Our cloakroom is included in all passes, but it is mandatory.

Reusable water bottles are allowed during workshops, but not during parties.

For security reasons, external bottles, flasks, and outside food are not permitted inside the event.

Water points will be available on site, and bottled water will also be available for purchase.""",
        "answer_es": """Nuestro guardarropa está incluido en todos los pases, pero es obligatorio.

Las botellas de agua reutilizables están permitidas durante los talleres, pero no durante las fiestas.

Por razones de seguridad, las botellas externas, cantimploras y comida externa no están permitidas dentro del evento.

Habrá puntos de agua disponibles en el lugar, y también habrá agua embotellada disponible para comprar.""",
    },
    {
        "order": 6,
        "question_fr": "Y a-t-il de la nourriture et des boissons disponibles sur place ?",
        "question_en": "Is there food and drinks available on site?",
        "question_es": "¿Hay comida y bebidas disponibles en el lugar?",
        "answer_fr": "Oui, il y a un bar et un service de restauration disponibles pendant tout le festival.",
        "answer_en": "Yes, there is a bar and food service available throughout the entire festival.",
        "answer_es": "Sí, hay un bar y servicio de comida disponibles durante todo el festival.",
    },
    {
        "order": 7,
        "question_fr": "Le prix tout inclus hôtel + festival est-il par chambre ou par personne ?",
        "question_en": "Does the all-inclusive hotel + festival price apply per room or per person?",
        "question_es": "¿El precio todo incluido hotel + festival es por habitación o por persona?",
        "answer_fr": """Le prix est pour la chambre complète.

Chambre Premium ➡️ 3 personnes, 4 nuits, 3 full pass
Chambre Standard ➡️ 2 personnes, 4 nuits, 2 full pass

Après l'inscription, vous recevrez un nouvel email quelques jours plus tard pour compléter les détails de la chambre et de votre full pass.""",
        "answer_en": """The price is for the full room.

Premium room ➡️ 3 people, 4 nights, 3 full passes
Standard room ➡️ 2 people, 4 nights, 2 full passes

After registration, you will receive a new email a few days later to complete the room details and your full pass.""",
        "answer_es": """El precio es por la habitación completa.

Habitación Premium ➡️ 3 personas, 4 noches, 3 full passes
Habitación Estándar ➡️ 2 personas, 4 noches, 2 full passes

Después del registro, recibirás un nuevo correo electrónico unos días después para completar los detalles de la habitación y tu full pass.""",
    },
    {
        "order": 8,
        "question_fr": "Comment ça marche si je veux participer au battle ou au Jack & Jill ?",
        "question_en": "How does it work if I want to participate in the battle or Jack & Jill?",
        "question_es": "¿Cómo funciona si quiero participar en el battle o en el Jack & Jill?",
        "answer_fr": """Il y a une section dédiée pour chaque concept où vous pouvez vous inscrire. L'inscription est obligatoire avant le festival.

Pour participer, un minimum de party pass est requis.""",
        "answer_en": """There is a dedicated section for each concept where you can register. Registration is mandatory before the festival.

To participate, a minimum of a party pass is required.""",
        "answer_es": """Hay una sección dedicada para cada concepto donde puedes registrarte. El registro es obligatorio antes del festival.

Para participar, se requiere un mínimo de party pass.""",
    },
]


class Command(BaseCommand):
    help = "Load FAQ data in 3 languages (FR, EN, ES)"

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        for faq_data in FAQ_DATA:
            order = faq_data["order"]
            existing = FaqItem.objects.filter(order=order).first()

            if existing:
                for key, value in faq_data.items():
                    setattr(existing, key, value)
                existing.is_published = True
                existing.save()
                updated_count += 1
                self.stdout.write(f"Updated FAQ #{order}: {faq_data['question_en'][:50]}...")
            else:
                FaqItem.objects.create(
                    order=order,
                    question=faq_data["question_fr"],
                    question_fr=faq_data["question_fr"],
                    question_en=faq_data["question_en"],
                    question_es=faq_data["question_es"],
                    answer=faq_data["answer_fr"],
                    answer_fr=faq_data["answer_fr"],
                    answer_en=faq_data["answer_en"],
                    answer_es=faq_data["answer_es"],
                    is_published=True,
                )
                created_count += 1
                self.stdout.write(f"Created FAQ #{order}: {faq_data['question_en'][:50]}...")

        self.stdout.write(
            self.style.SUCCESS(f"Done! Created: {created_count}, Updated: {updated_count}")
        )
