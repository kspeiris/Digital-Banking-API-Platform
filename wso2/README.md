# WSO2 API Manager Integration Guide

This guide details how to integrate and manage the Digital Banking microservices under the **WSO2 API Manager** platform to implement centralized API governance, security, rate limiting, and analytics.

---

## 1. Local Deployment Architecture

We use Docker Compose to run WSO2 API Manager alongside all 10 microservices, using internal container name resolution:

- **Carbon & Console Management**: `https://localhost:9443`
- **HTTPS Gateway Port**: `https://localhost:8243`
- **HTTP Gateway Port**: `http://localhost:8280`

### Backend Endpoints mapped in Gateway
WSO2 API Gateway acts as a reverse proxy, routing incoming client calls internally:

| Microservice | Base Endpoint | Internal Target URL |
| :--- | :--- | :--- |
| **Authentication API** | `/auth/v1` | `http://service-auth:3001/api/v1/auth` |
| **Customer API** | `/customers/v1` | `http://service-customer:3002/api/v1/customers` |
| **Account API** | `/accounts/v1` | `http://service-account:3003/api/v1/accounts` |
| **Transaction API** | `/transactions/v1` | `http://service-transaction:3004/api/v1/transactions` |
| **Beneficiary API** | `/beneficiaries/v1` | `http://service-beneficiary:3005/api/v1/beneficiaries` |
| **Card API** | `/cards/v1` | `http://service-card:3006/api/v1/cards` |
| **Loan API** | `/loans/v1` | `http://service-loan:3007/api/v1/loans` |
| **Notification API** | `/notifications/v1` | `http://service-notification:3008/api/v1/notifications` |
| **Admin API** | `/admin/v1` | `http://service-admin:3009/admin` |
| **Developer API** | `/developer/v1` | `http://service-developer:3010/developer` |

---

## 2. Step-by-Step API Publishing Guide

For each service spec in the [wso2/api-definitions/](file:///c:/Projects/Digital%20Banking%20API%20Platform/wso2/api-definitions/) folder:

1. **Log in to WSO2 API Publisher Portal**: Go to `https://localhost:9443/publisher` using Admin credentials (`admin`/`admin`).
2. **Import OpenAPI Specs**:
   - Select **Create New API** -> **I Have an OpenAPI Definition**.
   - Upload the YAML specification file from the `wso2/api-definitions/` directory.
3. **Configure Endpoint Targets**:
   - Set the production and sandbox endpoints to the corresponding *Internal Target URL* listed in Section 1 (e.g. `http://service-auth:3001/api/v1/auth`).
4. **Deploy and Publish**:
   - Select **Deployments** -> **Deploy New Revision**.
   - Change the API state to **Published** under **Lifecycle** configuration to make the API discoverable in the Developer Portal.

---

## 3. Security & Access Control Policies

### JWT Token Validation
- All API resources in WSO2 are protected by **OAuth2** (supported by WSO2 Key Manager).
- WSO2 validates the incoming bearer token before extracting user credentials and passing validated claims down to the microservices inside custom headers (e.g. `X-JWT-Assertion`).

### Role-Based OAuth2 Scopes
Restrict resource invocation by binding OAuth2 scopes directly to the roles:

| Scope | Role Required | Target Resources |
| :--- | :--- | :--- |
| `admin.full` | `ADMIN` | `/admin/v1/**` |
| `developer.full` | `DEVELOPER` | `/developer/v1/**` |
| `customer.read` | `CUSTOMER` | `/accounts/v1/**`, `/cards/v1/` |
| `customer.write` | `CUSTOMER` | `/loans/v1/`, `/beneficiaries/v1/` |
| `transaction.transfer` | `CUSTOMER` | `/transactions/v1/**` |

---

## 4. Rate Limiting (Throttling) Policies

To protect backend databases against spikes and DDoS attacks, WSO2 Traffic Manager enforces limits:

- **Gold Policy (High Priority / High Limits)**:
  - Bound to **Accounts** & **Notifications** APIs.
  - Rate: 100 to 200 requests/minute.
- **Silver Policy (Medium Limits)**:
  - Bound to **Transfers** & **Loan Application** submittals.
  - Rate: 20 requests/minute.
- **Bronze Policy (Strict Security Limits)**:
  - Bound to **Register** & **Login** pages.
  - Rate: 5 to 10 requests/minute.

### Custom Error Responses
If a client violates rate limits, WSO2 intercepts and returns:
```json
{
  "success": false,
  "message": "Too many requests"
}
```
If token validations fail, WSO2 intercepts and returns:
```json
{
  "success": false,
  "message": "Invalid Access Token"
}
```
