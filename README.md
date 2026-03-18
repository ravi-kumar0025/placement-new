# IIT Patna Training & Placement Cell (TPC) Portal

<div align="center">

### 🌐 Live at **[tpc-pwj4.onrender.com](https://tpc-pwj4.onrender.com)**

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Render](https://img.shields.io/badge/Deployed_on-Render-46E3B7?logo=render&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

</div>

---

## Overview

The official Training and Placement Committee (TPC) portal for **IIT Patna**. A full-stack web application that connects **Students**, **Companies**, and **TPC Admins** — streamlining the recruitment lifecycle from announcement to placement.

## Key Features

| Role | Capabilities |
|------|-------------|
| **Students** | Dashboard with event calendar, announcements filtered by branch & program, resume management, profile editing, ID-card verification, and one-click event application tracking |
| **Companies** | Verification workflow, advanced student database search & filtering (CGPA, branch, graduation year), event-wise applicant view, and student profile access |
| **Admins** | Multi-tier RBAC (Super Admin / Announcement Admin / Student Admin), event & announcement CRUD, student & company verification queues, admin power assignment, and past recruiter management |
| **Public** | Landing page with placement statistics & charts, past recruiters showcase, and developers page |

### Additional Highlights
- 🔐 **Passwordless Auth** — OTP-based email login (no passwords to remember)
- 🌙 **Dark Mode** — Full dark theme support across all pages
- 📅 **Interactive Calendar** — Color-coded multi-day events with ±2 month navigation
- 📄 **Resume Builder** — Upload, manage, and generate PDF resumes
- ☁️ **Cloud Storage** — Cloudinary-backed image/file uploads (logos, ID cards, resumes)

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 + Vite | App framework & dev server |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Animations & transitions |
| React Big Calendar | Event calendar views |
| Recharts | Placement statistics charts |
| Axios | HTTP client (centralized via `api.js`) |
| React Router DOM | Client-side routing |
| React Parallax Tilt | 3D card effects |
| Lucide React | Icon library |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express 5 | REST API server |
| MongoDB + Mongoose 9 | Database & ODM |
| JWT + bcryptjs | Authentication & hashing |
| Cloudinary + Multer | File/image uploads & storage |
| Nodemailer | OTP email delivery |
| CORS | Cross-origin security |

## Project Structure

```
TPC/
├── backend/
│   ├── controllers/        # Business logic
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── calendarController.js
│   │   ├── companyController.js
│   │   ├── eventController.js
│   │   ├── pastRecruiterController.js
│   │   └── studentController.js
│   ├── models/             # Mongoose schemas
│   │   ├── User.js, Student.js, Company.js, Admin.js
│   │   ├── Event.js, Announcement.js, Otp.js
│   │   ├── PastRecruiter.js, Developer.js
│   │   └── HomePageStats.js
│   ├── routes/             # API endpoints
│   │   ├── authRoutes.js, adminRoutes.js
│   │   ├── studentRoutes.js, companyRoutes.js
│   │   ├── eventRoutes.js, pastRecruiterRoutes.js
│   │   └── developerRoutes.js
│   ├── middleware/         # JWT & RBAC middleware
│   ├── utils/              # Email & Cloudinary helpers
│   └── server.js           # Express app entry point
│
├── frontend/
│   ├── src/
│   │   ├── api.js           # Centralized Axios instance
│   │   ├── context/         # AuthContext (global auth state)
│   │   ├── pages/           # Route-level pages
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Login.jsx, Signup.jsx
│   │   │   ├── EditProfile.jsx, MyResumes.jsx
│   │   │   ├── PastRecruiters.jsx
│   │   │   └── DevelopersPage.jsx
│   │   ├── components/      # Reusable UI components
│   │   │   ├── DashboardShell.jsx
│   │   │   ├── StudentDashboard.jsx, StudentCalendar.jsx
│   │   │   ├── StudentAnnouncements.jsx
│   │   │   ├── CompanyDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── ManageAnnouncements.jsx
│   │   │   ├── StudentCalendarUpdate.jsx
│   │   │   ├── Student/CompanyVerificationQueue.jsx
│   │   │   ├── Student/CompanyVerificationForm.jsx
│   │   │   └── ...more
│   │   ├── hooks/           # Custom React hooks
│   │   └── assets/          # Images & static files
│   ├── .env.production      # Production API URL
│   └── vite.config.js
│
└── README.md
```

## Deployment

The application is deployed on **[Render](https://render.com)** as two separate services:

| Service | URL | Type |
|---------|-----|------|
| **Frontend** | [tpc-pwj4.onrender.com](https://tpc-pwj4.onrender.com) | Static Site |
| **Backend** | [tpc-backend-kyem.onrender.com](https://tpc-backend-kyem.onrender.com) | Web Service |

### Render Configuration

**Frontend (Static Site):**
- Root Directory: `TPC/frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`

**Backend (Web Service):**
- Root Directory: `TPC/backend`
- Build Command: `npm install`
- Start Command: `npm start`

> **Note:** Render free-tier services spin down after 15 minutes of inactivity. The first request may take 30–60 seconds to cold-start.

## Getting Started (Local Development)

### Prerequisites
- **Node.js** v18 or higher
- **MongoDB** instance (Atlas or local)
- **Cloudinary** account (for media storage)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd TPC
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in `backend/`:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   EMAIL_USER=your_smtp_email
   EMAIL_PASS=your_smtp_password
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```
   Start the backend:
   ```bash
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   ```
   Start the frontend:
   ```bash
   npm run dev
   ```
   The Vite dev server proxies `/api` requests to `http://localhost:5000` automatically.

## Running with Docker

The project is fully Dockerized. You can run the entire stack with a single command instead of managing two separate terminals.

### Prerequisites
- **Docker Desktop** installed and running ([Download](https://www.docker.com/products/docker-desktop/))
- A valid `backend/.env` file with all environment variables filled in

### Docker Project Structure

```
IT_workshop/
├── docker-compose.yml          # Orchestrates backend + frontend containers
├── backend/
│   ├── Dockerfile              # node:22-alpine + nodemon (dev server)
│   └── .dockerignore
└── frontend/
    ├── Dockerfile              # Multi-stage: node:22-alpine (build) → nginx:alpine (serve)
    ├── nginx.conf              # Proxies /api requests to backend container
    └── .dockerignore
```

### How it works

```
Browser → http://localhost
              │
          Nginx (port 80)
              │
    ┌─────────┴──────────┐
    │ /api/*             │ everything else
    ▼                    ▼
Backend container    React static files
(port 5000)          (dist/ folder)
```

Nginx serves the built React app and proxies all `/api` requests to the backend container. This avoids CORS issues since the forwarding is server-to-server.

### Commands

```bash
# First time / after code changes — build images and start containers
docker compose up --build

# Start in background (detached mode)
docker compose up -d

# Start without rebuilding (faster, use when code hasn't changed)
docker compose up

# Stop and remove containers
docker compose down

# View logs of a specific container
docker logs backend
docker logs frontend

# Check running containers
docker ps
```

### Verify it's running

| URL | Expected |
|-----|----------|
| `http://localhost` | React login page |
| `http://localhost:5000/health` | `{"status":"OK","message":"API is running"}` |

> **Note:** The first build takes 2–5 minutes as Docker downloads base images (`node:22-alpine`, `nginx:alpine`). Subsequent builds are significantly faster due to layer caching.

### Environment Variables


| Variable | Location | Purpose |
|----------|----------|---------|
| `PORT` | Backend `.env` | Server port (default: 5000) |
| `MONGO_URI` | Backend `.env` | MongoDB connection string |
| `JWT_SECRET` | Backend `.env` | Token signing secret |
| `EMAIL_USER` | Backend `.env` | SMTP email for OTPs |
| `EMAIL_PASS` | Backend `.env` | SMTP password / app password |
| `CLOUDINARY_CLOUD_NAME` | Backend `.env` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Backend `.env` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Backend `.env` | Cloudinary API secret |
| `VITE_API_URL` | Frontend `.env.production` | Production backend URL |

## API Architecture

All API routes are prefixed with `/api`:

| Prefix | Description |
|--------|-------------|
| `/api/auth` | Login, signup, OTP verification |
| `/api/student` | Student profile, announcements, calendar, verification, resume |
| `/api/company` | Company verification, student search, event applicants |
| `/api/admin` | User management, events CRUD, announcements CRUD, verification queues, power assignment |
| `/api/events` | Public event listing & student application |
| `/api/past-recruiters` | Past recruiter CRUD (public read, admin write) |
| `/api/developers` | Developer team info |

## Authorization & Security

- **JWT Authentication** — All protected routes require a valid Bearer token
- **Role-Based Access Control (RBAC)** — Super Admin, Announcement Admin, Student Admin, Student, Company
- **Company Approval Workflow** — Companies must be verified before accessing the student database
- **Student Verification** — Students upload institute ID cards, reviewed and approved by admins
- **CORS Protection** — Backend only accepts requests from the deployed frontend and localhost

## Acknowledgements

Designed and developed for the **Training and Placement Cell, IIT Patna**.
