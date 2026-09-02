web: cd mk/mk/Fittrack/django_backend && python manage.py migrate --noinput && python manage.py collectstatic --noinput && gunicorn fittrack.wsgi:application --bind 0.0.0.0:$PORT
