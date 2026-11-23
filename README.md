# Classroom Simulator — Phase 1: React Foundation to Traditional 3D Classroom

Browser-based, immersive **Classroom Simulator** for teacher education and professional development.

Built with a **React Three Fiber / Three.js** stylized 3D frontend and a modular **Django REST Framework & Channels** backend.

---

## 🎨 Visual Direction & Design

- **Stylized 3D Aesthetic**: Polished, warm, low-poly geometry designed for smooth 60fps performance on standard laptops.
- **Warm & Welcoming Educational Atmosphere**: Natural beech wood desks, warm hardwood floor, soft sage wainscoting, creamy walls, and a prominent dark green chalkboard.
- **Accurate Proportions**: Standard classroom dimensions (20m width × 16m length × 5m height).
- **Enclosed Traditional Shell**: Floor with baseboards, four walls with natural window bays, entrance door with brass handle, and an optional ceiling toggle.
- **20-Seat Structured Layout**: Data-driven 4-row × 5-column seating system (`R1-S1` through `R4-S5`) facing the blackboard with clear walking aisles.
- **Front Teaching Area**: Large blackboard with lesson agenda and formulas, teacher desk with laptop, books and stationery props, teacher armchair, and a stylized low-poly teacher avatar.

---

## 🛠️ Technology Stack

### Frontend
- **React 18** with **Vite 6**
- **Three.js** & **React Three Fiber (R3F)**
- **@react-three/drei** (OrbitControls, Html annotations, Text rendering)
- **Material UI (MUI v6)** with custom dark educational theme
- **Framer Motion** for smooth UI transitions
- **Zustand** for centralized application & session state management
- **Axios** with JWT auto-refresh interceptors

### Backend
- **Python 3.12+** & **Django 5.2**
- **Django REST Framework (DRF)**
- **Django Channels 4** & **Daphne ASGI**
- **PostgreSQL** (production & Docker) / **SQLite** (instant local development)
- **Redis** channel layer (with InMemory fallback for zero-dependency local dev)
- **djangorestframework-simplejwt** for JWT authentication

---

## 📁 Project Architecture

```text
classsim/
├── backend/
│   ├── config/
│   │   ├── settings/
│   │   │   ├── base.py              # Base Django, DRF, JWT, Channels settings
│   │   │   ├── development.py       # Development configuration
│   │   │   └── production.py        # Production container settings
│   │   ├── urls.py                  # API v1 routes & health check
│   │   ├── asgi.py                  # ASGI ProtocolTypeRouter (HTTP + WebSockets)
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── accounts/                # Custom User model & auth APIs
│   │   ├── participants/            # ParticipantProfile & avatar preferences
│   │   ├── classrooms/              # Classroom model & 3D layout config
│   │   ├── sessions/                # Session lifecycle & role assignment
│   │   ├── seating/                 # 20 ClassroomSeats & transactional reservations
│   │   └── realtime/                # Channels consumers, JWT middleware & routing
│   ├── common/                      # Permissions, custom exceptions, pagination
│   ├── requirements/                # base.txt, development.txt, production.txt
│   ├── venv/                        # Python virtual environment
│   ├── manage.py
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.jsx              # Main application shell
│   │   │   └── providers/           # MUI ThemeProvider
│   │   ├── features/classroom/
│   │   │   ├── components/
│   │   │   │   ├── ClassroomScene.jsx
│   │   │   │   ├── environment/     # Floor, Walls, Door, Windows, Ceiling, Lighting
│   │   │   │   └── furniture/       # Desks, Chairs, Blackboard, Bookshelf, Avatar
│   │   │   ├── canvas/
│   │   │   │   ├── ClassroomViewport.jsx  # R3F Canvas with shadows & tone mapping
│   │   │   │   └── ClassroomCamera.jsx    # OrbitControls & POV camera presets
│   │   │   └── ui/
│   │   │       ├── ClassroomTopBar.jsx    # Navigation, camera modes & live status
│   │   │       ├── ClassroomBottomBar.jsx # Seat info, reserve/release actions
│   │   │       ├── SessionControlsPanel.jsx # Facilitator session management
│   │   │       ├── AuthModal.jsx          # Sign In / Account creation modal
│   │   │       └── SceneLoadingScreen.jsx
│   │   ├── services/                # Axios API client, auth, seating & WebSockets
│   │   ├── store/                   # authStore, classroomStore, sessionStore
│   │   ├── theme/                   # Custom MUI design tokens
│   │   └── utils/                   # Config fallbacks & math helpers
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
│
├── docker-compose.yml               # Multi-container orchestration (Postgres, Redis, Backend, Frontend)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested with v24)
- Python 3.12+ (tested with v3.14)
- Docker & Docker Compose (optional for production containerized deployment)

---

### Running the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Activate the virtual environment:
   - **Windows PowerShell**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux**:
     ```bash
     source venv/bin/activate
     ```

3. Run migrations and seed sample data:
   ```bash
   python manage.py migrate
   python manage.py seed_classroom
   ```
   *This seeds a traditional classroom (`Traditional Classroom A101`), 20 student seats (`R1-S1`..`R4-S5`), an active session (`Interactive Pedagogy Practicum`), and demo users (`facilitator`, `teacher_john`, `student_alice`).*

4. Start the ASGI server (with WebSockets):
   ```bash
   daphne -b 0.0.0.0 -p 8000 config.asgi:application
   ```
   *(Or alternatively: `python manage.py runserver 8000`)*

5. Verify backend health:
   ```bash
   curl http://localhost:8000/api/v1/health/
   ```

---

### Running the Frontend

1. In a separate terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```

