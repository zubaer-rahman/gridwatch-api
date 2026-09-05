<div align="center">
  <h1>⚡ GridWatch API</h1>
  <p>An enterprise-grade Power Grid Outage & Infrastructure Management System</p>
  
  ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
  ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
  ![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
  ![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
  ![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
</div>

---

## 📖 Overview

**GridWatch** is a robust, scalable Node.js API designed for modern power infrastructure management. It handles complex load-shedding schedules, intelligent outage reporting, operator crew assignments, real-time notifications, and premium payment gateways through a highly structured and completely isolated architectural pattern.

## ✨ Key Features

- **🛡️ Advanced RBAC & Security**: Strict JWT-based authentication featuring `CUSTOMER`, `OPERATOR`, and `ADMIN` roles, heavily utilizing HTTP-only cookies and intelligent rate limiting.
- **🗺️ Granular Infrastructure Routing**: Complete management of Zones, Substations, Feeders, and localized Service Areas.
- **🚨 Outage State Machine**: Immutable, event-driven state transitions (`REPORTED` → `ACKNOWLEDGED` → `ASSIGNED` → `IN_PROGRESS` → `RESTORED`).
- **💸 Tokenized Payment Gateway**: Full `bKash` sandbox integration featuring automated token caching via Redis and secure callback validation for processing priority outage reports.
- **📅 Conflict-Free Schedules**: Advanced load shedding time-block detection preventing overlapping or mathematically impossible schedules.
- **📊 Admin Control Center**: Super-admin endpoints for user deactivation, system-wide analytics dashboards, and an unalterable `AuditLog` history viewer.

---

## 🛠️ Technology Stack

- **Framework**: Express.js (TypeScript)
- **Database**: PostgreSQL (Managed via Prisma ORM)
- **Caching & Rate Limiting**: Redis
- **Authentication**: JWT, bcrypt
- **Validation**: Zod (Schema-driven request parsing)
- **Code Quality**: Biome (Formatter & Linter)

---

## 🚀 Quick Start

### 1. Prerequisites
Ensure you have the following installed:
- **Node.js** (v18+)
- **PostgreSQL**
- **Redis Server**

### 2. Installation

Clone the repository and install dependencies:
```bash
git clone https://github.com/zubaer-rahman/gridwatch-api.git
cd gridwatch-api
npm install
```

### 3. Environment Configuration
Copy the `.env.example` file to create your local `.env`:
```bash
cp .env.example .env
```
Ensure you provide valid credentials for `DATABASE_URL`, `REDIS_URL`, your JWT secrets, and the `bKash` sandbox keys.

### 4. Database Setup
Push the Prisma schema to synchronize your PostgreSQL database:
```bash
npx prisma db push
```

### 5. Running the Application
Start the development server with hot-reloading:
```bash
npm run dev
```

Build and run in production mode:
```bash
npm run build
npm start
```

---

## 📂 Project Structure

```text
src/
├── app.ts                 # Express initialization
├── config/                # Environment variables parsing
├── lib/                   # Database & Redis clients
├── middlewares/           # Global Error Handler, Auth, Validation
├── modules/               # Feature-based modular domains
│   ├── admin/             # Analytics & Audit Logging
│   ├── area/              # Localized Area tracking
│   ├── assignment/        # Operator Crew Assignments
│   ├── auth/              # JWT & Registrations
│   ├── feeder/            # Feeder Lines
│   ├── notification/      # User Alerts
│   ├── outage/            # Outage state machine
│   ├── payment/           # bKash integration
│   ├── report/            # Customer Outage Reporting
│   ├── schedule/          # Load Shedding Schedules
│   ├── substation/        # Electrical Substations
│   ├── user/              # User profiles
│   └── zone/              # Macro Geographic Zones
├── routes/                # Central API Router
└── utils/                 # AppError, catchAsync, sendResponse
```

---

## 📜 API Documentation & Versioning

All API routes are prefixed under `/api/v1`. 

### Standardized Response Structure
**Success Payload**:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Payload**:
```json
{
  "success": false,
  "message": "Validation Error",
  "errorSources": [ ... ]
}
```

---

## 🔐 Licensing
Proprietary / Assignment Submission. All rights reserved.
