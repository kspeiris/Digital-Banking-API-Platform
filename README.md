# Digital Banking API Platform

An enterprise-grade, high-performance, and secure digital banking platform built on a distributed microservices architecture. The system leverages WSO2 API Manager for API Gateway management, Redis for high-speed caching and rate-limiting, PostgreSQL for persistent storage, Docker for orchestration, and a complete testing/logging framework.

---

## 🏛️ System Architecture

```text
                               ┌───────────────────┐
                               │   React Frontend  │
                               └─────────┬─────────┘
                                         │ (HTTP / WS)
                                         ▼
                               ┌───────────────────┐
                               │ WSO2 API Gateway  │
                               └─────────┬─────────┘
                                         │ (OAuth2 & JWT)
                                         ▼
       ┌─────────────────────────────────┴─────────────────────────────────┐
       │                                                                   │
       ▼ (Auth Service)                                                    ▼ (Transaction Service)
┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐  ┌──────────────┐
│  Credentials │   │ Customer Profile││ Accounts &   │   │ Beneficiary  │  │ Fund Transfer│
│    & OTP     │   │   & KYC      │   │   Balances   │   │ Management   │  │  & Receipts  │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘  └──────┬───────┘
       │                  │                  │                  │                 │
       └──────────────────┼──────────────────┼──────────────────┼─────────────────┤
                          ▼                  ▼                  ▼                 ▼
                   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐  ┌──────────────┐
                   │ Card Control │   │ Loan Lifecycle│  │ Notification │  │ Admin Portal │
                   │   & limits   │   │ & Calculator │   │ Engine (SMS) │  │ & Fraud Monitor│
                   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘  └──────┬───────┘
                          │                  │                  │                 │
                          ▼                  ▼                  ▼                 ▼
                   ┌──────────────┐   ┌───────────────────────────────────────────┐
                   │ Developer    │   │           Infrastructure Layer            │
                   │ Portal       │   │                                           │
                   └──────────────┘   │  ┌────────────┐ ┌────────────┐ ┌────────┐ │
                                      │  │ PostgreSQL │ │ Redis Cache│ │ Docker │ │
                                      │  └────────────┘ └────────────┘ └────────┘ │
                                      └───────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | React, TypeScript, TailwindCSS, Vite, Lucide Icons, Recharts, Sonner Toasts |
| **Gateway** | WSO2 API Manager 4.3.0 (API Gateway, OAuth2, Rate Limiting, Subscriptions) |
| **Backend Microservices** | Node.js, Express, TypeScript, Prisma ORM |
| **Caching & Queueing** | Redis 7 (OTP, Refresh Tokens, Session Caching, Lock Manager) |
| **Database** | PostgreSQL 16 (Relational Models, Transactions, Audit Logging) |
| **Containerization** | Docker, Docker Compose (Bridge Isolation Networks) |
| **Logging & Monitoring** | Winston (Structured JSON Logger), Morgan (HTTP Access Logs) |
| **Testing Frame** | Jest (Unit/Integration Tests), Supertest (API), Playwright (E2E) |

---

## 🚀 Core Features

### 1. User Authentication & Security
- Secure token-based access utilizing OAuth2 and JSON Web Tokens (JWT).
- One-Time Password (OTP) verification for high-security transactions.
- Redis-backed refresh token rotation and authentication session blacklists.

### 2. Customer Profiles & KYC
- Account creation, identity management, and profile configuration.
- KYC documentation submissions.

### 3. Account & Balance Management
- Support for multiple checking, savings, and loan account lines.
- Real-time balances and transaction statement generation.

### 4. Transactions & Transfer Engine
- Internal peer-to-peer (P2P) transfers and external interbank transactions.
- Automated receipts generation.
- Transaction limits validation.

### 5. Card Self-Service
- Real-time card locking/unlocking.
- Card PIN modifications.
- Dynamic daily online, retail, and international transaction spending limits controls.

### 6. Loan Lifecycles
- Interactive EMI loan calculators.
- Loan requests submission, file attachments, and status tracking dashboards.

### 7. Notification Services
- Centralized event notifications engine.
- Supports SMS alerts, push updates, and emails on critical transactions and security events.

### 8. Admin Portal
- Comprehensive customer management dashboard.
- Freeze/unfreeze commands.
- Live fraud warning alerts and audit log database tracking.

### 9. Developer Portal
- Self-service API Key generation, Swagger/OpenAPI documentation, and sandbox interactive testing consoles.

---

## 📦 Getting Started

### Prerequisites
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed on your machine.
- [Node.js v22+](https://nodejs.org/) installed for local development.

### Setup and Running the Whole Stack

To spin up all backend services, frontend, WSO2 API Manager, PostgreSQL, and Redis in an isolated environment:

1. Clone the repository.
2. Navigate to the `docker` directory:
   ```bash
   cd docker
   ```
3. Boot up the containers:
   ```bash
   docker compose up --build -d
   ```
4. Access the React Frontend at `http://localhost:5173`.

---

## 🧪 Testing Strategy

The platform includes Unit, Integration, and End-to-End browser tests:

- **Run Backend Unit & Integration Tests**:
  ```bash
  cd backend/auth-service && npm run test
  ```
- **Run Playwright E2E Tests**:
  ```bash
  npm run test:e2e
  ```
