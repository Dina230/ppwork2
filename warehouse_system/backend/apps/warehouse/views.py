from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta

from .models import Warehouse, Counterparty, MovementType, Stock, Movement, MovementItem
from .serializers import (
    WarehouseSerializer,
    CounterpartySerializer,
    MovementTypeSerializer,
    StockSerializer,
    MovementSerializer,
    MovementCreateSerializer
)
from apps.audit.models import AuditLog, Notification


class IsManagerPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_manager


class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['name', 'address']
    filterset_fields = ['manager']


class CounterpartyViewSet(viewsets.ModelViewSet):
    queryset = Counterparty.objects.all()
    serializer_class = CounterpartySerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['type']
    search_fields = ['name', 'inn']


class MovementTypeViewSet(viewsets.ModelViewSet):
    queryset = MovementType.objects.all()
    serializer_class = MovementTypeSerializer
    permission_classes = [permissions.IsAuthenticated]


class StockViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['product', 'warehouse']


class MovementViewSet(viewsets.ModelViewSet):
    queryset = Movement.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['type', 'warehouse', 'status', 'created_by']

    def get_serializer_class(self):
        if self.action in ['create', 'update']:
            return MovementCreateSerializer
        return MovementSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

        AuditLog.objects.create(
            user=self.request.user,
            action='CREATE',
            model_name='Movement',
            object_id=serializer.instance.id,
            changes={'status': 'draft'}
        )

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        if not request.user.is_manager:
            return Response({'error': 'Только менеджер может утверждать'}, status=403)

        movement = self.get_object()
        movement.status = 'approved'
        movement.save()

        self._update_stock(movement)

        AuditLog.objects.create(
            user=request.user,
            action='APPROVE',
            model_name='Movement',
            object_id=movement.id,
            changes={'status': 'approved'}
        )

        # Создаём уведомление
        Notification.objects.create(
            user=movement.created_by,
            message=f'Движение #{movement.id} утверждено'
        )

        return Response(MovementSerializer(movement).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        if not request.user.is_manager:
            return Response({'error': 'Только менеджер может отменять'}, status=403)

        movement = self.get_object()
        movement.status = 'cancelled'
        movement.save()

        AuditLog.objects.create(
            user=request.user,
            action='CANCEL',
            model_name='Movement',
            object_id=movement.id,
            changes={'status': 'cancelled'}
        )

        return Response(MovementSerializer(movement).data)

    def _update_stock(self, movement):
        """Обновление остатков при проведении документа"""
        for item in movement.items.all():
            stock, created = Stock.objects.get_or_create(
                product=item.product,
                warehouse=movement.warehouse,
                defaults={'quantity': 0}
            )

            if movement.type.code in ['IN', 'RETURN']:
                stock.quantity += item.quantity
            else:
                stock.quantity -= item.quantity

            stock.save()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Статистика для дашборда"""

    total_products = Stock.objects.count()
    total_movements = Movement.objects.count()
    total_warehouses = Warehouse.objects.count()
    total_users = Counterparty.objects.count()

    week_ago = timezone.now() - timedelta(days=7)
    movements_week = Movement.objects.filter(created_at__gte=week_ago).count()

    low_stock = Stock.objects.filter(quantity__lt=10).count()

    total_value = Stock.objects.aggregate(total=Sum('quantity'))['total'] or 0

    status_stats = Movement.objects.values('status').annotate(count=Count('id'))

    return Response({
        'total_products': total_products,
        'total_movements': total_movements,
        'total_warehouses': total_warehouses,
        'total_users': total_users,
        'movements_week': movements_week,
        'low_stock': low_stock,
        'total_value': total_value,
        'status_stats': list(status_stats),
    })