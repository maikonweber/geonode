#########################################################################
#
# Custom views for GeoNode catalogue pages
#
#########################################################################

from django.views.generic import TemplateView
from geonode.layers.models import Dataset
from geonode.maps.models import Map
from geonode.documents.models import Document
from geonode.geoapps.models import GeoApp
from geonode.favorite.models import Favorite
import time


def _annotate_favorites(resources, user):
    """Marca resource.favorite=True nos recursos que o usuário já favoritou."""
    if not user or not user.is_authenticated:
        for r in resources:
            r.favorite = False
        return resources

    favorite_ids = set(
        Favorite.objects.filter(user=user).values_list('object_id', flat=True)
    )
    for r in resources:
        r.favorite = r.pk in favorite_ids
    return resources


class DatasetsListView(TemplateView):
    """
    View customizada para listagem de Datasets - layout Figma com carousels por categoria.
    """
    template_name = 'catalogue_custom/datasets.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user

        # Datasets (Conjunto de Dados)
        datasets = list(Dataset.objects.filter(is_published=True).order_by('-date')[:20])
        _annotate_favorites(datasets, user)
        context['datasets'] = datasets

        # Nuvem de Pontos
        pointcloud = list(Dataset.objects.filter(is_published=True, subtype='pointcloud').order_by('-date')[:8])
        if not pointcloud:
            pointcloud = datasets[:8]
        _annotate_favorites(pointcloud, user)
        context['pointcloud_datasets'] = pointcloud

        # Orto Imagem
        ortho = list(Dataset.objects.filter(
            is_published=True, subtype__in=['raster', 'geotiff', 'coverageStore']
        ).order_by('-date')[:8])
        if not ortho:
            ortho = datasets[:8]
        _annotate_favorites(ortho, user)
        context['ortho_datasets'] = ortho

        # Tour Virtual - GeoApps/GeoStories
        try:
            tours = list(GeoApp.objects.filter(is_published=True, resource_type='geostory').order_by('-date')[:8])
            if not tours:
                tours = list(GeoApp.objects.filter(is_published=True).order_by('-date')[:8])
            _annotate_favorites(tours, user)
            context['tour_datasets'] = tours
        except Exception:
            context['tour_datasets'] = []

        # Mapas
        maps = list(Map.objects.filter(is_published=True).order_by('-date')[:20])
        _annotate_favorites(maps, user)
        context['maps'] = maps

        # Documentos
        documents = list(Document.objects.filter(is_published=True).order_by('-date')[:20])
        _annotate_favorites(documents, user)
        context['documents'] = documents

        return context


class DocumentsListView(TemplateView):
    """
    View customizada para listagem de Documents.
    Mantém toda funcionalidade original (filtros, paginação, API).
    """
    template_name = 'catalogue_custom/documents.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # Estatísticas básicas
        context['total_documents'] = Document.objects.filter(is_published=True).count()
        context['recent_documents'] = Document.objects.filter(
            is_published=True
        ).order_by('-date')[:5]

        return context


class MapsListView(TemplateView):
    """
    View customizada para listagem de Maps.
    Mantém toda funcionalidade original (filtros, paginação, API).
    """
    template_name = 'catalogue_custom/maps.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # Estatísticas básicas
        context['total_maps'] = Map.objects.filter(is_published=True).count()
        context['recent_maps'] = Map.objects.filter(
            is_published=True
        ).order_by('-date')[:5]

        return context


class GeoStoriesListView(TemplateView):
    """
    View customizada para listagem de GeoStories - layout Figma com carousels.
    """
    template_name = 'catalogue_custom/geostories.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user

        try:
            geostories = list(GeoApp.objects.filter(
                is_published=True, resource_type='geostory'
            ).order_by('-date')[:20])
            if not geostories:
                geostories = list(GeoApp.objects.filter(is_published=True).order_by('-date')[:20])
            _annotate_favorites(geostories, user)
            context['geostories'] = geostories
            context['featured_geostory'] = geostories[0] if geostories else None
        except Exception:
            context['geostories'] = []
            context['featured_geostory'] = None

        return context


class DashboardsListView(TemplateView):
    """
    View customizada para listagem de Dashboards - layout Figma com carousels.
    """
    template_name = 'catalogue_custom/dashboards.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user

        # Dashboards (GeoApps do tipo dashboard)
        try:
            dashboards = list(GeoApp.objects.filter(
                is_published=True, resource_type='dashboard'
            ).order_by('-date')[:20])
            if not dashboards:
                dashboards = list(GeoApp.objects.filter(is_published=True).order_by('-date')[:20])
            _annotate_favorites(dashboards, user)
            context['dashboards'] = dashboards
        except Exception:
            context['dashboards'] = []

        # Mapas
        maps = list(Map.objects.filter(is_published=True).order_by('-date')[:20])
        _annotate_favorites(maps, user)
        context['maps'] = maps

        return context
