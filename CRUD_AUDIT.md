# CRUD Operations Audit Report
## Digital Banking API Platform - Backend Services

---

## 1. auth-service

### Existing Endpoints

| # | Method | Path | Roles | Operation | Description |
|---|--------|------|-------|-----------|-------------|
| 1 | POST | /register | Public | Create | Register new user account |
| 2 | POST | /login | Public | Read | Authenticate and login |
| 3 | POST | /logout | Authenticated | Update | Revoke refresh token |
| 4 | POST | /refresh | Public | Read | Refresh access token |
| 5 | POST | /forgot-password | Public | Update | Initiate password reset flow |
| 6 | POST | /verify-otp | Public | Update | Verify OTP for registration/password reset |
| 7 | POST | /reset-password | Public | Update | Reset password with OTP |
| 8 | GET | /profile | Authenticated | Read | Get user profile |
| 9 | POST | /change-password | Authenticated | Update | Change user password |

### Missing CRUD Operations

| Operation | Suggested Endpoint | Suggested Roles | What Needs Implementing |
|-----------|-------------------|-----------------|------------------------|
| Delete | DELETE /account | Authenticated (own) | Allow users to permanently delete their own account (GDPR compliance) |
| Read | GET /users/:id | ADMIN | Admin endpoint to fetch user details by ID |
| Read | GET /users | ADMIN | Admin endpoint to list all registered users |
| Update | PATCH /users/:id/status | ADMIN | Admin endpoint to suspend/activate user accounts |
| Create | POST /admin/create-user | ADMIN | Admin endpoint to create user accounts on behalf of users |
| Read | GET /users/:id/activity | ADMIN, user | Fetch user login history and activity logs |

---

## 2. customer-service

### Existing Endpoints

| # | Method | Path | Roles | Operation | Description |
|---|--------|------|-------|-----------|-------------|
| 1 | GET | /me | Authenticated | Read | Get own customer profile |
| 2 | PUT | /me | Authenticated | Update | Update own profile (name, phone, address, etc.) |
| 3 | POST | /me/profile-image | Authenticated | Create | Upload profile image |
| 4 | POST | /kyc | Authenticated | Create | Submit KYC documents |
| 5 | GET | /:id | ADMIN | Read | Get customer profile by ID |

### Missing CRUD Operations

| Operation | Suggested Endpoint | Suggested Roles | What Needs Implementing |
|-----------|-------------------|-----------------|------------------------|
| Delete | DELETE /me | Authenticated (own) | Allow users to delete their own account |
| Read | GET / | ADMIN | Admin endpoint to list/search all customers |
| Update | PUT /:id | ADMIN | Admin endpoint to update customer records (e.g., KYC status) |
| Delete | DELETE /:id | ADMIN | Admin endpoint to remove customer records |
| Update | PATCH /:id/kyc-status | ADMIN | Admin endpoint to update KYC review status (APPROVED/REJECTED) |
| Read | GET /:id/documents | AUTHENTICATED | Get KYC documents for a specific customer |
| Update | PUT /me/password | Authenticated (own) | Allow users to change their own password |
| Read | GET /:id/accounts | AUTHENTICATED, ADMIN | List all accounts for a specific customer |

---

## 3. account-service

### Existing Endpoints

| # | Method | Path | Roles | Operation | Description |
|---|--------|------|-------|-----------|-------------|
| 1 | GET | / | CUSTOMER, ADMIN | Read | List accounts for current user (or all for admin) |
| 2 | GET | /:id | CUSTOMER, ADMIN | Read | Get account details by ID |
| 3 | GET | /:id/balance | CUSTOMER, ADMIN | Read | Get account balance |
| 4 | GET | /:id/statements | CUSTOMER, ADMIN | Read | Get account statements with pagination & export |

### Missing CRUD Operations

