# 🏦 Digital Banking API Platform

An enterprise-style digital banking system built with a microservices architecture, a React frontend, WSO2 API Manager as the gateway, PostgreSQL for persistence, Redis for caching and token/session support, and Docker for local orchestration.

This repository contains:
- Customer web experience
- Admin portal
- Developer portal
- API gateway setup for WSO2
- Multiple Node.js microservices
- PostgreSQL schema and seed data
- Docker Compose stack for local development

---

## 🧭 Overview

The application is designed so the frontend never talks directly to the backend services in production-style deployment. Requests flow through WSO2 API Manager, which handles:
- API routing
- OAuth2 / JWT validation
- throttling and rate limiting
- API publishing and governance
- analytics and subscriptions

The backend is split into focused services:
- Auth service
- Customer service
- Account service
- Transaction service
- Beneficiary service
- Card service
- Loan service
- Notification service
- Admin service
- Developer service

---

## 🏗️ Architecture

```text
┌──────────────────────────────┐
│          React App           │
│  Customer / Admin / Dev UI   │
└──────────────┬───────────────┘
               │ HTTPS
               ▼
┌──────────────────────────────┐
│      WSO2 API Manager        │
│  Gateway / Auth / Throttling │
└───────┬───────┬───────┬───────┘
        │       │       │
        ▼       ▼       ▼
   ┌────────┐ ┌────────┐ ┌────────┐
   │ Auth   │ │ Account│ │Transact│
   │Service │ │Service │ │Service │
   └────────┘ └────────┘ └────────┘
        │       │       │
        ▼       ▼       ▼
   ┌────────┐ ┌────────┐ ┌────────┐
   │Customer│ │Card    │ │Loan    │
   │Service │ │Service │ │Service │
   └────────┘ └────────┘ └────────┘
        │       │       │
        ▼       ▼       ▼
   ┌────────┐ ┌────────┐ ┌────────┐
   │Benef.  │ │Notify  │ │Admin   │
   │Service │ │Service │ │Service │
   └────────┘ └────────┘ └────────┘
               │
               ▼
     ┌────────────────────┐
     │ PostgreSQL / Redis  │
     └────────────────────┘
```

### 🔌 Gateway mapping

From the WSO2 integration guide, the public API paths map to internal services like this:

| Public API | Internal service target |
| --- | --- |
| `/auth/v1` | `http://service-auth:3001/api/v1/auth` |
| `/customers/v1` | `http://service-customer:3002/api/v1/customers` |
| `/accounts/v1` | `http://service-account:3003/api/v1/accounts` |
| `/transactions/v1` | `http://service-transaction:3004/api/v1/transactions` |
| `/beneficiaries/v1` | `http://service-beneficiary:3005/api/v1/beneficiaries` |
| `/cards/v1` | `http://service-card:3006/api/v1/cards` |
| `/loans/v1` | `http://service-loan:3007/api/v1/loans` |
| `/notifications/v1` | `http://service-notification:3008/api/v1/notifications` |
| `/admin/v1` | `http://service-admin:3009/admin` |
| `/developer/v1` | `http://service-developer:3010/developer` |

---

## ✨ Features

### 👤 Customer Portal
- Register and log in
- View accounts and balances
- Transfer money internally and externally
- Schedule transfers
- Manage beneficiaries
- Manage cards
- Apply for loans
- View transactions and statements
- Manage profile and KYC
- Receive notifications

### 🛡️ Admin Portal
- View and manage users
- View and manage accounts
- Review card requests
- Review loans
- Monitor transactions
- Review fraud alerts
- Send notifications
- Generate reports
- Manage admin settings

### 🧑‍💻 Developer Portal
- View API docs
- Manage API keys
- Review analytics
- Use sandbox-style developer tools

---

## 🧱 Technology Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, Sonner |
| Gateway | WSO2 API Manager 4.3.0 |
| Backend | Node.js, Express, TypeScript |
| ORM | Prisma |
| Database | PostgreSQL 16 |
| Cache / Session | Redis 7 |
| Containerization | Docker, Docker Compose |
| Auth | OAuth2, JWT |
| Testing | Jest, Supertest, Playwright |
| Logging | Winston, Morgan |

---

## 📁 Project Structure

```text
.
├── backend/
│   ├── auth-service/
│   ├── customer-service/
│   ├── account-service/
│   ├── transaction-service/
│   ├── beneficiary-service/
│   ├── card-service/
│   ├── loan-service/
│   ├── notification-service/
│   ├── admin-service/
│   └── developer-service/
├── database/
│   ├── prisma/
│   └── schema.sql
├── docker/
│   └── docker-compose.yml
├── frontend/
├── wso2/
│   ├── README.md
│   └── api-definitions/
└── README.md
```

---

## 🚀 How to Run

### Option 1: Run the full stack with Docker

This is the easiest way to run everything together.

#### Prerequisites
- Docker
- Docker Compose

#### Steps
```bash
cd docker
docker compose up --build -d
```

