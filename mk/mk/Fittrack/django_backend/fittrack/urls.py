import os
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path, re_path
from django.views.generic import TemplateView
from django.views.static import serve as static_serve

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

# SPA catch-all
urlpatterns += [
    re_path(r"^(?!admin/|api/|static/|product_images/).*$", TemplateView.as_view(template_name="index.html")),
]
