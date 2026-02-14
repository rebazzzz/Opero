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
