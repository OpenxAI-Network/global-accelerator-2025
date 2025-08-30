from django.urls import path
from .views import PlacesView

urlpatterns = [
    path("places/", PlacesView.as_view(), name="places"),  # <-- NO leading 'api/'
]