| Operation | Suggested Endpoint | Suggested Roles | What Needs Implementing |
|-----------|-------------------|-----------------|------------------------|
| Create | POST / | ADMIN | Admin endpoint to create new accounts for customers |
| Update | PATCH /:id/status | ADMIN | Admin endpoint to freeze/unfreeze/close accounts |
| Update | PUT /:id | ADMIN | Admin endpoint to update account metadata (branch, currency, etc.) |
| Delete | DELETE /:id | ADMIN | Admin endpoint to close/delete accounts |
| Update | POST /:id/hold | ADMIN | Place a hold on an account |
| Read | GET /:id/holdings | CUSTOMER, ADMIN | Get account hold/freeze details |
| Read | GET /:id/transactions | CUSTOMER, ADMIN | List transactions for a specific account (currently only via statement) |
| Create | POST /:id/transfer | CUSTOMER | Initiate account-to-account transfer (currently in transaction-service) |

---

## 4. transaction-service

### Existing Endpoints

| # | Method | Path | Roles | Operation | Description |
|---|--------|------|-------|-----------|-------------|
| 1 | POST | /internal | CUSTOMER | Create | Execute internal account transfer |
| 2 | POST | /external | CUSTOMER | Create | Execute external transfer to beneficiary |
| 3 | POST | /scheduled | CUSTOMER | Create | Schedule a future transfer |
| 4 | GET | / | CUSTOMER | Read | Get transaction history with filters |
| 5 | GET | /:id | CUSTOMER, ADMIN | Read | Get transaction details by ID |
| 6 | GET | /receipt/:id | CUSTOMER, ADMIN | Read | Download transaction receipt (PDF/JSON) |

### Missing CRUD Operations

| Operation | Suggested Endpoint | Suggested Roles | What Needs Implementing |
|-----------|-------------------|-----------------|------------------------|
| Update | PATCH /:id/cancel | CUSTOMER, ADMIN | Cancel a pending/failed transaction before settlement |
| Update | PATCH /:id/refund | ADMIN | Admin endpoint to refund a completed transaction |
| Read | GET /:id/retries | ADMIN | View retry/scheduled transfer execution history |
| Create | POST /:id/reschedule | CUSTOMER | Reschedule a pending scheduled transfer |
| Delete | DELETE /scheduled/:id | CUSTOMER, ADMIN | Cancel a scheduled transfer before execution |
| Read | GET /stats | CUSTOMER, ADMIN | Get transaction statistics/summary for the user |
| Read | GET /export | CUSTOMER, ADMIN | Export transaction history (CSV/PDF) |
| Update | POST /:id/dispute | CUSTOMER | Initiate a dispute on a transaction |

---

## 5. beneficiary-service

### Existing Endpoints

| # | Method | Path | Roles | Operation | Description |
|---|--------|------|-------|-----------|-------------|
| 1 | GET | / | CUSTOMER, ADMIN | Read | List all beneficiaries for current user |
| 2 | POST | / | CUSTOMER | Create | Add a new beneficiary |
| 3 | PUT | /:id | CUSTOMER | Update | Update beneficiary details (nickname, branch, favorite) |
| 4 | DELETE | /:id | CUSTOMER | Delete | Remove a beneficiary |

### Missing CRUD Operations

| Operation | Suggested Endpoint | Suggested Roles | What Needs Implementing |
|-----------|-------------------|-----------------|------------------------|
| Read | GET /:id | CUSTOMER, ADMIN | Get details of a single beneficiary by ID |
| Create | POST /:id/verify | CUSTOMER | Verify a beneficiary account (account number validation) |
| Read | GET /:id/transactions | CUSTOMER, ADMIN | List transactions involving this beneficiary |
| Update | PUT /:id/limit | CUSTOMER | Set per-transfer limits for a beneficiary |
| Read | GET /search | CUSTOMER, ADMIN | Search beneficiaries by name or account number |
| Update | PATCH /:id/limit | CUSTOMER | Update daily/monthly transfer limits per beneficiary |

