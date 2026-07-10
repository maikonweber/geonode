#########################################################################
#
# Custom views for GeoNode home page
#
#########################################################################

from django.views.generic import TemplateView
from django.db.models import Q
from geonode.base.models import ResourceBase
from geonode.layers.models import Dataset
from geonode.maps.models import Map
from geonode.documents.models import Document
from geonode.geoapps.models import GeoApp


class HomeNewView(TemplateView):
    template_name = 'home_custom/home_new.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # Buscar todos os recursos publicados
        # Ordena por data de criação (recursos mais novos primeiro)
        resources = ResourceBase.objects.filter(
            is_published=True
        ).order_by('-date')

        # Adicionar URL customizada para dashboards, mapas e datasets
        for resource in resources:
            if hasattr(resource, 'resource_type') and resource.resource_type == 'dashboard':
                resource.custom_detail_url = '/dashboards/'
            elif resource.polymorphic_ctype.model == 'map':
                resource.custom_detail_url = '/maps/'
            elif resource.polymorphic_ctype.model == 'dataset':
                resource.custom_detail_url = '/datasets/'
            else:
                resource.custom_detail_url = resource.detail_url

        context['featured_resources'] = resources

        # Buscar por tipo de recurso
        context['recent_maps'] = Map.objects.filter(
            is_published=True
        ).order_by('-date')[:5]

        context['recent_datasets'] = Dataset.objects.filter(
            is_published=True
        ).order_by('-date')[:5]

        context['recent_documents'] = Document.objects.filter(
            is_published=True
        ).order_by('-date')[:5]

        context['recent_apps'] = GeoApp.objects.filter(
            is_published=True
        ).order_by('-date')[:5]

        # Estatísticas
        context['total_maps'] = Map.objects.filter(is_published=True).count()
        context['total_datasets'] = Dataset.objects.filter(is_published=True).count()
        context['total_documents'] = Document.objects.filter(is_published=True).count()
        context['total_resources'] = context['total_maps'] + context['total_datasets'] + context['total_documents']

        return context
