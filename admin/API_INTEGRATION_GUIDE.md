# Admin Panel API Integration Guide

This document outlines how the EventsKona Admin Panel integrates with the backend API and ensures alignment with the main application.

## Current State: MVP with Mock Data

The admin panel currently uses **mock data** for demonstration purposes. All functionality is ready to be connected to real API endpoints.

## Admin Panel Structure & API Endpoints Needed

### 1. **Authentication** (`/admin/app/(auth)/login/page.tsx`)

**Current Mock Implementation:**
```typescript
// lib/admin-auth-context.tsx
const mockAdmins = [
  { id: "1", email: "admin@eventskona.com", name: "Admin User", role: "super_admin" },
  { id: "2", email: "moderator@eventskona.com", name: "Moderator", role: "moderator" }
];
```

**Required Backend API:**
- **POST** `/api/admin/auth/login`
  - Request: `{ email, password }`
  - Response: `{ token, admin: { id, email, name, role, permissions } }`

- **GET** `/api/admin/auth/me`
  - Headers: `Authorization: Bearer {token}`
  - Response: `{ admin: { id, email, name, role, permissions } }`

- **POST** `/api/admin/auth/logout`
  - Headers: `Authorization: Bearer {token}`

**Admin Roles & Permissions:**
- `super_admin`: Full access to all features
- `moderator`: Can manage users and events (read/write/delete)
- `viewer`: Read-only access to analytics and logs

---

### 2. **Dashboard** (`/admin/app/(dashboard)/page.tsx`)

**Current Mock Data:**
```typescript
const stats = [
  { title: "Total Users", value: "2,543", change: "+12.5%", trend: "up" },
  { title: "Active Events", value: "487", change: "+8.2%", trend: "up" },
  { title: "Event Views", value: "45.2K", change: "+23.1%", trend: "up" },
  { title: "Revenue", value: "$12,345", change: "+15.3%", trend: "up" }
];
```

**Required Backend API:**
- **GET** `/api/admin/dashboard/stats`
  - Response:
  ```json
  {
    "totalUsers": { "value": 2543, "change": 12.5, "trend": "up" },
    "activeEvents": { "value": 487, "change": 8.2, "trend": "up" },
    "eventViews": { "value": 45200, "change": 23.1, "trend": "up" },
    "revenue": { "value": 12345, "change": 15.3, "trend": "up", "currency": "NGN" }
  }
  ```

- **GET** `/api/admin/dashboard/charts`
  - Query: `?period=6months`
  - Response:
  ```json
  {
    "userGrowth": [
      { "month": "Jan", "users": 1200 },
      { "month": "Feb", "users": 1400 }
    ],
    "eventMetrics": [
      { "month": "Jan", "events": 240, "revenue": 4800 }
    ]
  }
  ```

- **GET** `/api/admin/dashboard/activity`
  - Query: `?limit=5`
  - Response:
  ```json
  {
    "activities": [
      {
        "id": "1",
        "type": "user_signup",
        "message": "New user registered",
        "detail": "john.doe@example.com",
        "timestamp": "2025-01-09T10:30:00Z"
      }
    ]
  }
  ```

---

### 3. **Users Management** (`/admin/app/(dashboard)/users/page.tsx`)

**Required Backend API:**
- **GET** `/api/admin/users`
  - Query: `?page=1&limit=20&search=john&status=active`
  - Response:
  ```json
  {
    "users": [
      {
        "id": "u1",
        "name": "John Doe",
        "email": "john@example.com",
        "status": "active",
        "eventsCreated": 5,
        "joinedDate": "2024-12-01T00:00:00Z",
        "avatar": "https://..."
      }
    ],
    "pagination": {
      "total": 2543,
      "page": 1,
      "pages": 128
    }
  }
  ```

- **GET** `/api/admin/users/:id`
  - Response: Full user profile with event history

- **PUT** `/api/admin/users/:id/status`
  - Request: `{ status: "active" | "suspended" | "banned" }`
  - Requires: `users.write` permission

- **DELETE** `/api/admin/users/:id`
  - Requires: `users.delete` permission

- **POST** `/api/admin/users/:id/send-message`
  - Request: `{ subject, message }`
  - Requires: `users.write` permission

---

### 4. **Events Management** (`/admin/app/(dashboard)/events/page.tsx`)

**Required Backend API:**
- **GET** `/api/admin/events`
  - Query: `?page=1&limit=20&status=pending&category=music&search=festival`
  - Response:
  ```json
  {
    "events": [
      {
        "id": "e1",
        "title": "Summer Music Festival",
        "organizer": { "id": "u1", "name": "John Doe" },
        "status": "pending" | "approved" | "rejected" | "cancelled",
        "category": "music",
        "startDate": "2025-06-15T18:00:00Z",
        "ticketsSold": 150,
        "capacity": 500,
        "revenue": 75000,
        "image": "https://..."
      }
    ],
    "pagination": { "total": 487, "page": 1, "pages": 25 }
  }
  ```

- **GET** `/api/admin/events/:id`
  - Response: Full event details

- **PUT** `/api/admin/events/:id/status`
  - Request: `{ status: "approved" | "rejected", reason?: string }`
  - Requires: `events.write` permission

- **DELETE** `/api/admin/events/:id`
  - Requires: `events.delete` permission

- **POST** `/api/admin/events/:id/feature`
  - Request: `{ featured: boolean, duration?: number }`
  - Makes event featured on homepage

---

### 5. **Audit Logs** (`/admin/app/(dashboard)/audit-logs/page.tsx`)