#### Open the apps
- Frontend: `http://localhost:5173`
- WSO2 management portal: `https://localhost:9443`
- WSO2 gateway: `https://localhost:8243`
- WSO2 HTTP gateway: `http://localhost:8280`

### Option 2: Run locally in development mode

#### Prerequisites
- Node.js 22+
- PostgreSQL
- Redis

#### Run the frontend only
```bash
npm run dev:frontend
```
Frontend dev server:
- `http://localhost:3000`

#### Run all services locally
```bash
npm run dev
```

The root `dev` script starts:
- frontend
- auth service
- account service
- customer service
- transaction service
- beneficiary service
- card service
- loan service
- notification service
- admin service
- developer service

#### Run backend only
```bash
npm run dev:backend
```

---

## 🔐 WSO2 Setup

WSO2 API Manager is used as the central gateway.

### WSO2 ports
- Publisher / Developer Portal / Management: `https://localhost:9443`
- Gateway HTTPS: `https://localhost:8243`
- Gateway HTTP: `http://localhost:8280`

### Publish APIs
For each OpenAPI file in `wso2/api-definitions/`:
1. Open the WSO2 Publisher portal.
2. Create a new API from OpenAPI definition.
3. Upload the YAML spec.
4. Set production/sandbox endpoint to the matching internal container URL.
5. Deploy a revision.
6. Publish the API.

### Security model
- OAuth2 access tokens
- JWT validation
- role-based access scopes
- gateway throttling
- service-level authorization

---

## 🗄️ Database

The platform uses PostgreSQL for persistent data:
- users
- customer profiles
- accounts
- cards
- loans
- transactions
- beneficiaries
- notifications
- audit logs
- refresh tokens

Redis is used for:
- refresh token rotation
- session/token blacklists
- OTP support
- temporary caching

---

## 🧪 Testing

### Backend tests
Example:
```bash
cd backend/auth-service
npm run test
```

### End-to-end tests
```bash
npm run test:e2e
```

---

## 📸 Screenshots

Add your UI screenshots in a folder like:

```text
docs/screenshots/
```

Recommended screenshot set:

| Screenshot | Suggested file |
| --- | --- |
| Landing page | `docs/screenshots/landing-page.png` |
| Customer dashboard | `docs/screenshots/customer-dashboard.png` |
| Customer accounts | `docs/screenshots/customer-accounts.png` |
| Money transfer | `docs/screenshots/customer-transfer.png` |
| Transaction history | `docs/screenshots/transaction-history.png` |
| Cards page | `docs/screenshots/cards-page.png` |
| Loans page | `docs/screenshots/loans-page.png` |
| Beneficiaries page | `docs/screenshots/beneficiaries-page.png` |
| Statements page | `docs/screenshots/statements-page.png` |
| Notifications page | `docs/screenshots/notifications-page.png` |
| Settings page | `docs/screenshots/settings-page.png` |
| Admin dashboard | `docs/screenshots/admin-dashboard.png` |
| Admin users | `docs/screenshots/admin-users.png` |
| Admin accounts | `docs/screenshots/admin-accounts.png` |
| Admin cards | `docs/screenshots/admin-cards.png` |
| Admin loans | `docs/screenshots/admin-loans.png` |
| Reports | `docs/screenshots/reports.png` |
| Developer portal | `docs/screenshots/developer-portal.png` |

Example markdown usage:

```md
![Customer Dashboard](docs/screenshots/customer-dashboard.png)
```

---

## 🧩 Environment Variables

Each service has its own `.env` file and `.env.example`.

Common variables:
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `PORT`

Example files:
- [backend/auth-service/.env.example](/C:/Projects/Digital%20Banking%20API%20Platform/backend/auth-service/.env.example)
- [backend/account-service/.env.example](/C:/Projects/Digital%20Banking%20API%20Platform/backend/account-service/.env.example)
- [backend/transaction-service/.env.example](/C:/Projects/Digital%20Banking%20API%20Platform/backend/transaction-service/.env.example)
- [frontend/.env.example](/C:/Projects/Digital%20Banking%20API%20Platform/frontend/.env.example)

---

## 📚 Documentation

- [SRS.md](/C:/Projects/Digital%20Banking%20API%20Platform/SRS.md)
- [Development Plan.md](/C:/Projects/Digital%20Banking%20API%20Platform/Development%20Plan.md)
- [wso2/README.md](/C:/Projects/Digital%20Banking%20API%20Platform/wso2/README.md)
- [CRUD_AUDIT.md](/C:/Projects/Digital%20Banking%20API%20Platform/CRUD_AUDIT.md)

---

## ✅ Notes

- The frontend is role-aware and routes users into customer, admin, or developer areas.
- WSO2 is intended to sit in front of the backend services for centralized API control.
- The system is built to support secure token-based access and service separation.

---

## 📄 License

This project currently does not define a license file. Add one if you plan to publish or share the repository publicly.
