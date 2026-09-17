"""
Données planning PBVF 2026 — extrait des affiches officielles (notre-programme).
Source visuelle : pbvf-2026-planning-thursday-friday/saturday/sunday.png
"""

from datetime import date

DAYS = [
    {"id": "jeu", "label": "Jeudi", "date": "17 sept.", "iso_date": date(2026, 9, 17)},
    {"id": "ven", "label": "Vendredi", "date": "18 sept.", "iso_date": date(2026, 9, 18)},
    {"id": "sam", "label": "Samedi", "date": "19 sept.", "iso_date": date(2026, 9, 19)},
    {"id": "dim", "label": "Dimanche", "date": "20 sept.", "iso_date": date(2026, 9, 20)},
]

STAGES = [
    "La Casa Room",
    "La Escuela",
    "El Patio Room",
    "Vibe Room",
    "Aquaboulevard",
]

# Tuple: day_id, room, start, end, title, style, level, category, is_live, not_in_full_pass
# level: open | beginner | intermediate | advanced | ""
# category: workshop | party | break | competition | social | info | concert
SLOT_ROWS: list[tuple] = [
    # —— Jeudi ——
    ("jeu", "La Casa Room", "18:00", "18:00", "Open Doors", "", "", "info", False, False),
    ("jeu", "La Casa Room", "18:00", "19:30", "Social Day", "La Casa Room", "", "social", False, False),
    ("jeu", "La Casa Room", "19:30", "22:30", "Carlos y Paz", "Bootcamp Bachazouk", "open", "workshop", False, False),
    ("jeu", "La Casa Room", "22:30", "04:00", "Urban Vibe Party", "Today's music & remix authorized", "", "party", True, False),
    # —— Vendredi ——
    ("ven", "La Casa Room", "13:00", "13:00", "Open Doors", "Toutes salles", "", "info", False, False),
    ("ven", "La Casa Room", "14:00", "15:55", "Mika", "Masterclass Musicality", "open", "workshop", False, False),
    ("ven", "La Casa Room", "16:00", "16:55", "Jerem & Jade", "Bachazouk", "advanced", "workshop", False, False),
    ("ven", "La Casa Room", "17:00", "19:00", "Battle Pre-Selections", "Street Bachata Battle", "", "competition", False, False),
    ("ven", "La Casa Room", "19:00", "20:00", "Break", "", "", "break", False, False),
    ("ven", "La Casa Room", "20:00", "20:55", "David & Ines", "Bachata Fusion", "open", "workshop", False, False),
    ("ven", "La Casa Room", "21:00", "23:00", "Street Bachata Battle", "All Stars Finale", "", "competition", False, False),
    ("ven", "La Casa Room", "23:00", "23:30", "Official Festival Launch", "XXL Vibe Room", "", "info", False, False),
    ("ven", "La Casa Room", "23:30", "05:45", "Añejo Vibe Party", "50% classics · 50% hits · no remix", "", "party", True, False),
    ("ven", "El Patio Room", "17:00", "22:00", "Open Air Social Day", "", "", "social", False, False),
    ("ven", "Vibe Room", "00:00", "03:00", "Boiler Room DJ Set", "Live Instagram 01h–02h Mix World Wide", "", "party", True, False),
    # —— Samedi ——
    ("sam", "La Casa Room", "09:45", "09:45", "Open Doors", "Toutes salles", "", "info", False, False),
    ("sam", "La Casa Room", "10:00", "10:55", "Brice & Manue", "Bachata Fusion", "open", "workshop", False, False),
    ("sam", "La Escuela", "10:00", "10:55", "Pablo & Andrea", "Sensual Bachata", "beginner", "workshop", False, False),
    ("sam", "La Casa Room", "11:00", "11:55", "Dario & Sara", "Bachata Fusion", "intermediate", "workshop", False, False),
    ("sam", "La Escuela", "11:00", "11:55", "Dim & Laure", "Bachazouk", "beginner", "workshop", False, False),
    ("sam", "La Casa Room", "12:00", "12:55", "Diger & Marie", "Sensual Bachata", "intermediate", "workshop", False, False),
    ("sam", "La Escuela", "12:00", "12:55", "Tedy & Chun", "Bachata Influence Meet Bachazouk", "open", "workshop", False, False),
    ("sam", "La Casa Room", "13:00", "14:00", "Lunch Break", "Toutes salles", "", "break", False, False),
    ("sam", "La Casa Room", "14:00", "14:55", "Owen & Eva", "Dynamic Bachata", "intermediate", "workshop", False, False),
    ("sam", "La Escuela", "14:00", "14:55", "Evan & Eugenia", "Role Rotation", "open", "workshop", False, False),
    ("sam", "El Patio Room", "14:00", "14:55", "Mika & Liza", "Brazilian Zouk · Tilt & Twist – Upper Body Movements", "advanced", "workshop", False, True),
    ("sam", "La Casa Room", "15:00", "15:55", "Claudio & Manue", "Bachata Fusion", "intermediate", "workshop", False, False),
    ("sam", "La Escuela", "15:00", "15:55", "Melonito & Laure", "Brazilian Zouk for Bachata", "beginner", "workshop", False, False),
    ("sam", "El Patio Room", "15:00", "15:55", "Didi Backstage", "Hip Work", "open", "workshop", False, False),
    ("sam", "La Casa Room", "16:00", "16:55", "Dario & Sara", "Bachata Fusion", "open", "workshop", False, False),
    ("sam", "La Escuela", "16:00", "16:55", "Christina & Rebeca", "Sensual Bachata", "intermediate", "workshop", False, False),
    ("sam", "El Patio Room", "16:00", "16:55", "Fanny", "Traditional Bachata", "open", "workshop", False, False),
    ("sam", "La Casa Room", "17:00", "17:55", "Melvin & Gatica", "Bachata Influence", "intermediate", "workshop", False, False),
    ("sam", "El Patio Room", "17:00", "17:55", "Sarah La Morena", "Partnerwork Traditional Bachata", "open", "workshop", False, False),
    ("sam", "La Casa Room", "18:00", "19:15", "Break", "Toutes salles", "", "break", False, False),
    ("sam", "La Casa Room", "19:15", "22:30", "Jack & Jill", "Pre-Selections IDF", "", "competition", False, False),
    ("sam", "El Patio Room", "19:15", "22:30", "Open Air Social Day", "", "", "social", False, False),
    ("sam", "La Casa Room", "22:30", "05:00", "100% Kompa Party", "Live concert · tickets séparés", "", "concert", True, False),
    ("sam", "La Casa Room", "05:00", "08:00", "Bachata After-Party", "Deep connexion · BPM dégressif", "", "party", False, False),
    ("sam", "Aquaboulevard", "22:30", "22:30", "Opening Doors", "Complexe aquatique 7 000 m²", "", "info", False, False),
    ("sam", "Aquaboulevard", "22:30", "23:45", "Pre-Party", "Capital of Fusion", "", "party", False, False),
    ("sam", "Aquaboulevard", "23:45", "00:15", "Artist Presentation", "XXL Vibe Pool Party", "", "info", False, False),
    ("sam", "Aquaboulevard", "00:15", "05:00", "Capital of Fusion Party", "Multi-Vibes 100% Bachata", "", "party", True, False),
    # —— Dimanche ——
    ("dim", "La Casa Room", "10:45", "10:45", "Open Doors", "Toutes salles", "", "info", False, False),
    ("dim", "La Casa Room", "11:00", "11:55", "Christina & Rebeca", "Sensual Bachata", "open", "workshop", False, False),
    ("dim", "La Escuela", "11:00", "11:55", "Oliver Chiro", "Body Care for Dance", "beginner", "workshop", False, False),
    ("dim", "La Casa Room", "12:00", "12:55", "Keymo & Lina", "Bachata Fusion", "intermediate", "workshop", False, False),
    ("dim", "La Escuela", "12:00", "12:55", "Salem & Monika", "Bachata Movement Contrast", "open", "workshop", False, False),
    ("dim", "La Casa Room", "13:00", "14:00", "Lunch Break", "Toutes salles", "", "break", False, False),
    ("dim", "La Casa Room", "14:00", "14:55", "Melvin & Gatica", "Bachata Influence", "intermediate", "workshop", False, False),
    ("dim", "El Patio Room", "14:00", "14:55", "Meline", "Traditional Bachata Masterclass", "advanced", "workshop", False, True),
    ("dim", "La Casa Room", "15:00", "15:55", "Owen & Eva", "Dynamic Bachata", "intermediate", "workshop", False, False),
    ("dim", "La Escuela", "15:00", "15:55", "Bastien & Amélie", "Bachata Fusion", "open", "workshop", False, False),
    ("dim", "El Patio Room", "15:00", "15:55", "Meline", "Traditional Bachata", "open", "workshop", False, False),
    ("dim", "La Casa Room", "16:00", "16:55", "Melonito & Laure", "Bachazouk", "intermediate", "workshop", False, False),
    ("dim", "La Escuela", "16:00", "16:55", "Otko & Vika", "Bachata Influence", "open", "workshop", False, False),
    ("dim", "El Patio Room", "16:00", "17:55", "Claudio", "DioStyle Masterclass (2h)", "advanced", "workshop", False, True),
    ("dim", "La Casa Room", "17:00", "17:55", "Ezo & Hugo", "Bachata Influence", "intermediate", "workshop", False, False),
    ("dim", "El Patio Room", "18:00", "19:00", "Mathilde", "Solo Styling", "open", "workshop", False, False),
    ("dim", "La Casa Room", "18:00", "19:00", "Melvin & Gatica", "Bachata Influence", "intermediate", "workshop", False, False),
    ("dim", "El Patio Room", "19:00", "21:00", "Open Air Social Day", "", "", "social", False, False),
    ("dim", "La Casa Room", "19:00", "22:30", "Jack & Jill Finals", "French Social Cup & Selection World Cup", "", "competition", False, False),
    ("dim", "Vibe Room", "22:30", "02:30", "100% Brazilian Zouk Mix", "", "", "party", False, False),
    ("dim", "La Casa Room", "22:30", "03:45", "Smooth Vibe Party", "100% Bachata", "", "party", True, False),
    ("dim", "La Casa Room", "03:45", "05:00", "Iconic Blackout Under The Stars", "Low BPM · no videos/phones", "", "party", False, False),
]

LEVEL_LABELS = {
    "open": "Open",
    "beginner": "Beginner",
    "intermediate": "Intermediate",
    "advanced": "Advanced",
}
