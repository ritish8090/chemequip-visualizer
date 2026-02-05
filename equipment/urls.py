
from django.urls import path
from .views import EquipmentSummaryAPI, HistoryAPI

urlpatterns = [
    path('upload/', EquipmentSummaryAPI.as_view(), name='equipment-upload'),
    path('history/', HistoryAPI.as_view(), name='equipment-history'),
]
