# EOPANSE Voting Platform

> The official voting and membership portal for the **Event Organizers and Practitioners Association of Nigeria South/East (EOPANSE)**.

---

## Overview

EOPANSE Voting Platform is a full-stack web application that enables the association to run transparent, secure, and professional elections/votes among its members across the 11 South/East member states of Nigeria.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 (Vite), TailwindCSS 3, React Query, React Router |
| Charts | Recharts |
| Backend | Node.js, Express.js |
| ORM | Sequelize |
| Database | MySQL |
| Auth | JWT (JSON Web Tokens) |
| Email | Nodemailer |
| Password | bcryptjs |

---

## Project Structure

```
eopanse-voting/
├── client/                   # React frontend (Vite)
│   └── src/
│       ├── api/              # Axios API calls
│       ├── components/
│       │   ├── layout/       # Navbar, AdminSidebar, UserSidebar
│       │   └── ui/           # Reusable: Modal, Badge, StatCard, etc.
│       ├── context/          # AuthContext (JWT state)
│       ├── pages/
│       │   ├── admin/        # Dashboard, Users, Votes, Financials, Settings
│       │   └── user/         # Dashboard, Votes, VotePage, History, Profile
│       └── utils/            # Formatters, Nigerian states list
│
└── server/                   # Node.js/Express backend
    └── src/
        ├── config/           # Database, states config
        ├── controllers/      # authController, adminController, voteController
        ├── middleware/       # JWT auth middleware
        ├── models/           # Sequelize models
        ├── routes/           # auth, admin, votes
        └── services/         # emailService (Nodemailer)
```

---

## Features

### Landing Page
- Hero section with EOPANSE branding
- Animated marquee of all 11 member states
- About section, how-it-works, features, membership CTA
- Links to register, login, and admin portal

### Member Registration
- 2-step registration form
- All 37 Nigerian states with standard abbreviations
- **Auto-generated member codes** tied to state (e.g. `LA1`, `EN2`, `AN15`)
- Registration fee display with payment reference
- Email confirmation sent on registration

### Member Login & Dashboard
- Secure JWT login
- View all active and past votes
- Cast votes with live leaderboard (refreshes every 10 seconds)
- Vote history with breakdown per election and amounts spent
- Profile page with member code display and voting link

### Voting System
- Free or paid votes (configurable price per vote)
- Set start/end dates and deadlines
- Multiple vote options with images and descriptions
- Max votes per user limit (optional)
- Unique share token per vote for direct links
- Real-time percentage bars and leaderboard

### Admin Dashboard
- Overview stats: total members, revenue, active votes, votes cast
- Area chart for member growth (6 months)
- Bar chart for revenue growth (6 months)
- Active votes preview with time remaining

### Admin — Member Management
- Search and filter members by name, email, code, status
- View full member profile (info, payment history, vote records)
- Edit member details including state (auto-updates member code)
- Activate / Suspend / Delete members
- Send voting link to a member via email
- Copy member's voting link to clipboard

### Admin — Vote Management
- Create votes with dynamic options (add/remove), pricing, category, dates
- Edit vote details and change status (draft → active → ended)
- View per-option vote counts with progress bars
- Copy shareable vote link
- Delete votes

### Admin — Vote Results & Analytics
- Pie chart and bar chart of vote distribution
- Ranked leaderboard with medal icons (Gold / Silver / Bronze)
- Winner announcement banner for ended votes
- Top voters per option with vote count and amount spent
- Revenue per option
- **Printable vote results report**

### Admin — Financials
- Full payment transaction table
- Filter by type (registration/vote) and status
- Summary totals: registration revenue, vote revenue, total
- Manual payment confirmation (activates user account)
- **Printable financial report**

### Admin — Settings
- Edit admin name and email
- Change password with current password verification

### Email Notifications (Nodemailer)
- Registration pending confirmation
- Account activation welcome email with member code
- Voting link email with vote details and deadline

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- MySQL 8+

### 1. Clone the repository
```bash
git clone <repo-url>
cd eopanse-voting
```

