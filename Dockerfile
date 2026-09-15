# =====================================================================
# FitTrack Pro — Dockerfile (multi-stage)
#   Stage 1: Node builds the React/Vite frontend -> dist/
#   Stage 2: Python runtime serves Django API + built frontend (SPA)
# Build:     docker build -t fittrack .
# Run:       docker compose up --build   (easiest way)
# =====================================================================

# ---------- Stage 1: Frontend build ----------
FROM node:20-alpine AS frontend

WORKDIR /build/mk/mk/Fittrack

# Install deps first (better layer caching)
COPY mk/mk/Fittrack/package.json mk/mk/Fittrack/package-lock.json ./
RUN npm ci

# Build the app
COPY mk/mk/Fittrack/ ./
RUN npm run build

# ---------- Stage 2: Django runtime ----------
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    PYTHONPATH=/app/mk/mk/Fittrack/django_backend

WORKDIR /app

# Install Python dependencies
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Backend source (+ product_images inside django_backend)
COPY mk/mk/Fittrack/django_backend /app/mk/mk/Fittrack/django_backend

# Built frontend from stage 1
COPY --from=frontend /build/mk/mk/Fittrack/dist /app/mk/mk/Fittrack/dist

# Entrypoint (migrate -> superuser -> seed -> gunicorn)
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

WORKDIR /app/mk/mk/Fittrack/django_backend

EXPOSE 8000

CMD ["/app/docker-entrypoint.sh"]