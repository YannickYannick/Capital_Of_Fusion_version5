"""
Script de génération du management command seed_nodes.
Ce script lit les données de la base locale et génère le fichier seed_nodes.py.
"""
import django
import os
import json
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
django.setup()

from apps.organization.models import OrganizationNode

nodes = OrganizationNode.objects.all()
data = []
for n in nodes:
    data.append({
        'id': str(n.id),
        'name': n.name,
        'slug': n.slug,
        'type': n.type,
        'parent_id': str(n.parent_id) if n.parent_id else None,
        'description': n.description,
        'short_description': n.short_description,
        'content': n.content,
        'cta_text': n.cta_text,
        'cta_url': n.cta_url,
        'visual_source': n.visual_source,
        'planet_type': n.planet_type,
        'planet_color': n.planet_color,
        'planet_scale': float(n.planet_scale),
        'orbit_radius': float(n.orbit_radius),
        'orbit_speed': float(n.orbit_speed),
        'orbit_phase': float(n.orbit_phase),
        'orbit_position_y': float(n.orbit_position_y),
        'orbit_shape': n.orbit_shape,
        'orbit_roundness': float(n.orbit_roundness),
        'rotation_speed': float(n.rotation_speed),
        'is_visible_3d': n.is_visible_3d,
    })

data_json = json.dumps(data, ensure_ascii=False, indent=4)

command_content = f"""from django.core.management.base import BaseCommand
from apps.organization.models import OrganizationNode

NODES_DATA = {data_json}


class Command(BaseCommand):
    help = "Seed organization nodes from local fixture data"

    def handle(self, *args, **options):
        created = 0
        updated = 0

        # First pass: create nodes without parent
        for nd in NODES_DATA:
            obj, is_created = OrganizationNode.objects.update_or_create(
                id=nd["id"],
                defaults={{k: v for k, v in nd.items() if k not in ("id", "parent_id")}}
            )
            if is_created:
                created += 1
            else:
                updated += 1

        # Second pass: set parents
        for nd in NODES_DATA:
            if nd.get("parent_id"):
                try:
                    parent = OrganizationNode.objects.get(id=nd["parent_id"])
                    OrganizationNode.objects.filter(id=nd["id"]).update(parent=parent)
                except OrganizationNode.DoesNotExist:
                    pass

        self.stdout.write(self.style.SUCCESS(f"Done: {{created}} created, {{updated}} updated"))
"""

output_path = os.path.join(
    os.path.dirname(__file__),
    'apps', 'organization', 'management', 'commands', 'seed_nodes.py'
)
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(command_content)

print(f"OK: seed_nodes.py generated with {len(data)} nodes at {output_path}")
