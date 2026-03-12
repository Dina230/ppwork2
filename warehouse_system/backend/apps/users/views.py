from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User
from .serializers import UserSerializer, UserCreateSerializer, CustomTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


class IsAdminPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['role', 'is_active']
    search_fields = ['username', 'email']
    ordering_fields = ['username', 'created_at']

    def get_permissions(self):
        if self.action in ['create']:
            return [permissions.AllowAny()]
        elif self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdminPermission()]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def change_role(self, request, pk=None):
        if not request.user.is_admin:
            return Response({'error': 'Только администратор может менять роли'}, status=403)

        user = self.get_object()
        new_role = request.data.get('role')

        if new_role not in dict(User.ROLE_CHOICES):
            return Response({'error': 'Неверная роль'}, status=400)

        user.role = new_role
        user.save()
        return Response(UserSerializer(user).data)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer