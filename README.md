Darukaa — Mapping & Site Management
==================================

Overview
--------
Darukaa is a Django + React app for managing projects and mapping sites as GeoJSON polygons.

Features
--------
- User registration and JWT authentication
- Projects CRUD
- Sites CRUD (GeoJSON stored in JSONField)
- Map with Mapbox GL and Mapbox Draw
- Dashboard with charts

Tech
----
- Backend: Django, Django REST Framework, djangorestframework-simplejwt
- Frontend: React, Vite, Mapbox GL, Mapbox Draw, Chart.js

Local setup
-----------
Backend

1. Create a Python virtualenv and install dependencies.

```bash
python -m venv env
env\Scripts\activate
pip install -r requirements.txt
```

2. Run migrations and create a superuser

```bash
python manage.py migrate
python manage.py createsuperuser
```

3. Run server

```bash
python manage.py runserver
```

Frontend

1. Create a `.env` file in `frontend/` based on `.env.example` and set `VITE_MAPBOX_TOKEN` and `VITE_API_URL`.
2. Install and build

```bash
cd frontend
npm install
npm run build
npm run dev  # for development
```

Environment variables
---------------------
- `VITE_API_URL` — backend API base URL (default: `http://127.0.0.1:8000/api`)
- `VITE_MAPBOX_TOKEN` — Mapbox public token (DO NOT COMMIT)

API Endpoints
-------------
- `POST /api/auth/register/` — register new user
- `POST /api/auth/login/` — obtain JWT tokens
- `GET/POST/PUT/DELETE /api/projects/` — projects API
- `GET/POST/PUT/DELETE /api/sites/` — sites API (expects `geojson` field for polygons)

Project structure
-----------------
- `projects/` — Django app with models, serializers, views, tests
- `frontend/` — React app

Tests
-----
Run Django tests:

```bash
python manage.py test
```

Build
-----
Frontend build:

```bash
cd frontend
npm run build
```
