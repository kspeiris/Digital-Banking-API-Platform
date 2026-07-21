# Software Requirements Specification (SRS)

## Digital Banking API Platform (Enterprise Edition)

**Version:** 2.0
**Project Type:** Enterprise Web Application (Microservices)

---

## 1. Introduction

### 1.1 Purpose
The Digital Banking API Platform is an enterprise-grade solution designed to provide secure, scalable, and highly available digital banking services. Leveraging a microservices architecture and WSO2 API Manager, this platform serves retail customers, administrators, and third-party developers, delivering seamless financial experiences across all digital touchpoints.

### 1.2 Scope
This system encompasses three major portals:
*   **Customer Portal:** Comprehensive financial dashboard for account management, transfers, loans, and card controls.
*   **Admin Portal:** Back-office tools for customer management, transaction monitoring, fraud detection, and reporting.
*   **Developer Portal:** API documentation, key management, analytics, and testing sandboxes for third-party integrations.

### 1.3 Objectives
*   Deliver secure banking APIs complying with OAuth2/JWT standards.
*   Implement WSO2 API Gateway for routing, monitoring, and rate limiting.
*   Achieve horizontal scalability via Docker containerization and Kubernetes.
*   Provide a world-class UI/UX with responsive, accessible React components.

---

## 2. Overall Description

### 2.1 Product Perspective
The platform is an independent, cloud-native system. Frontend interactions via React web applications are routed through the WSO2 API Gateway, which handles authentication and load balancing before distributing requests to specialized Node.js microservices. Persistent data is stored in PostgreSQL, with Redis used for caching and session management.

### 2.2 User Roles
1.  **Customer:** End-users accessing banking services.
2.  **Administrator:** Bank staff managing users, fraud, and system health.
3.  **Developer:** Third-party engineers integrating with banking APIs.
4.  **System Auditor:** Read-only access for compliance and audit logs.

---

## 3. System Architecture

The architecture follows a strict microservices pattern:
*   **Presentation Layer:** React + TypeScript (Vite, TailwindCSS)
*   **API Management Layer:** WSO2 API Manager
*   **Application Layer:** Node.js + Express.js microservices
*   **Data Layer:** PostgreSQL (Transactional Data), Redis (Cache)
*   **Infrastructure:** Docker, Kubernetes

---

## 4. Frontend Requirements

### 4.1 UI Design Principles
*   **Consistency:** Reusable component library (shadcn/ui + Tailwind).
*   **Feedback:** Skeleton loaders for async states, toast notifications for success/error.
*   **Clarity:** Clear typography (Inter/Space Grotesk), high contrast, logical layout.

### 4.2 Responsive Design
*   Mobile-first CSS architecture.
*   Fluid grids and scalable typography.
*   Collapsible sidebars and drawer navigations for mobile viewports.

### 4.3 Navigation
*   Role-based routing with protected endpoints.
*   Sidebar for primary navigation, top bar for profile/settings/notifications.
*   Breadcrumb trails for deep linking.

### 4.4 Customer Portal Specification

#### 4.4.1 Customer Dashboard
*   **Purpose:** Display a complete overview of customer financial information.
*   **Widgets:** Total Balance, Savings Balance, Current Balance, Fixed Deposits, Loan Balance, Credit Card Outstanding, Recent Transactions, Upcoming Loan EMI, Latest Notifications, Quick Actions.
*   **Charts:** Monthly Expenses (Bar Chart), Income vs Expenses (Pie Chart), Balance Trend (Line Chart).
*   **Quick Actions:** Transfer Money, Pay Bills, Recharge Mobile, Freeze Card, Download Statement, Apply Loan, Add Beneficiary.
*   **API Used:** `GET /api/v1/dashboard/summary`
*   **Validations:** JWT Required. Refresh every 60 seconds. Skeleton loaders on initial fetch.

#### 4.4.2 Transfer Money Page
*   **Purpose:** Transfer funds between bank accounts securely.
*   **Input Fields:** From Account (Select), To Account (Input/Select), Beneficiary (Select), Amount (Currency Input), Description (Text), Transfer Type (Radio), Schedule Date (Date Picker).
*   **Functions:** Validate Balance, Validate Daily Limit, OTP Verification, Transaction Confirmation, Generate Receipt.
*   **API Used:** `POST /api/v1/transactions/internal`, `POST /api/v1/transactions/external`
*   **Errors:** Insufficient Balance, Invalid Beneficiary, OTP Expired, Transfer Limit Exceeded.

### 4.5 Admin Portal Specification

#### 4.5.1 Fraud Monitoring Dashboard
*   **Purpose:** Real-time monitoring and resolution of suspicious activities.
*   **Widgets:** High Risk Alerts, Pending Reviews, Auto-Resolved Rate, Global Lockdown trigger.
*   **Tables:** Recent Alerts (Filterable by Status, Risk Level, Time).
*   **Actions:** Block User, Clear Alert, Investigate IP.
*   **API Used:** `GET /api/v1/admin/fraud-alerts`

#### 4.5.2 Customer Management
*   **Purpose:** 360-degree view of customer profiles and KYC status.
*   **Functions:** Approve KYC, Freeze Account, Reset Password Link, View Audit Trail.

### 4.6 Developer Portal Specification

#### 4.6.1 API Analytics
*   **Purpose:** Monitor application API usage and performance.
*   **Widgets:** Total Requests, Error Rate, Avg Latency, Active Keys.
*   **Tables:** Top Endpoints, Recent Errors (401, 422, 429).
*   **API Used:** `GET /api/v1/dev/analytics`

---

## 5. Backend Requirements

### 5.1 Microservices Mapping
*   **Auth Service:** Login, Registration, JWT issuing, Password Reset.
*   **Account Service:** Ledger, Balances, Account creation.
*   **Transaction Service:** Money movement, limits, history.
*   **Card Service:** Virtual cards, PIN management, freezing.
*   **Notification Service:** SMTP/SMS gateways via async queues.

---

## 6. Non-Functional Requirements

### 6.1 Security
*   All endpoints require OAuth2/JWT authorization.
*   Passwords hashed using Argon2/Bcrypt.
*   Rate limiting applied via WSO2 API Gateway (e.g., 100 req/min).

### 6.2 Performance
*   API response time < 500ms (95th percentile).
*   Frontend time-to-interactive < 1.5s.

### 6.3 Scalability
*   Stateless backend services designed for horizontal pod autoscaling.

---

## 7. Form Validations Reference

*   **Email:** Regex validation `^[^\s@]+@[^\s@]+\.[^\s@]+$`
*   **Password:** Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.
*   **Amount Input:** Must be > 0.00, formatted to 2 decimal places.
*   **OTP:** Exactly 6 numeric digits, expires in 300 seconds.

---

## 8. Frontend Folder Structure

```text
src/
├── assets/          # Images, SVGs, global CSS
├── components/      # Reusable UI components (shadcn, etc.)
│   ├── ui/          # Base components (buttons, inputs)
│   └── Layout/      # Dashboard layouts, sidebars
├── pages/           # Route-level components
├── hooks/           # Custom React hooks
├── services/        # API client and integrations
├── store/           # Global state management (Zustand/Redux)
├── types/           # TypeScript interfaces and types
├── utils/           # Helper functions, formatters
└── App.tsx          # Main routing and entry point
```

---

## 9. Future Enhancements

*   **Mobile App:** React Native application reusing backend APIs.
*   **AI Integration:** Chatbot assistant for customer support.
*   **Advanced Analytics:** Predictive spending categorization.
*   **Biometrics:** WebAuthn integration for secure, passwordless logins.
