from django.urls import path
from .views import (
    DatasetsListView,
    DocumentsListView,
    MapsListView,
    GeoStoriesListView,
    DashboardsListView,
)

app_name = 'catalogue_custom'

urlpatterns = [
    path('', DatasetsListView.as_view(), name='datasets_list'),
    path('datasets/', DatasetsListView.as_view(), name='datasets_browse'),
    path('documents/', DocumentsListView.as_view(), name='documents_browse'),
    path('maps/', MapsListView.as_view(), name='maps_browse'),
    path('geostories/', GeoStoriesListView.as_view(), name='geostories_browse'),
    path('dashboards/', DashboardsListView.as_view(), name='dashboards_browse'),
]