---

## 6. card-service

### Existing Endpoints

| # | Method | Path | Roles | Operation | Description |
|---|--------|------|-------|-----------|-------------|
| 1 | GET | / | CUSTOMER, ADMIN | Read | List all cards for current user (or all for admin) |
| 2 | PUT | /freeze | CUSTOMER, ADMIN | Update | Freeze a card |
| 3 | PUT | /unfreeze | CUSTOMER, ADMIN | Update | Unfreeze/reactivate a card |
| 4 | PUT | /pin | CUSTOMER | Update | Change card PIN |
| 5 | PUT | /limit | CUSTOMER | Update | Update card spending limits |
| 6 | PUT | /settings | CUSTOMER | Update | Update card settings (online payments, international usage) |
| 7 | POST | / | ADMIN | Create | Admin-create a new card for a customer |
| 8 | DELETE | /:id | ADMIN | Delete | Admin-delete a card |
| 9 | POST | /request | CUSTOMER | Create | Customer requests a new card |

### Missing CRUD Operations

| Operation | Suggested Endpoint | Suggested Roles | What Needs Implementing |
|-----------|-------------------|-----------------|------------------------|
| Read | GET | /:id | CUSTOMER, ADMIN | Get details of a single card by ID |
| Update | PATCH | /:id/status | ADMIN | Admin endpoint to block/expire/reactivate a card |
| Create | POST | /:id/replace | CUSTOMER | Replace a damaged, lost, or expired card |
| Read | GET | /:id/transactions | CUSTOMER, ADMIN | Get card transaction history |
| Read | GET | /:id/limits | CUSTOMER, ADMIN | Get current spending limits for a card |
| Update | PUT | /:id/replace | ADMIN | Admin-initiated card replacement |
| Create | POST | /:id/charge | ADMIN | Admin endpoint to issue an additional charge |
| Read | GET | /:id/statements | CUSTOMER, ADMIN | Get card billing statement |

---

## 7. loan-service

### Existing Endpoints

| # | Method | Path | Roles | Operation | Description |
|---|--------|------|-------|-----------|-------------|
| 1 | POST | / | CUSTOMER | Create | Submit a new loan application |
| 2 | GET | / | CUSTOMER, ADMIN | Read | List loan history |
| 3 | GET | /:id | CUSTOMER, ADMIN | Read | Get loan application details |
| 4 | GET | /status/:id | CUSTOMER, ADMIN | Read | Get loan application status |
| 5 | PUT | /:id/approve | ADMIN | Update | Approve a loan application |
| 6 | PUT | /:id/reject | ADMIN | Update | Reject a loan application |
| 7 | DELETE | /:id | CUSTOMER, ADMIN | Delete | Cancel a loan application |
| 8 | POST | /upload | CUSTOMER | Create | Upload documents for a loan |

### Missing CRUD Operations

| Operation | Suggested Endpoint | Suggested Roles | What Needs Implementing |
|-----------|-------------------|-----------------|------------------------|
| Read | GET | /:id/documents | CUSTOMER, ADMIN | List all documents uploaded for a loan |
| Update | PUT | /:id/repayment | ADMIN | Record a repayment against a loan |
| Read | GET | /:id/repayments | CUSTOMER, ADMIN | List repayments for a loan |
| Read | GET | /:id/schedule | CUSTOMER, ADMIN | Get repayment schedule for a loan |
| Create | POST | /:id/resubmit | CUSTOMER | Resubmit a rejected loan application |
| Update | PATCH | /:id/status | ADMIN | Update loan status (e.g., disbursed, closed, defaulted) |
| Read | GET | /:id/offers | PUBLIC, CUSTOMER | View available loan offers/rates |
| Create | POST | /:id/collateral | CUSTOMER | Upload collateral information |
| Update | PUT | /:id/interest-rate | ADMIN | Update interest rate on approved loan |

---

## 8. notification-service

### Existing Endpoints