3. Open your browser at:
   ```text
   http://localhost:5173
   ```

---

### Running with Docker Compose (Production Environment)

To launch the full stack including PostgreSQL, Redis, ASGI Daphne backend, and Nginx frontend:

```bash
docker compose up --build
```

---

## 🔑 Demo User Accounts

All seeded demo accounts use the password: `password123`

| Username | Role | Display Name | Note |
| :--- | :--- | :--- | :--- |
| `facilitator` | Facilitator | Dr. Sarah Jenkins | Session admin, role assigner |
| `teacher_john` | Teacher | Teacher John | Active teacher standing at board |
| `student_alice` | Student | Alice Chen | Pre-assigned seat `R1-S1` |

*You can also click **"Sign In"** in the top-right corner of the web interface to use one-click quick logins or create a new participant account.*

---

## 🪑 3D Seating & Interaction Guide

1. **Camera Presets (Top Navigation Bar)**:
   - **Orbit**: Free 3D orbit inspection around the classroom.
   - **Teacher**: First-person perspective from the teacher's podium looking toward all students.
   - **Student**: First-person perspective from a middle student desk looking at the blackboard and teacher.
   - **Top-Down**: Orthographic-style architectural floor plan view.
2. **Ceiling Toggle**: Click the ceiling icon to toggle the enclosed acoustic ceiling on or off.
3. **Reserving a Seat**:
   - Hover your mouse over any student desk to see its unique identifier (`R1-S1`..`R4-S5`) and status.
   - Click a desk to select it.
   - Click **"Reserve This Seat"** on the bottom floating bar.
   - The seat instantly turns **Cyan (You)** and updates across all connected clients via WebSockets!
   - Selecting a new seat will automatically release your previous seat to prevent double-booking.

---

## 📡 REST API Reference (`/api/v1/`)

### Health
- `GET /api/v1/health/` — System health check (database & channel layer status).

### Authentication
- `POST /api/v1/auth/register/` — Register new participant user and profile.
- `POST /api/v1/auth/login/` — Simple JWT token obtain pair (`access`, `refresh`).
- `POST /api/v1/auth/refresh/` — Refresh access token.
- `POST /api/v1/auth/logout/` — Blacklist refresh token.
- `GET  /api/v1/auth/me/` — Get authenticated user details & participant profile.
- `PATCH /api/v1/auth/me/` — Update profile, display name, avatar identifier.

### Classrooms
- `GET    /api/v1/classrooms/` — List classrooms with 3D dimensions and seat counts.
- `POST   /api/v1/classrooms/` — Create classroom (auto-generates 20 seats).
- `GET    /api/v1/classrooms/{id}/` — Retrieve classroom configuration.
- `PATCH  /api/v1/classrooms/{id}/` — Update classroom configuration.

### Sessions & Seating
- `GET    /api/v1/sessions/` — List active/scheduled sessions.
- `POST   /api/v1/sessions/` — Create session.
- `GET    /api/v1/sessions/{id}/` — Session detail with roster and active teacher.
- `POST   /api/v1/sessions/{id}/join/` — Join session (`role`: student/teacher).
- `POST   /api/v1/sessions/{id}/leave/` — Leave session.
- `POST   /api/v1/sessions/{id}/assign-role/` — Reassign participant role.
- `POST   /api/v1/sessions/{id}/start/` — Start session.
- `POST   /api/v1/sessions/{id}/pause/` — Pause session.
- `POST   /api/v1/sessions/{id}/complete/` — Complete session.
- `GET    /api/v1/sessions/{id}/seats/` — List all 20 seats with occupancy details.
- `POST   /api/v1/sessions/{id}/seats/reserve/` — Transactional seat reservation (`seat_identifier`).
- `POST   /api/v1/sessions/{id}/seats/release/` — Release currently held seat.

---

## ⚡ WebSocket Events (`/ws/classrooms/sessions/{session_id}/`)

Connections are authenticated via JWT token (`?token=<jwt_access_token>`).

Broadcast events include:
- `seat.reserved` — Payload contains `seat_id`, `participant_id`, `username`, `status: occupied`.
- `seat.released` — Payload contains `seat_id`, `status: available`.
- `participant.joined` / `participant.left`
- `role.changed` — Reassignment of teacher or student.
- `session.started` / `session.paused` / `session.completed`

---

## 🧪 Testing

### Backend Unit Tests
Execute the test suite with Django's test runner:
```bash
.\backend\venv\Scripts\python.exe backend/manage.py test apps.accounts apps.classrooms apps.sessions.tests apps.seating
```
*Tests cover registration, login, classroom seat generation, transactional seat reservation, duplicate booking rejection, seat switching, and session lifecycle transitions.*

### Frontend Production Build
```bash
cd frontend
npm run build
```
*Validates React Three Fiber components, Drei helpers, MUI integration, and bundles production assets.*
