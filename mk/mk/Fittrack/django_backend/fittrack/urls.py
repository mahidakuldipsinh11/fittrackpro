import os
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path, re_path
from django.views.generic import TemplateView
from django.views.static import serve as static_serve
from django.http import JsonResponse, Http404

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("store.urls")),
    path("api/auth/", include("accounts.urls")),
]

# Static files serve karo (dev me)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Product images serve karo — works in both DEBUG and production
# urls.py: django_backend/fittrack/urls.py → need to reach Mk_demo/product_images
# BASE_DIR = django_backend (from settings), so 4 parents up = Mk_demo
PRODUCT_IMAGES_DIR = str(settings.BASE_DIR.parent.parent.parent.parent / "product_images")
if not os.path.exists(PRODUCT_IMAGES_DIR):
    # Fallback: relative to django_backend
    PRODUCT_IMAGES_DIR = str(settings.BASE_DIR.parent.parent.parent / "product_images")
if os.path.exists(PRODUCT_IMAGES_DIR):
    # Development: use static() helper
    if settings.DEBUG:
        urlpatterns += static('/product_images/', document_root=PRODUCT_IMAGES_DIR)
    else:
        # Production: custom view that serves product images
        def serve_product_image(request, path):
            file_path = os.path.join(PRODUCT_IMAGES_DIR, path)
            if os.path.isfile(file_path):
                return static_serve(request, path, document_root=PRODUCT_IMAGES_DIR)
            raise Http404
        urlpatterns += [
            re_path(r'^product_images/(?P<path>.+)$', serve_product_image, name='product-image'),
        ]

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