| # | Method | Path | Roles | Operation | Description |
|---|--------|------|-------|-----------|-------------|
| 1 | GET | / | CUSTOMER, ADMIN | Read | List notifications with filters |
| 2 | PUT | /read | CUSTOMER | Update | Mark notifications as read |
| 3 | DELETE | /:id | CUSTOMER | Delete | Delete a notification |

### Missing CRUD Operations

| Operation | Suggested Endpoint | Suggested Roles | What Needs Implementing |
|-----------|-------------------|-----------------|------------------------|
| Read | GET | /:id | CUSTOMER, ADMIN | Get details of a single notification |
| Read | GET | /unread-count | CUSTOMER, ADMIN | Get count of unread notifications |
| Update | PUT | /:id | CUSTOMER | Update notification preferences or content |
| Update | PUT | /read-all | CUSTOMER | Mark all notifications as read |
| Create | POST | /preferences | CUSTOMER | Set notification preferences (email/SMS/push) |
| Read | GET | /types | CUSTOMER, ADMIN | List available notification types/categories |
| Update | PATCH | /settings | CUSTOMER | Update notification delivery settings |
| Read | GET | /stats | CUSTOMER | Get notification statistics (read/unread counts) |

---

## 9. admin-service

### Existing Endpoints

| # | Method | Path | Roles | Operation | Description |
|---|--------|------|-------|-----------|-------------|
| 1 | GET | /dashboard | ADMIN | Read | Get dashboard summary statistics |
| 2 | GET | /customers | ADMIN | Read | Search/list customers with filters |
| 3 | PUT | /customer/freeze | ADMIN | Update | Freeze customer accounts |
| 4 | GET | /reports | ADMIN | Read | Generate reports (transactions, customers, loans) |
| 5 | GET | /audit | ADMIN | Read | View audit log history |
| 6 | GET | /transactions | ADMIN | Read | List all transactions with filters |
| 7 | GET | /fraud-alerts | ADMIN | Read | Get fraud/security alerts |
| 8 | PUT | /customer/freeze-by-user | ADMIN | Update | Freeze customer by user ID |

### Missing CRUD Operations

| Operation | Suggested Endpoint | Suggested Roles | What Needs Implementing |
|-----------|-------------------|-----------------|------------------------|
| Create | POST | /customers | ADMIN | Create a new customer record |
| Read | GET | /customers/:id | ADMIN | Get detailed customer information |
| Update | PUT | /customers/:id | ADMIN | Update customer details |
| Delete | DELETE | /customers/:id | ADMIN | Remove a customer record |
| Update | PATCH | /customers/:id/status | ADMIN | Activate/suspend/activate customer accounts |
| Create | POST | /accounts | ADMIN | Create new accounts for customers |
| Read | GET | /accounts | ADMIN | List all accounts system-wide |
| Update | PATCH | /accounts/:id/status | ADMIN | Freeze/unfreeze/close specific accounts |
| Delete | DELETE | /accounts/:id | ADMIN | Close and remove accounts |
| Update | PUT | /loans/:id | ADMIN | Update loan terms or status |
| Create | POST | /cards | ADMIN | Issue new cards to customers |
| Read | GET | /cards | ADMIN | List all cards system-wide |
| Delete | DELETE | /cards/:id | ADMIN | Block/remove cards |
| Read | GET | /audit/:id | ADMIN | Get individual audit log entry |
| Read | GET | /reports/:id | ADMIN | Retrieve previously generated report |
| Create | POST | /scheduled-transfers | ADMIN | Create scheduled transfers |
| Update | PUT | /scheduled-transfers/:id | ADMIN | Modify scheduled transfer parameters |

---

## 10. developer-service

### Existing Endpoints

