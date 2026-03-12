from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuditLogViewSet, NotificationViewSet

router = DefaultRouter()
router.register('logs', AuditLogViewSet, basename='audit-log')
router.register('notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
]