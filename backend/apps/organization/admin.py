from django.contrib import admin
from .models import OrganizationNode, OrganizationRole, UserOrganizationRole, NodeEvent

class NodeEventInline(admin.TabularInline):
    """Inline pour gérer les événements directement depuis le noeud."""
    model = NodeEvent
    extra = 1
    fields = ['title', 'start_datetime', 'end_datetime', 'location', 'is_featured', 'image']
    ordering = ['start_datetime']


@admin.register(OrganizationNode)
class OrganizationNodeAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'parent', 'slug', 'is_visible_3d', 'events_count')
    list_filter = ('type', 'is_visible_3d', 'planet_type')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name', 'slug', 'description', 'short_description']
    inlines = [NodeEventInline]
    
    fieldsets = [
        ('Informations de base', {
            'fields': ['name', 'slug', 'parent', 'type', 'description']
        }),
        ('Contenu de l\'Overlay', {
            'fields': [
                'cover_image',
                'short_description',
                'content',
                ('cta_text', 'cta_url'),
            ],
            'description': 'Contenu affiché dans l\'overlay central lors du clic sur la planète'
        }),
        ('Configuration 3D', {
            'fields': [
                'is_visible_3d',
                'visual_source',
                'planet_type', 
                ('model_3d', 'planet_texture'),
                'planet_color', 
                'planet_scale',
                ('orbit_radius', 'orbit_speed', 'orbit_phase'),
                ('orbit_position_y', 'orbit_shape', 'orbit_roundness'),
                'rotation_speed',
            ],
            'classes': ['collapse'],
            'description': 'Paramètres de visualisation 3D pour la page /explore'
        }),
        ('Animation d\'Entrée', {
            'fields': [
                ('entry_start_x', 'entry_start_y', 'entry_start_z'),
                'entry_speed',
            ],
            'classes': ['collapse'],
            'description': 'Configuration de la trajectoire d\'entrée (ligne droite avant l\'orbite)'
        }),
        ('Médias', {
            'fields': ['video_url'],
            'classes': ['collapse']
        }),
    ]
    
    def events_count(self, obj):
        return obj.node_events.count()
    events_count.short_description = "Événements"


@admin.register(OrganizationRole)
class OrganizationRoleAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(UserOrganizationRole)
class UserOrganizationRoleAdmin(admin.ModelAdmin):
    list_display = ("user", "node", "role")


@admin.register(NodeEvent)
class NodeEventAdmin(admin.ModelAdmin):
    list_display = ("title", "node", "start_datetime", "is_featured")
    list_filter = ("node", "is_featured")
