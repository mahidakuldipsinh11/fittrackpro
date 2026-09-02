from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path, re_path
from django.views.generic import TemplateView
from django.urls import path, include 

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("store.urls")),
    path("api/auth/", include("accounts.urls")),
]

# Static files serve karo (dev me)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# SPA catch-all — sabse aakhir me, taaki admin/api/static routes isse pehle match ho jayein
urlpatterns += [
    re_path(r"^(?!admin/|api/|static/).*$", TemplateView.as_view(template_name="index.html")),
]