### 2. Configure the backend
```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=eopanse_db
DB_USER=root
DB_PASSWORD=yourpassword
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASS=yourapppassword
EMAIL_FROM=noreply@eopanse.com.ng
CLIENT_URL=http://localhost:5173
REGISTRATION_FEE=5000
```

### 3. Create the database
```sql
CREATE DATABASE eopanse_db;
```

### 4. Install dependencies & start backend
```bash
cd server
npm install
npm run dev
```

> On first run, a default admin account is auto-created:
> - **Email:** `admin@eopanse.com.ng`
> - **Password:** `Admin@2024`

The database tables are created automatically via Sequelize sync.

### 5. Install dependencies & start frontend
```bash
cd client
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`
Backend runs at: `http://localhost:5000`

---

## Member Code System

Member codes are automatically generated from the member's state and a sequential number:

| State | Code | 1st Member | 2nd Member |
|-------|------|-----------|-----------|
| Lagos | LA | LA1 | LA2 |
| Enugu | EN | EN1 | EN2 |
| Anambra | AN | AN1 | AN2 |
| Rivers | RV | RV1 | RV2 |

All 37 Nigerian states are supported with their standard abbreviations.

---

## EOPANSE Member States

The 11 member states of EOPANSE:

| State | Code |
|-------|------|
| Abia | AB |
| Akwa Ibom | AK |
| Anambra | AN |
| Bayelsa | BY |
| Cross River | CR |
| Delta | DT |
| Ebonyi | EB |
| Edo | ED |
| Enugu | EN |
| Imo | IM |
| Rivers | RV |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new member |
| POST | `/api/auth/login` | Member login |
| POST | `/api/auth/admin/login` | Admin login |
| GET | `/api/auth/me` | Get current member |
| GET | `/api/auth/admin/me` | Get current admin |

### Admin (requires admin JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Analytics overview |
| GET | `/api/admin/financials` | Payment records |
| POST | `/api/admin/payments/confirm` | Confirm a payment |
| PUT | `/api/admin/profile` | Update admin profile |
| GET | `/api/admin/users` | List members |
| GET | `/api/admin/users/:id` | Member details |
| PUT | `/api/admin/users/:id` | Update member |
| POST | `/api/admin/users/:id/activate` | Activate member |
| POST | `/api/admin/users/:id/suspend` | Suspend member |
| DELETE | `/api/admin/users/:id` | Delete member |
| POST | `/api/admin/users/send-voting-link` | Email voting link |
| POST | `/api/admin/votes` | Create vote |
| GET | `/api/admin/votes` | List all votes |
| PUT | `/api/admin/votes/:id` | Update vote |
| DELETE | `/api/admin/votes/:id` | Delete vote |
| GET | `/api/admin/votes/:id/results` | Vote results & analytics |

### Votes (requires member JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/votes` | Active/recent votes |
| GET | `/api/votes/token/:token` | Vote by share token |
| POST | `/api/votes/cast` | Cast a vote |
| GET | `/api/votes/history` | Member's vote history |
| GET | `/api/votes/:id/leaderboard` | Live leaderboard |

---

## Production Deployment

1. Set `CLIENT_URL=https://eopanse.com.ng` in `server/.env`
2. Set `VITE_API_URL=https://api.eopanse.com.ng/api` in `client/.env`
3. Build frontend: `cd client && npm run build` — serves from `dist/`
4. Use PM2 or similar to run the backend in production
5. Configure your web server (Nginx/Apache) to serve the frontend build and proxy `/api` to the backend

---

## About EOPANSE

The **Event Organizers and Practitioners Association of Nigeria South/East (EOPANSE)** is the professional body for the Events Industry in the Southern and Eastern States of Nigeria.

**Mission:** To Promote, Grow and ensure Visibility of the Nigerian Eastern and Southern Event Industry, by Promoting Professionalism, Integrity, Confidence, Love and Brotherliness among all Event Vendors operating in all Member States.

**Values:** Integrity · Professionalism · Accountability · Innovation · Excellence · Growth · Stewardship · Sustainability

**Website:** [eopanse.com.ng](https://eopanse.com.ng)

---

© 2024 EOPANSE. All rights reserved.
