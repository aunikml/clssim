# Classroom Simulator — Django Backend

Modular Django REST Framework and Django Channels backend for the Classroom Simulator.

## Architecture & Apps

- `apps/accounts`: Custom `User` model with UUID primary keys and Simple JWT authentication.
- `apps/participants`: `ParticipantProfile` with display names and avatar identifiers.
- `apps/classrooms`: `Classroom` model with structured JSON configuration for 3D coordinate space.
- `apps/sessions`: `ClassroomSession` and `SessionParticipant` models managing session lifecycle and dynamic role assignment (`facilitator`, `teacher`, `student`).
- `apps/seating`: `ClassroomSeat` and `SessionSeatReservation` models featuring transactional seat reservations with `select_for_update()` row locking.
- `apps/realtime`: Channels WebSocket consumer at `/ws/classrooms/sessions/<session_id>/`, JWT query-param middleware, and room broadcast logic.
- `common`: Standard permissions (`IsFacilitatorOrReadOnly`, `IsSessionMember`), standardized exception handling, and pagination.

## Environment Variables

Copy `.env.example` to `.env`:

```env
SECRET_KEY=dev-secret-key-change-in-production-classsim-2026
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# Set USE_SQLITE=False for PostgreSQL (e.g. in Docker)
USE_SQLITE=True
DB_NAME=classroom_simulator
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# Set USE_IN_MEMORY_CHANNEL_LAYER=False when Redis is running
USE_IN_MEMORY_CHANNEL_LAYER=True
REDIS_URL=redis://localhost:6379/0

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7
```

## Running Unit Tests

```powershell
.\venv\Scripts\python.exe manage.py test apps.accounts apps.classrooms apps.sessions.tests apps.seating
```
