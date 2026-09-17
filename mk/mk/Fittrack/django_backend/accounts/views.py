from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import (
    ConfirmPasswordResetSerializer,
    LoginSerializer,
    RegisterSerializer,
    RequestPasswordResetSerializer,
    UserSerializer,
)


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


class RequestPasswordResetView(APIView):
    """POST /api/auth/password-reset/ — email bhejo aur reset link generate karo."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RequestPasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        user = None
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            user = None

        # Security: hamesha same message do, chahe email exist kare ya na kare.
        if user and user.is_active:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_url = f"{settings.SITE_URL}/reset-password/{uid}/{token}"

            import logging as _log_mod
            import threading
            _log = _log_mod.getLogger('store.email')

            def _send_reset(user, url):
                try:
                    from store.email_utils import send_password_reset_email
                    sent = send_password_reset_email(user, url)
                    if sent:
                        _log.info(f'Password reset email sent to {user.email}')
                    else:
                        _log.warning(f'Password reset email NOT sent to {user.email}')
                except Exception as e:
                    _log.error(f'Password reset email failed for {user.email}: {e}')

            threading.Thread(target=_send_reset, args=(user, reset_url), daemon=True).start()

        return Response(
            {"detail": "If an account exists with this email, a password reset link has been sent to it."},
            status=status.HTTP_200_OK,
        )


class ConfirmPasswordResetView(APIView):
    """POST /api/auth/password-reset/confirm/ — link se new password set karo."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ConfirmPasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            uid = urlsafe_base64_decode(data["uid"]).decode()
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            user = None

        if not user or not user.is_active or not default_token_generator.check_token(user, data["token"]):
            return Response(
                {"detail": "The password reset link is invalid or has expired. Please request a new one."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(data["new_password"])
        user.save(update_fields=["password"])

        return Response({"detail": "Your password has been reset successfully. You can now login."})


class EmailHealthView(APIView):
    """Diagnostic: live SMTP test. Returns which backend is active and the real send error (if any)."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        import socket
        from django.core.mail import send_mail

        to = request.data.get("to") or settings.EMAIL_HOST_USER
        if "@gmail.com" not in to.lower():
            to = settings.EMAIL_HOST_USER

        info = {
            "email_backend": settings.EMAIL_BACKEND,
            "email_host": settings.EMAIL_HOST,
            "email_host_user": settings.EMAIL_HOST_USER,
            "host_password_set": bool(settings.EMAIL_HOST_PASSWORD),
            "dns": [],
            "network_tests": {},
        }

        # 1) DNS resolution of smtp.gmail.com
        try:
            resolved = socket.getaddrinfo("smtp.gmail.com", 587)
            for entry in resolved[:6]:
                family = "IPv6" if entry[0] == socket.AF_INET6 else "IPv4"
                info["dns"].append(f"{family}:{entry[4][0]}")
        except Exception as e:
            info["dns"].append(f"dns-error: {e}")

        # 2) General egress tests (IPv4 + IPv6)
        tests = [
            ("google-8.8.8.8:53", "8.8.8.8", 53),
            ("gmail-smtp587", "smtp.gmail.com", 587),
            ("gmail-smtp465", "smtp.gmail.com", 465),
            ("gmail-smtp25", "smtp.gmail.com", 25),
            ("outlook-smtp587", "smtp.office365.com", 587),
        ]
        for label, host, port in tests:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(10)
            try:
                sock.connect((host, port))
                info["network_tests"][label] = "connected"
            except Exception as e:
                info["network_tests"][label] = f"{type(e).__name__}: {e}"
            finally:
                sock.close()

        # 3) Actual send_mail attempt
        try:
            send_mail(
                "FitTrack SMTP Live Test",
                "If you receive this, live SMTP works.",
                settings.DEFAULT_FROM_EMAIL,
                [to],
                fail_silently=False,
            )
            info["result"] = "sent"
        except Exception as e:
            info["result"] = "failed"
            info["error"] = str(e)

        return Response(info, status=status.HTTP_200_OK)