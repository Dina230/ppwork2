from django.db import models
from apps.users.models import User
from apps.catalog.models import Product


class Warehouse(models.Model):
    name = models.CharField(max_length=100)
    address = models.TextField()
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='managed_warehouses')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Counterparty(models.Model):
    TYPE_CHOICES = [
        ('supplier', 'Поставщик'),
        ('customer', 'Покупатель'),
    ]

    name = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    inn = models.CharField(max_length=20, blank=True)
    contact = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"


class MovementType(models.Model):
    name = models.CharField(max_length=50)
    code = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.name


class Stock(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stocks')
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name='stocks')
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    batch_number = models.CharField(max_length=50, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['product', 'warehouse', 'batch_number']
        ordering = ['warehouse', 'product']

    def __str__(self):
        return f"{self.product} @ {self.warehouse}: {self.quantity}"


class Movement(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Черновик'),
        ('pending', 'На согласовании'),
        ('approved', 'Проведен'),
        ('cancelled', 'Отменен'),
    ]

    type = models.ForeignKey(MovementType, on_delete=models.PROTECT)
    warehouse = models.ForeignKey(Warehouse, on_delete=models.PROTECT)
    counterparty = models.ForeignKey(Counterparty, on_delete=models.SET_NULL, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    date = models.DateTimeField()
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Движение #{self.id} - {self.type}"


class MovementItem(models.Model):
    movement = models.ForeignKey(Movement, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.product} x {self.quantity}"