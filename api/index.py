"""
Vercel Python Serverless Function — Django WSGI Application
Vercel detects the 'app' variable and uses it as WSGI handler.
"""
import os
import sys

# Add Django backend to Python path
BACKEND_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "mk", "mk", "Fittrack", "django_backend")
sys.path.insert(0, BACKEND_DIR)

# Set Django settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "fittrack.settings")

# Setup Django
import django
django.setup()

# Get WSGI application
from django.core.wsgi import get_wsgi_application

app = get_wsgi_application()