**Required Backend API:**
- **GET** `/api/admin/audit-logs`
  - Query: `?page=1&limit=50&action=user.suspend&adminId=a1&startDate=2025-01-01&endDate=2025-01-09`
  - Response:
  ```json
  {
    "logs": [
      {
        "id": "log1",
        "timestamp": "2025-01-09T10:30:00Z",
        "admin": { "id": "a1", "name": "Admin User" },
        "action": "user.suspend",
        "target": { "type": "user", "id": "u5", "name": "Spam User" },
        "details": { "reason": "Spam activity" },
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0..."
      }
    ],
    "pagination": { "total": 1523, "page": 1, "pages": 31 }
  }
  ```

**Action Types:**
- `user.create`, `user.update`, `user.suspend`, `user.delete`
- `event.approve`, `event.reject`, `event.delete`, `event.feature`
- `admin.login`, `admin.logout`, `admin.create`, `admin.delete`
- `settings.update`, `promotion.create`

---

## Data Flow Between Main App & Admin Panel

### Main App → Admin Panel
1. **User Registration** → Creates user record → Admin can view in Users tab
2. **Event Creation** → Event status "pending" → Admin reviews/approves in Events tab
3. **Ticket Purchases** → Updates revenue metrics → Admin sees in Dashboard
4. **User Reports** → Creates moderation queue → Admin investigates in Users tab

### Admin Panel → Main App
1. **Event Approval** → Event becomes visible on main app homepage
2. **User Suspension** → User cannot login to main app
3. **Event Rejection** → Organizer notified, event not published
4. **Featured Events** → Displayed prominently on main app

---

## Authentication Flow

### Admin Login Process:
1. Admin enters email/password on `/admin/login`
2. POST to `/api/admin/auth/login`
3. Backend validates credentials, returns JWT token
4. Token stored in localStorage (key: `admin_token`)
5. All subsequent API calls include: `Authorization: Bearer {token}`
6. Token refresh via `/api/admin/auth/refresh` (optional)

### Permission Check:
```typescript
// Example: Admin tries to suspend a user
if (admin.role === "super_admin" || admin.permissions.includes("users.write")) {
  // Allow action
  await PUT /api/admin/users/:id/status
} else {
  // Show "Insufficient permissions" error
}
```

---

## Security Requirements

### Backend Must Implement:
1. **Role-Based Access Control (RBAC)**
   - Verify admin role and permissions on every API call
   - Super admins bypass permission checks

2. **Rate Limiting**
   - Login endpoint: 5 attempts per 15 minutes
   - Other endpoints: 100 requests per minute per admin

3. **Audit Logging**
   - Log ALL admin actions (create, read, update, delete)
   - Include: timestamp, admin ID, action type, target, IP address

4. **Session Management**
   - JWT tokens expire after 8 hours
   - Refresh tokens valid for 7 days
   - Logout invalidates tokens

5. **IP Whitelisting (Optional)**
   - Restrict admin panel access to specific IPs
   - Configure in environment variables

---

## Environment Variables

### Admin Panel (.env.local):
```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.eventskona.com
NEXT_PUBLIC_ADMIN_API_URL=https://api.eventskona.com/admin

# Authentication
NEXT_PUBLIC_ADMIN_LOGIN_URL=/admin/auth/login

# Feature Flags
NEXT_PUBLIC_ENABLE_2FA=false
NEXT_PUBLIC_ENABLE_IP_WHITELIST=false
```

---

## Data Consistency Checks

### Admin Panel Should Match Main App:
1. **User Count** - Dashboard total users === Main app registered users
2. **Event Categories** - Same categories in both admin and main app
3. **Currency Support** - Admin supports all currencies used in main app (NGN, USD, GHS)
4. **Event Status Flow** - pending → approved → active → past
5. **Ticket Types** - Regular, VIP, Early Bird, etc.

---

## Migration from Mock to Real Data

### Step-by-Step Integration:

1. **Phase 1: Authentication (Week 1)**
   - Replace mock login with real API
   - Implement JWT token management
   - Add session persistence

2. **Phase 2: Dashboard (Week 2)**
   - Connect stats to real API
   - Load chart data from backend
   - Display real-time activity feed

3. **Phase 3: Users Management (Week 3)**
   - Load user list from API
   - Implement search, filter, pagination
   - Connect suspend/delete actions

4. **Phase 4: Events Management (Week 4)**
   - Load events from API
   - Implement approve/reject workflow
   - Add featured event management

5. **Phase 5: Audit Logs (Week 5)**
   - Display real audit logs
   - Add filtering and search
   - Export logs to CSV

---

## Testing Checklist

### Before Production:
- [ ] All API endpoints return correct data structure
- [ ] Authentication works (login, logout, token refresh)
- [ ] Permissions are enforced (viewers can't delete)
- [ ] Pagination works on all list views
- [ ] Search and filters work correctly
- [ ] All admin actions are logged to audit trail
- [ ] Dashboard stats match main app analytics
- [ ] Mobile responsive design works
- [ ] Error handling displays user-friendly messages
- [ ] Loading states show during API calls

---

## API Error Handling

### Standard Error Response:
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token",
    "details": "Token expired at 2025-01-09T10:00:00Z"
  }
}
```

### HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/expired token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

---

## Contact & Support

**For Backend Integration:**
- Share this document with your backend developer
- They should implement APIs matching these specifications
- Test with Postman/Insomnia before frontend integration

**Questions:**
- Frontend: dev@appguts.com
- Backend: your-backend-dev@example.com

---

**Last Updated:** January 2025
**Version:** 1.0.0
