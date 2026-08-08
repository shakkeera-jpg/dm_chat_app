from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .serializers import LoginSerializer, RegisterSerializer


def token_response(user, response_status=status.HTTP_200_OK):
    refresh = RefreshToken.for_user(user)
    return Response({'user': {'id': user.id, 'username': user.username}, 'access': str(refresh.access_token), 'refresh': str(refresh)}, status=response_status)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        async_to_sync(get_channel_layer().group_send)('online_users', {
            'type': 'user_registered',
            'user': {'id': user.id, 'username': user.username},
        })
        return token_response(user, status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return token_response(serializer.validated_data['user'])
