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
