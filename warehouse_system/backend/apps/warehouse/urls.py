from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WarehouseViewSet,
    CounterpartyViewSet,
    MovementTypeViewSet,
    StockViewSet,
    MovementViewSet,
    dashboard_stats
)

router = DefaultRouter()
router.register('warehouses', WarehouseViewSet)
router.register('counterparties', CounterpartyViewSet)
router.register('movement-types', MovementTypeViewSet)
router.register('stocks', StockViewSet, basename='stock')
router.register('movements', MovementViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/stats/', dashboard_stats, name='dashboard-stats'),
]