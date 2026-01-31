# Rental Management Backend (Django)

Quick start:

1. Create a virtual environment and install dependencies:

   python -m venv .venv
   .\.venv\Scripts\activate   (Windows)
   pip install -r requirements.txt

2. Configure Postgres environment variables (optional). By default the app uses SQLite for quick start.

3. Run migrations and create a superuser:

   python manage.py migrate
   python manage.py createsuperuser

4. Run the server:

   python manage.py runserver

5. API endpoints (example):
   - GET /api/properties/
   - GET /api/tenants/
   - GET /api/payments/
   - GET /api/maintenance/
   - GET /api/auth/me/

CORS is enabled for common frontend dev ports in `rental_backend/settings.py`.
