import os
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path, re_path
from django.views.generic import TemplateView
from django.views.static import serve as static_serve
from django.http import JsonResponse

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("store.urls")),
    path("api/auth/", include("accounts.urls")),
]

# Static files serve karo (dev me)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Product images serve karo
PRODUCT_IMAGES_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "product_images"
)
if os.path.exists(PRODUCT_IMAGES_DIR):
    urlpatterns += static('/product_images/', document_root=PRODUCT_IMAGES_DIR)

# SPA catch-all — only serve index.html if the template actually exists
_template_dirs = settings.TEMPLATES[0].get("DIRS", [])
_has_index = any(
    os.path.exists(os.path.join(str(d), "index.html")) for d in _template_dirs
)

if _has_index:
    urlpatterns += [
        re_path(r"^(?!admin/|api/|static/|product_images/).*$", TemplateView.as_view(template_name="index.html")),
    ]
else:
    # Backend-only mode (no frontend build present)
    def api_root(request):
        return JsonResponse({"status": "ok", "message": "FitTrack API is running. Use /api/ endpoints."})
    urlpatterns += [
        re_path(r"^$", api_root),
    ]

