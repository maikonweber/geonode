import os
from django.apps import AppConfig


class HomeCustomConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'home_custom'

    def ready(self):
        from django.conf import settings
        our_templates = os.path.join(os.path.dirname(__file__), 'templates')
        dirs = settings.TEMPLATES[0]['DIRS']
        if our_templates in dirs:
            dirs.remove(our_templates)
        dirs.insert(0, our_templates)
