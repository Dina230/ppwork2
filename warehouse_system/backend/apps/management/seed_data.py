from django.core.management.base import BaseCommand
from apps.users.models import User
from apps.catalog.models import Category, Unit, Product
from apps.warehouse.models import Warehouse, Counterparty, MovementType, Stock, Movement, MovementItem
from django.utils import timezone
from datetime import timedelta


class Command(BaseCommand):
    help = 'Создание тестовых данных'

    def handle(self, *args, **options):
        # Пользователи
        admin = User.objects.create_user('admin', 'admin@test.com', 'admin123', role='admin')
        manager = User.objects.create_user('manager', 'manager@test.com', 'manager123', role='manager')
        user = User.objects.create_user('user', 'user@test.com', 'user123', role='user')

        self.stdout.write('✓ Пользователи созданы')

        # Единицы измерения
        units = [
            {'name': 'Штука', 'code': 'шт'},
            {'name': 'Килограмм', 'code': 'кг'},
            {'name': 'Метр', 'code': 'м'},
            {'name': 'Литр', 'code': 'л'},
        ]
        for u in units:
            Unit.objects.get_or_create(**u)

        self.stdout.write('✓ Единицы измерения созданы')

        # Категории
        cat1 = Category.objects.create(name='Электроника')
        cat2 = Category.objects.create(name='Мебель')
        cat3 = Category.objects.create(name='Инструменты')

        self.stdout.write('✓ Категории созданы')

        # Товары
        products = [
            {'name': 'Ноутбук', 'sku': 'ELEC-001', 'category': cat1, 'min_stock': 5, 'price': 50000},
            {'name': 'Мышь', 'sku': 'ELEC-002', 'category': cat1, 'min_stock': 20, 'price': 500},
            {'name': 'Стол', 'sku': 'FURN-001', 'category': cat2, 'min_stock': 3, 'price': 15000},
            {'name': 'Стул', 'sku': 'FURN-002', 'category': cat2, 'min_stock': 10, 'price': 3000},
            {'name': 'Дрель', 'sku': 'TOOL-001', 'category': cat3, 'min_stock': 5, 'price': 4500},
        ]

        for p in products:
            Product.objects.get_or_create(**p)

        self.stdout.write('✓ Товары созданы')

        # Склады
        w1 = Warehouse.objects.create(name='Основной склад', address='г. Москва, ул. Ленина 1', manager=admin)
        w2 = Warehouse.objects.create(name='Склад №2', address='г. Москва, ул. Пушкина 10', manager=manager)

        self.stdout.write('✓ Склады созданы')

        # Контрагенты
        Counterparty.objects.create(name='ООО Поставщик', type='supplier', inn='1234567890')
        Counterparty.objects.create(name='ИП Покупатель', type='customer', inn='0987654321')

        self.stdout.write('✓ Контрагенты созданы')

        # Типы движений
        MovementType.objects.create(name='Приход', code='IN')
        MovementType.objects.create(name='Расход', code='OUT')
        MovementType.objects.create(name='Перемещение', code='MOVE')
        MovementType.objects.create(name='Списание', code='WRITE')

        self.stdout.write('✓ Типы движений созданы')

        # Остатки
        for product in Product.objects.all():
            Stock.objects.create(product=product, warehouse=w1, quantity=100)
            Stock.objects.create(product=product, warehouse=w2, quantity=50)

        self.stdout.write('✓ Остатки созданы')

        # Движения
        mt_in = MovementType.objects.get(code='IN')
        Movement.objects.create(
            type=mt_in,
            warehouse=w1,
            created_by=admin,
            status='approved',
            date=timezone.now() - timedelta(days=5)
        )

        self.stdout.write(self.style.SUCCESS('✓ Все тестовые данные созданы!'))
        self.stdout.write(self.style.SUCCESS('\nТестовые логины:'))
        self.stdout.write('admin / admin123')
        self.stdout.write('manager / manager123')
        self.stdout.write('user / user123')