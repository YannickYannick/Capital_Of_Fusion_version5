"""
Signaux Organization — invalidation du cache list nœuds à chaque save/delete.
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import OrganizationNode, NodeEvent


def _invalidate():
    from .views import invalidate_nodes_cache
    invalidate_nodes_cache()


@receiver(post_save, sender=OrganizationNode)
@receiver(post_delete, sender=OrganizationNode)
def on_organization_node_change(sender, **kwargs):
    _invalidate()


@receiver(post_save, sender=NodeEvent)
@receiver(post_delete, sender=NodeEvent)
def on_node_event_change(sender, **kwargs):
    _invalidate()
