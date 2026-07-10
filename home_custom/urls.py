from django.urls import path
from .views import HomeNewView

app_name = 'home_custom'

urlpatterns = [
    path('', HomeNewView.as_view(), name='home'),
]
