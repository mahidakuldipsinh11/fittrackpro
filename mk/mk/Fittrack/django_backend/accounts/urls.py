from django.urls import path

from .views import (
    ConfirmPasswordResetView,
    EmailHealthView,
    LoginView,
    MeView,
    RegisterView,
    RequestPasswordResetView,
    UserListView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("me/", MeView.as_view(), name="me"),
    path("users/", UserListView.as_view(), name="user-list"),
    path("password-reset/", RequestPasswordResetView.as_view(), name="password-reset"),
    path("password-reset/confirm/", ConfirmPasswordResetView.as_view(), name="password-reset-confirm"),
    path("email-health/", EmailHealthView.as_view(), name="email-health"),
]