from rest_framework import serializers
from .models import Category, Unit, Product


class CategorySerializer(serializers.ModelSerializer):
    children_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'parent', 'children_count', 'created_at']

    def get_children_count(self, obj):
        return obj.children.count()


class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = ['id', 'name', 'code']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    unit_name = serializers.CharField(source='unit.name', read_only=True)
    total_stock = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'sku', 'category', 'category_name', 'unit', 'unit_name',
                  'min_stock', 'price', 'image', 'description', 'total_stock', 'created_at', 'updated_at']

    def get_total_stock(self, obj):
        from apps.warehouse.models import Stock
        total = Stock.objects.filter(product=obj).aggregate(total=models.Sum('quantity'))['total']
        return total or 0