#!/bin/sh
# Démarrage à distance : migrations (et optionnellement données démo) puis Gunicorn.
set -e
python manage.py migrate --noinput
if [ -n "$RUN_LOAD_DEMO_DATA" ] && [ "$RUN_LOAD_DEMO_DATA" = "1" ]; then
  python manage.py load_demo_data || true
fi
exec gunicorn config.wsgi --bind 0.0.0.0:${PORT:-8000}
