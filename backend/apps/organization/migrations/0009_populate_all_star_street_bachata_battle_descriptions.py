# Data migration: fill FR/EN/ES descriptions for the All Star Street Bachata Battle node

from django.db import migrations

SLUG = "all-star-street-bachata-battle"

SHORT_DESCRIPTION = {
    "fr": "Le clash ultime entre musicalité, attitude et créativité. 1000€ cash pour le vainqueur. 100% improvisation.",
    "en": "The ultimate clash of musicality, attitude, and creativity. €1000 cash for the winner. 100% improvisation.",
    "es": "El choque definitivo entre musicalidad, actitud y creatividad. 1000€ en efectivo para el ganador. 100% improvisación.",
}

CONTENT = {
    "fr": """\
🔥 STREET BACHATA BATTLE 🔥
Le clash ultime entre musicalité, attitude et créativité.

Les meilleurs danseurs vont s'affronter dans une battle où la technique seule ne suffira pas.
Ici, il faudra du style, du caractère, de l'interprétation… et surtout une vraie identité.

⚡ Pré-sélections explosives
Chaque danseur aura 45 secondes pour convaincre les juges et décrocher sa place dans le tableau final.

⚔️ Tableau final
Les 8 danseurs sélectionnés affronteront directement les guests invités dans des duels intenses :
8èmes → Quarts → Demi-finales → Finale

⏱️ Format des battles :
- Jusqu'aux demi-finales : 1 minute par danseur
- Finale : 2 passages par danseur pour aller chercher le titre.

💰 À la clé :
1000€ cash pour le vainqueur.

🎭 Fusion autorisée… mais attention :
La bachata doit rester au cœur de chaque passage.
Les danseurs seront jugés sur leur capacité à repousser les limites tout en conservant l'essence de la bachata.

⚠️ Ici, aucune chorégraphie préparée.
100% improvisation.

Les musiques sont aléatoires et ne seront jamais transmises à l'avance.
Chaque danseur découvrira son son au moment même de son passage.

🔥 Plus qu'une battle.
Une scène. Une identité. Une guerre d'énergie.

Qui sera capable de marquer le public… et repartir avec le titre ?\
""",
    "en": """\
🔥 STREET BACHATA BATTLE 🔥
The ultimate clash of musicality, attitude, and creativity.

The best dancers will face off in a battle where technique alone won't be enough.
Here, you'll need style, character, interpretation… and above all, a true identity.

⚡ Explosive Pre-selections
Each dancer will have 45 seconds to convince the judges and earn their spot in the final bracket.

⚔️ Final Bracket
The 8 selected dancers will face the invited guest dancers directly in intense duels:
Round of 8 → Quarterfinals → Semifinals → Final

⏱️ Battle Format:
- Up to the semifinals: 1 minute per dancer
- Final: 2 rounds per dancer to claim the title.

💰 At Stake:
€1000 cash for the winner.

🎭 Fusion allowed… but beware:
Bachata must remain at the heart of every round.
Dancers will be judged on their ability to push the limits while preserving the essence of bachata.

⚠️ No prepared choreography here.
100% improvisation.

Music is random and will never be shared in advance.
Each dancer will discover their song the moment they step on the floor.

🔥 More than a battle.
A stage. An identity. A war of energy.

Who will be able to mark the audience… and walk away with the title?\
""",
    "es": """\
🔥 STREET BACHATA BATTLE 🔥
El choque definitivo entre musicalidad, actitud y creatividad.

Los mejores bailarines se enfrentarán en una batalla donde la técnica sola no será suficiente.
Aquí se necesitará estilo, carácter, interpretación… y sobre todo, una identidad propia.

⚡ Preselecciones explosivas
Cada bailarín tendrá 45 segundos para convencer a los jueces y asegurarse su lugar en el cuadro final.

⚔️ Cuadro final
Los 8 bailarines seleccionados se enfrentarán directamente a los invitados especiales en duelos intensos:
Octavos → Cuartos → Semifinales → Final

⏱️ Formato de las batallas:
- Hasta las semifinales: 1 minuto por bailarín
- Final: 2 rondas por bailarín para conquistar el título.

💰 En juego:
1000€ en efectivo para el ganador.

🎭 Fusión permitida… pero atención:
La bachata debe seguir siendo el corazón de cada ronda.
Los bailarines serán juzgados por su capacidad de superar los límites conservando la esencia de la bachata.

⚠️ Aquí no hay coreografías preparadas.
100% improvisación.

Las músicas son aleatorias y nunca se compartirán con antelación.
Cada bailarín descubrirá su canción en el mismo momento de salir a la pista.

🔥 Más que una batalla.
Un escenario. Una identidad. Una guerra de energía.

¿Quién será capaz de marcar al público… y marcharse con el título?\
""",
}


def populate_descriptions(apps, schema_editor):
    OrganizationNode = apps.get_model("organization", "OrganizationNode")
    try:
        node = OrganizationNode.objects.get(slug=SLUG)
    except OrganizationNode.DoesNotExist:
        return

    for lang, text in SHORT_DESCRIPTION.items():
        setattr(node, f"short_description_{lang}", text)

    for lang, text in CONTENT.items():
        setattr(node, f"description_{lang}", text)
        setattr(node, f"content_{lang}", text)

    node.save()


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("organization", "0008_organizationnode_explore_order"),
    ]

    operations = [
        migrations.RunPython(populate_descriptions, noop),
    ]
