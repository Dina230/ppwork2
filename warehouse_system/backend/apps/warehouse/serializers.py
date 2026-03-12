from rest_framework import serializers
from .models import Warehouse, Counterparty, MovementType, Stock, Movement, MovementItem
from apps.catalog.serializers import ProductSerializer


class WarehouseSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source='manager.username', read_only=True)

    class Meta:
        model = Warehouse
        fields = ['id', 'name', 'address', 'manager', 'manager_name', 'created_at']


class CounterpartySerializer(serializers.ModelSerializer):
    class Meta:
        model = Counterparty
        fields = ['id', 'name', 'type', 'inn', 'contact', 'created_at']


class MovementTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MovementType
        fields = ['id', 'name', 'code']


class StockSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    unit_name = serializers.CharField(source='product.unit.name', read_only=True)

    class Meta:
        model = Stock
        fields = ['id', 'product', 'product_name', 'product_sku', 'warehouse',
                  'warehouse_name', 'quantity', 'batch_number', 'unit_name', 'updated_at']


class MovementItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)

    class Meta:
        model = MovementItem
        fields = ['id', 'product', 'product_name', 'product_sku', 'quantity', 'price']


class MovementSerializer(serializers.ModelSerializer):
    type_name = serializers.CharField(source='type.name', read_only=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    counterparty_name = serializers.CharField(source='counterparty.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    items = MovementItemSerializer(many=True, read_only=True)
    total_amount = serializers.SerializerMethodField()

    class Meta:
        model = Movement
        fields = ['id', 'type', 'type_name', 'warehouse', 'warehouse_name', 'counterparty',
                  'counterparty_name', 'created_by', 'created_by_name', 'status', 'date',
                  'comment', 'items', 'total_amount', 'created_at', 'updated_at']

    def get_total_amount(self, obj):
        total = obj.items.aggregate(total=serializers.models.Sum('quantity'))['total']
        return float(total or 0)


class MovementCreateSerializer(serializers.ModelSerializer):
    items = MovementItemSerializer(many=True)

    class Meta:
        model = Movement
        fields = ['type', 'warehouse', 'counterparty', 'status', 'date', 'comment', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        movement = Movement.objects.create(**validated_data)

        for item_data in items_data:
            MovementItem.objects.create(movement=movement, **item_data)

        return movement