# Opero

## Dashboard Summary API

### Endpoint

`GET /dashboard/summary`

### Auth & Tenant Scope

- Requires `Authorization: Bearer <access_token>`
- Uses `organizationId` from auth middleware
- Protected by:
  - `authenticate`
  - `organizationScope`
  - `authorizeRoles(ADMIN, MEMBER)`
  - `requireFeatureModule(ANALYTICS)`

### Example Request

```http
GET /dashboard/summary HTTP/1.1
Host: localhost:4000
Authorization: Bearer <access_token>
```

### Example Response

```json
{
  "success": true,
  "data": {
    "totalProjects": 24,
    "activeProjects": 17,
    "totalClients": 12,
    "unpaidInvoices": 8,
    "revenueThisMonth": 15420.5,
    "unreadNotifications": 4
  }
}
```

## Messaging API

### GET /messages/:threadId

Request:

```http
GET /messages/thr_123 HTTP/1.1
Host: localhost:4000
Authorization: Bearer <access_token>
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "thr_123",
    "organizationId": "org_abc",
    "createdAt": "2026-02-14T18:00:00.000Z",
    "messages": [
      {
        "id": "msg_1",
        "threadId": "thr_123",
        "senderId": "usr_1",
        "content": "Hello",
        "createdAt": "2026-02-14T18:01:00.000Z"
      }
    ]
  }
}
```

### POST /messages

Request:

```http
POST /messages HTTP/1.1
Host: localhost:4000
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "threadId": "thr_123",
  "content": "New message text"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "msg_new",
    "threadId": "thr_123",
    "senderId": "usr_1",
    "content": "New message text",
    "createdAt": "2026-02-14T18:02:00.000Z"
  }
}
```

### WebSocket (Socket.IO)

Client connection example:

```ts
import { io } from "socket.io-client";

const socket = io("http://localhost:4000", {
  auth: {
    token: "<access_token>"
  },
  transports: ["websocket"]
});

socket.on("message:new", (payload) => {
  console.log("new org message", payload);
});
```

## Notifications API

### GET /notifications

Request:

```http
GET /notifications?unreadOnly=true HTTP/1.1
Host: localhost:4000
Authorization: Bearer <access_token>
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "not_1",
      "userId": "usr_1",
      "organizationId": "org_abc",
      "type": "INFO",
      "title": "Welcome",
      "message": "Your account was created",
      "read": false,
      "createdAt": "2026-02-14T18:00:00.000Z"
    }
  ]
}
```

### POST /notifications

Request (admin/system-trigger path):

```http
POST /notifications HTTP/1.1
Host: localhost:4000
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "userId": "usr_1",
  "type": "ALERT",
  "title": "Invoice overdue",
  "message": "Invoice INV-1002 is now overdue"
}
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "not_2",
      "userId": "usr_1",
      "organizationId": "org_abc",
      "type": "ALERT",
      "title": "Invoice overdue",
      "message": "Invoice INV-1002 is now overdue",
      "read": false,
      "createdAt": "2026-02-14T18:05:00.000Z"
    }
  ]
}
```

### Socket.IO `notification:new`

```ts
import { io } from "socket.io-client";

const socket = io("http://localhost:4000", {
  auth: { token: "<access_token>" },
  transports: ["websocket"]
});

socket.on("notification:new", (payload) => {
  console.log("new notification event", payload);
});
```

### PATCH /notifications/:id/read

Request:

```http
PATCH /notifications/not_123/read HTTP/1.1
Host: localhost:4000
Authorization: Bearer <access_token>
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "not_123",
    "userId": "usr_1",
    "organizationId": "org_abc",
    "type": "INFO",
    "title": "Welcome",
    "message": "Your account was created",
    "read": true,
    "createdAt": "2026-02-14T18:00:00.000Z"
  }
}
```

### PATCH /notifications/read-all

Request:

```http
PATCH /notifications/read-all HTTP/1.1
Host: localhost:4000
Authorization: Bearer <access_token>
```

Response:

```json
{
  "success": true,
  "data": {
    "updatedCount": 5
  }
}
```

### Socket.IO `notification:read`

```ts
socket.on("notification:read", (payload) => {
  console.log("Notification marked as read", payload);
});
```

## Security Hardening

- `helmet` enabled globally.
- CORS allowlist enabled via `CORS_ORIGINS` (comma-separated).
- Global rate limiting enabled for all routes.
- Stricter auth route rate limiting on `/auth`.
- Request body size limited to `1mb`.

### Env config

```env
TRUST_PROXY="false"
CORS_ORIGINS=""
RATE_LIMIT_WINDOW_MS="900000"
RATE_LIMIT_MAX_REQUESTS="300"
AUTH_RATE_LIMIT_MAX_REQUESTS="50"
IDEMPOTENCY_TTL_SECONDS="86400"
```

## Invoice Idempotency

Money-changing invoice endpoints now require `Idempotency-Key`:

- `POST /invoices/drafts`
- `PATCH /invoices/:invoiceId/draft`
- `POST /invoices/:invoiceId/send`
- `POST /invoices/:invoiceId/pay`
- `POST /invoices/:invoiceId/cancel`

If the same key is sent again with the same payload, the API replays the original response and sets:

```http
Idempotency-Replayed: true
```

## Audit Logging

Critical invoice actions are written to `AuditLog` in the same transaction as the business write:

- `INVOICE_DRAFT_CREATED`
- `INVOICE_DRAFT_UPDATED`
- `INVOICE_SENT`
- `INVOICE_PAID`
- `INVOICE_CANCELLED`

Each entry stores tenant + actor context:

- `organizationId`
- `actorUserId`
- `entityType`
- `entityId`
- `action`
- `metadata`

## Admin API (Audit-backed)

Requires admin auth (`ADMIN` role) with tenant scope.

### PATCH /admin/users/:userId/role

```http
PATCH /admin/users/usr_123/role HTTP/1.1
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "role": "MEMBER"
}
```

### PATCH /admin/features/:moduleName

```http
PATCH /admin/features/ANALYTICS HTTP/1.1
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "enabled": false
}
```

### GET /admin/audit-logs

```http
GET /admin/audit-logs?action=INVOICE_PAID&page=1&limit=20 HTTP/1.1
Authorization: Bearer <access_token>
```
