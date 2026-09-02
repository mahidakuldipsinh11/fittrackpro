"""
Vercel Serverless Function — Django WSGI application
Vercel auto-detects the 'app' variable as a WSGI application.
"""
import os
import sys

# Path setup
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(BASE_DIR, "mk", "mk", "Fittrack", "django_backend")
sys.path.insert(0, BACKEND_DIR)

# Set Django settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "fittrack.settings")

import django
django.setup()

from django.core.wsgi import get_wsgi_application
from django.contrib.staticfiles.handlers import StaticFilesHandler

app = StaticFilesHandler(get_wsgi_application())
