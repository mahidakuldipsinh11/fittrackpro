import os
import sys

# Add django_backend to path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(BASE_DIR, "mk", "mk", "Fittrack", "django_backend")
sys.path.insert(0, BACKEND_DIR)

# Set settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "fittrack.settings")

import django
django.setup()

from django.core.wsgi import get_wsgi_application
from django.contrib.staticfiles.handlers import StaticFilesHandler

application = StaticFilesHandler(get_wsgi_application())

def handler(request, response):
    return application(request)
