<p align="center">
  <img src="assets/Project%20logo.png" alt="CareerQuest logo" width="160" />
</p>

<h1 align="center">CareerQuest</h1>

<p align="center">
  <em>Measure your career readiness, discover skill gaps, and get guidance on the roles that fit you.</em>
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white" />
  <img alt="Express" src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" />
  <img alt="SQLite" src="https://img.shields.io/badge/SQLite-better--sqlite3-003B57?logo=sqlite&logoColor=white" />
  <img alt="Node" src="https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs&logoColor=white" />
</p>

---

## Overview

**CareerQuest** (shown in the app as *Career Compass*) is a full-stack career-guidance web app. A user builds a profile, completes a guided assessment covering education, experience, skills, certifications, projects and career preferences, and receives a readiness dashboard that highlights how they stack up against their target roles and where the skill gaps are.

## Features

- **Secure accounts**: registration and login with bcrypt-hashed passwords and JWT sessions (7-day expiry); change-password and security pages.
- **Guided assessment**: a multi-section form covering user details, education, work experience, skills, languages, certifications, projects, target roles, locations and work constraints, saved in a single database transaction.
- **Career Readiness Dashboard**: summarises your profile, preferences and constraints (work authorization, employment type, work mode, experience level).
- **Role and skill-gap data model**: career roles, per-role skill requirements, assessment runs, role assessment results, recommendations and skill gaps.
- **Profile and settings**: edit personal information, resume details and career preferences.
- **Career Advisor and Mock Interview**: AI-powered guidance and interview practice (planned; placeholder pages in place).
- **REST API**: about 25 resource routes under `/api`, plus a `/api/health` check.

## Tech stack

| Layer     | Technology                                                        |
| --------- | ----------------------------------------------------------------- |
| Frontend  | React 18, React Router 6, Vite 5, Font Awesome                    |
| Backend   | Node.js, Express 4, JWT (`jsonwebtoken`), `bcryptjs`, `uuid`, CORS |
| Database  | SQLite via `better-sqlite3` (WAL mode, foreign keys on)           |
| Packaging | Docker, Nginx (static frontend and API proxy)                     |

## Project structure

```text
careerquest/
├── assets/                 # Project logo
├── backend/
│   ├── src/
│   │   ├── index.js        # Express app and route wiring
│   │   ├── db.js           # SQLite setup, schema, seed, async pool shim
│   │   ├── routes/         # auth, assessment, profiles, skills, roles, gaps, ...
│   │   └── utils/crud.js   # Shared CRUD helper
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/          # Dashboard, Assessment, Profile, Settings, Security, ...
│   │   ├── components/     # AvatarMenu, MultiSelect
│   │   ├── context/        # AuthContext
│   │   └── api/client.js   # Authenticated fetch wrapper
│   ├── nginx.conf
│   └── Dockerfile
├── database/schema.sql     # Reference relational schema (21 tables)
├── dashboard.html/.css/.js # Original static dashboard prototype
├── assessment.html/.css/.js# Original static assessment prototype
└── docker-compose.yml
```

## Getting started

### Prerequisites

- Node.js 18+ (20 recommended) and npm

### 1. Clone

```bash
git clone https://github.com/alexbaracat/careerquest.git
cd careerquest
```

### 2. Start the API (port 4000)

```bash
cd backend
cp .env.example .env     # then set JWT_SECRET to a long random string
npm install
npm run dev              # or: npm start
```

The SQLite database file is created automatically on first run. Set `DB_PATH` in `.env` to change its location.

### 3. Start the frontend (port 3000)

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:3000>. Vite proxies `/api` requests to `http://localhost:4000`.

### Demo account

On first run a demo user is seeded so you can look around right away:

```text
email:    demo@careercompass.com
password: demo123
```

> Change or remove the seeded account before any real deployment.

## API at a glance

All routes are prefixed with `/api`. Most require `Authorization: Bearer <jwt>`.

| Area       | Routes                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------ |
| Auth       | `POST /auth/register`, `POST /auth/login`                                                  |
| Assessment | `POST /assessment/submit`, `/assessment-runs`, `/role-assessment-results`                  |
| Profile    | `/user`, `/users`, `/profiles`, `/education`, `/experience`, `/certifications`, `/projects` |
| Skills     | `/skills`, `/skill-categories`, `/profile-skills`, `/profile-languages`, `/skill-gaps`     |
| Roles      | `/career-roles`, `/role-skill-requirements`, `/role-recommendations`                       |
| Preferences| `/preferences`, `/preference-constraints`, `/preferred-roles`, `/preferred-locations`      |
| Health     | `GET /health`                                                                              |

## Roadmap

- [ ] AI Career Advisor chat
- [ ] AI Mock Interview practice
- [ ] Role recommendations and skill-gap scoring surfaced on the dashboard
- [ ] Screenshots and a live demo

## Author

**Alexandre Baracat**: [GitHub](https://github.com/alexbaracat)
