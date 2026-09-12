from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import LoginSerializer, RegisterSerializer, UserSerializer


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = get_tokens_for_user(user)

        # Send welcome email in background (avoids blocking the response on slow/unreachable SMTP)
        import logging as _log_mod
        import threading
        _log = _log_mod.getLogger('store.email')

        def _send_welcome(user):
            try:
                from store.email_utils import send_welcome_email
                sent = send_welcome_email(user)
                if sent:
                    _log.info(f'Welcome email sent to {user.email}')
                else:
                    _log.warning(f'Welcome email NOT sent to {user.email}')
            except Exception as e:
                _log.error(f'Welcome email failed for {user.email}: {e}')

        threading.Thread(target=_send_welcome, args=(user,), daemon=True).start()

        return Response(
            {
                "user": UserSerializer(user).data,
                "token": tokens["access"],
                "refresh": tokens["refresh"],
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        tokens = get_tokens_for_user(user)

        # Send login notification email in background (avoids blocking response / SMTP hang)
        import logging as _log_mod
        import threading
        _log = _log_mod.getLogger('store.email')

        def _send_login_notification(user):
            try:
                from store.email_utils import send_login_notification_email
                sent = send_login_notification_email(user)
                if sent:
                    _log.info(f'Login email sent to {user.email}')
            except Exception as e:
                _log.error(f'Login email failed for {user.email}: {e}')

        threading.Thread(target=_send_login_notification, args=(user,), daemon=True).start()

        return Response(
            {
                "user": UserSerializer(user).data,
                "token": tokens["access"],
                "refresh": tokens["refresh"],
                "is_staff": user.is_staff,
            }
        )


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserListView(generics.ListAPIView):
    """Admin panel ke Customers tab ke liye — sirf staff/admin dekh sakte hain."""
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]