| # | Method | Path | Roles | Operation | Description |
|---|--------|------|-------|-----------|-------------|
| 1 | GET | /apis | DEVELOPER | Read | List available APIs |
| 2 | POST | /key | DEVELOPER | Create | Generate a new API key |
| 3 | DELETE | /key | DEVELOPER | Delete | Revoke an API key |
| 4 | GET | /keys | DEVELOPER | Read | List all API keys for the developer |
| 5 | GET | /analytics | DEVELOPER | Read | Get API analytics summary |

### Missing CRUD Operations

| Operation | Suggested Endpoint | Suggested Roles | What Needs Implementing |
|-----------|-------------------|-----------------|------------------------|
| Read | GET | /key/:id | DEVELOPER | Get details of a specific API key |
| Update | PUT | /key/:id | DEVELOPER | Update API key metadata (name, description) |
| Update | PATCH | /key/:id/status | DEVELOPER | Activate or deactivate an API key |
| Create | POST | /webhooks | DEVELOPER | Register webhook endpoints |
| Delete | DELETE | /webhooks/:id | DEVELOPER | Remove a webhook subscription |
| Read | GET | /webhooks | DEVELOPER | List registered webhooks |
| Read | GET | /analytics/detailed | DEVELOPER | Get detailed analytics (per-endpoint, per-day) |
| Read | GET | /quota | DEVELOPER | Get API usage quota and rate limit info |
| Update | PUT | /key/:id/rotate | DEVELOPER | Rotate API key secret |
| Read | GET | /logs | DEVELOPER | Get API key usage logs |

---

## Cross-Service Observations

### 1. Missing Global Endpoints
- **No health check endpoint** (`GET /health`) across all services
- **No API versioning** in route paths (e.g., `/v1/`)
- **No rate limiting endpoints** or rate limit status

### 2. Role-Based Access Gaps
- `customer-service` uses a local `authorize` middleware that duplicates role checking already handled by shared-common's `authMiddleware`
- `admin-service` has `GET /transactions` and `GET /fraud-alerts` using direct `z.object().safeParse()` for body-less query validation instead of a shared validator
- `developer-service` only has DEVELOPER role; no super-admin or admin access for internal management

### 3. Delete Operations (Soft/Hard Delete)
- Only `beneficiary-service` has a proper DELETE endpoint (soft/hard delete of a beneficiary)
- `loan-service` uses DELETE for loan cancellation (should ideally be a status update, not deletion)
- Most services lack soft-delete patterns (e.g., `deletedAt` timestamps)
- `notification-service` DELETE is permanent with no recovery option

### 4. Audit Trail Gaps
- `card-service` (freeze/unfreeze/changePin/settings) creates audit logs but `updateLimits` does not go through routes for audit
- `transaction-service` scheduled transfers use `scheduler.service.ts` but don't expose admin endpoints to manage the scheduler
- `notification-service` `deleteNotification` creates an audit log but `markAsRead` does not

### 5. Batch/Bulk Operations
- No bulk operations exist (e.g., bulk customer status update, bulk card actions)
- No export endpoints for data portability (except reports in admin-service)
- No CSV import endpoints for bulk data operations

### 6. Relationship/Sub-resource Endpoints
- No nested routes for sub-resources (e.g., `/accounts/:id/transactions`, `/loans/:id/documents`)
- `account-service` has `GET /:id/statements` instead of a proper nested resource pattern
- `transaction-service` receipt is at `/receipt/:id` rather than `/transactions/:id/receipt`

### 7. Filtering & Search
- `transaction-service` has comprehensive filtering (type, status, date range) in GET /
- `notification-service` has filtering (type, category, read status)
- `account-service` has no filtering on GET / (admin sees all accounts unfiltered)
- `loan-service` has no filtering on GET / (no date range, status, or type filters)

### 8. Pagination
- `transaction-service` GET / has pagination
- `notification-service` GET / has pagination
- `account-service` GET / has NO pagination (returns all accounts)
- `loan-service` GET / has NO pagination (returns all loans)
- `card-service` GET / has NO pagination (returns all cards)
