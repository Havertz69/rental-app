# Rent Easy - Property Management System

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup (Django)

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv .venv
   .\.venv\Scripts\activate   (Windows)
   # or on Linux/Mac:
   source .venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   copy .env.example .env
   ```
   Edit `.env` file with your settings.

5. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

6. **Create superuser:**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start backend server:**
   ```bash
   python manage.py runserver
   ```

Backend will be available at `http://localhost:8000`

### Frontend Setup (React/Vite)

1. **Navigate to client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   copy .env.example .env
   ```
   Edit `.env` file if needed (defaults to `http://localhost:8000` for API).

4. **Start frontend server:**
   ```bash
   npm run dev
   ```

Frontend will be available at `http://localhost:5174`

## Issues Found and Fixed

### 1. Missing Environment Configuration
- **Problem**: No `.env` files for configuration
- **Solution**: Created `.env.example` files for both backend and frontend

### 2. Backend Dependencies
- **Status**: All required packages are properly listed in `requirements.txt`
- **Database**: Defaults to SQLite for easy setup, PostgreSQL support available

### 3. Frontend Dependencies
- **Status**: All modern React dependencies are properly configured
- **Build System**: Vite configuration is correct with proper path aliases

### 4. Database Migrations
- **Status**: Migrations are properly set up and ready to run
- **Models**: Property, Tenant, Payment, and MaintenanceRequest models are configured

### 5. API Integration
- **Status**: Frontend API client is properly configured to communicate with backend
- **Authentication**: JWT authentication is implemented with refresh token support

## API Endpoints

### Authentication
- `POST /api/auth/token/` - Login
- `POST /api/auth/token/refresh/` - Refresh token
- `GET /api/auth/me/` - Get current user info

### Properties
- `GET /api/properties/` - List properties
- `POST /api/properties/` - Create property
- `PUT /api/properties/{id}/` - Update property
- `DELETE /api/properties/{id}/` - Delete property

### Tenants
- `GET /api/tenants/` - List tenants
- `POST /api/tenants/` - Create tenant
- `PUT /api/tenants/{id}/` - Update tenant
- `DELETE /api/tenants/{id}/` - Delete tenant

### Payments
- `GET /api/payments/` - List payments
- `POST /api/payments/` - Create payment
- `PUT /api/payments/{id}/` - Update payment
- `DELETE /api/payments/{id}/` - Delete payment

### Maintenance Requests
- `GET /api/maintenance/` - List maintenance requests
- `POST /api/maintenance/` - Create maintenance request
- `PUT /api/maintenance/{id}/` - Update maintenance request
- `DELETE /api/maintenance/{id}/` - Delete maintenance request

## Running the Application

1. **Start the backend first:**
   ```bash
   cd backend
   .\.venv\Scripts\activate
   python manage.py runserver
   ```

2. **In a new terminal, start the frontend:**
   ```bash
   cd client
   npm run dev
   ```

3. **Access the application:**
   - Frontend: `http://localhost:5174`
   - Backend API: `http://localhost:8000`
   - Admin Panel: `http://localhost:8000/admin`

## Default Configuration

- **Backend**: Runs on port 8000
- **Frontend**: Runs on port 5174
- **Database**: SQLite (rental_app/backend/db.sqlite3)
- **Debug Mode**: Enabled for development

## Next Steps

1. Create initial admin user
2. Add sample properties and tenants
3. Test the full application flow
4. Configure production settings as needed
