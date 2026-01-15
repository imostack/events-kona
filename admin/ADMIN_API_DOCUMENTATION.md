# EventsKona Admin Panel - Complete API Documentation

**Version:** 1.0.0
**Last Updated:** January 2025
**Base URL:** `https://api.eventskona.com/admin`

This document contains ALL API endpoints required for the EventsKona Admin Panel. Backend developers should implement these endpoints exactly as specified.

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Dashboard](#2-dashboard)
3. [Users Management](#3-users-management)
4. [Events Management](#4-events-management)
5. [Audit Logs](#5-audit-logs)
6. [Settings & Configuration](#6-settings--configuration)
7. [Analytics (Future)](#7-analytics-future)
8. [Admins Management (Future)](#8-admins-management-future)
9. [Common Patterns](#9-common-patterns)
10. [Error Handling](#10-error-handling)
11. [Security](#11-security)

---

## 1. Authentication

### 1.1 Admin Login

**Endpoint:** `POST /admin/auth/login`

**Description:** Authenticates an admin user and returns a JWT token.

**Request:**
```json
{
  "email": "admin@eventskona.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "admin_12345",
    "email": "admin@eventskona.com",
    "name": "Admin User",
    "role": "super_admin",
    "permissions": {
      "users": { "read": true, "write": true, "delete": true },
      "events": { "read": true, "write": true, "delete": true },
      "analytics": { "read": true },
      "audit_logs": { "read": true },
      "admins": { "read": true, "write": true, "delete": true },
      "settings": { "read": true, "write": true }
    },
    "avatar": "https://...",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

**Rate Limit:** 5 attempts per 15 minutes per IP

---

### 1.2 Get Current Admin

**Endpoint:** `GET /admin/auth/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "admin": {
    "id": "admin_12345",
    "email": "admin@eventskona.com",
    "name": "Admin User",
    "role": "super_admin",
    "permissions": { ... },
    "avatar": "https://...",
    "lastLoginAt": "2025-01-15T10:30:00Z"
  }
}
```

---

### 1.3 Refresh Token

**Endpoint:** `POST /admin/auth/refresh`

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 1.4 Admin Logout

**Endpoint:** `POST /admin/auth/logout`

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 2. Dashboard

### 2.1 Get Dashboard Statistics

**Endpoint:** `GET /admin/dashboard/stats`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `period` (optional): `today`, `week`, `month`, `year`, `all` (default: `month`)

**Response (200 OK):**
```json
{
  "success": true,
  "stats": {
    "totalUsers": {
      "value": 2543,
      "change": 12.5,
      "trend": "up",
      "previousPeriod": 2260
    },
    "activeEvents": {
      "value": 487,
      "change": 8.2,
      "trend": "up",
      "previousPeriod": 450
    },
    "eventViews": {
      "value": 45200,
      "change": 23.1,
      "trend": "up",
      "previousPeriod": 36700
    },
    "revenue": {
      "value": 12345000,
      "currency": "NGN",
      "change": 15.3,
      "trend": "up",
      "previousPeriod": 10700000
    }
  },
  "period": "month",
  "generatedAt": "2025-01-15T10:30:00Z"
}
```

**Required Permission:** `analytics.read`

---

### 2.2 Get Dashboard Charts Data

**Endpoint:** `GET /admin/dashboard/charts`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `period` (optional): `6months`, `12months`, `24months` (default: `6months`)
- `metric` (optional): `users`, `events`, `revenue`, `all` (default: `all`)

**Response (200 OK):**
```json
{
  "success": true,
  "charts": {
    "userGrowth": [
      { "month": "Jan", "year": 2025, "users": 1200, "newUsers": 150 },
      { "month": "Feb", "year": 2025, "users": 1400, "newUsers": 200 },
      { "month": "Mar", "year": 2025, "users": 1800, "newUsers": 400 },
      { "month": "Apr", "year": 2025, "users": 2100, "newUsers": 300 },
      { "month": "May", "year": 2025, "users": 2300, "newUsers": 200 },
      { "month": "Jun", "year": 2025, "users": 2543, "newUsers": 243 }
    ],
    "eventMetrics": [
      { "month": "Jan", "events": 240, "revenue": 4800000 },
      { "month": "Feb", "events": 290, "revenue": 5600000 },
      { "month": "Mar", "events": 350, "revenue": 7200000 },
      { "month": "Apr", "events": 420, "revenue": 9400000 },
      { "month": "May", "events": 450, "revenue": 11200000 },
      { "month": "Jun", "events": 487, "revenue": 12345000 }
    ]
  },
  "period": "6months"
}
```

**Required Permission:** `analytics.read`

---

### 2.3 Get Recent Activity

**Endpoint:** `GET /admin/dashboard/activity`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `limit` (optional): Number of activities to return (default: `10`, max: `50`)
- `type` (optional): Filter by activity type

**Response (200 OK):**
```json
{
  "success": true,
  "activities": [
    {
      "id": "activity_001",
      "type": "user_signup",
      "message": "New user registered",
      "detail": "john.doe@example.com",
      "timestamp": "2025-01-15T10:28:00Z",
      "metadata": {
        "userId": "user_123",
        "userName": "John Doe"
      }
    },
    {
      "id": "activity_002",
      "type": "event_created",
      "message": "New event created",
      "detail": "Summer Music Festival 2025",
      "timestamp": "2025-01-15T10:15:00Z",
      "metadata": {
        "eventId": "event_456",
        "organizerId": "user_789",
        "organizerName": "Event Co."
      }
    },
    {
      "id": "activity_003",
      "type": "event_approved",
      "message": "Event approved",
      "detail": "Tech Conference 2025",
      "timestamp": "2025-01-15T09:45:00Z",
      "metadata": {
        "eventId": "event_321",
        "approvedBy": "admin_12345",
        "adminName": "Admin User"
      }
    }
  ],
  "total": 152,
  "limit": 10
}
```

**Activity Types:**
- `user_signup`, `user_login`, `user_banned`, `user_suspended`
- `event_created`, `event_approved`, `event_rejected`, `event_deleted`
- `ticket_purchased`, `payment_processed`, `refund_issued`

---

## 3. Users Management

### 3.1 Get All Users

**Endpoint:** `GET /admin/users`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (optional): Page number (default: `1`)
- `limit` (optional): Items per page (default: `20`, max: `100`)
- `search` (optional): Search by name or email
- `status` (optional): Filter by status (`active`, `suspended`, `banned`)
- `sortBy` (optional): `name`, `email`, `createdAt`, `eventsCreated` (default: `createdAt`)
- `order` (optional): `asc`, `desc` (default: `desc`)

**Response (200 OK):**
```json
{
  "success": true,
  "users": [
    {
      "id": "user_001",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "status": "active",
      "avatar": "https://cloudinary.com/...",
      "eventsCreated": 5,
      "eventsAttended": 12,
      "totalSpent": 45000,
      "currency": "NGN",
      "joinedDate": "2024-12-01T00:00:00Z",
      "lastLoginAt": "2025-01-15T09:30:00Z",
      "emailVerified": true,
      "phoneVerified": false
    }
  ],
  "pagination": {
    "total": 2543,
    "page": 1,
    "pages": 128,
    "limit": 20
  }
}
```

**Required Permission:** `users.read`

---

### 3.2 Get Single User

**Endpoint:** `GET /admin/users/:userId`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "user_001",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+234812345678",
    "status": "active",
    "avatar": "https://cloudinary.com/...",
    "bio": "Event enthusiast and organizer",
    "location": {
      "city": "Lagos",
      "state": "Lagos",
      "country": "Nigeria"
    },
    "eventsCreated": 5,
    "eventsAttended": 12,
    "totalSpent": 45000,
    "currency": "NGN",
    "joinedDate": "2024-12-01T00:00:00Z",
    "lastLoginAt": "2025-01-15T09:30:00Z",
    "emailVerified": true,
    "phoneVerified": false,
    "createdEvents": [
      {
        "id": "event_001",
        "title": "Summer Music Festival",
        "status": "approved",
        "startDate": "2025-06-15T18:00:00Z",
        "ticketsSold": 150
      }
    ],
    "attendedEvents": [
      {
        "id": "event_002",
        "title": "Tech Conference",
        "attendedDate": "2024-12-10T00:00:00Z",
        "ticketType": "VIP"
      }
    ],
    "activityLog": [
      {
        "action": "login",
        "timestamp": "2025-01-15T09:30:00Z",
        "ipAddress": "192.168.1.1"
      }
    ]
  }
}
```

**Required Permission:** `users.read`

---

### 3.3 Update User Status

**Endpoint:** `PUT /admin/users/:userId/status`

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "status": "suspended",
  "reason": "Spam activity detected",
  "duration": 30,
  "durationUnit": "days",
  "notifyUser": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User status updated successfully",
  "user": {
    "id": "user_001",
    "status": "suspended",
    "suspendedUntil": "2025-02-14T10:30:00Z",
    "suspensionReason": "Spam activity detected"
  },
  "auditLog": {
    "id": "audit_123",
    "action": "user.suspend",
    "performedBy": "admin_12345",
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

**Status Values:**
- `active` - User can login and use platform
- `suspended` - Temporary ban (specify duration)
- `banned` - Permanent ban

**Required Permission:** `users.write`

---

### 3.4 Delete User

**Endpoint:** `DELETE /admin/users/:userId`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `deleteEvents` (optional): `true` or `false` (default: `false`)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "deletedData": {
    "userId": "user_001",
    "eventsDeleted": 0,
    "ticketsRefunded": 3,
    "totalRefund": 15000
  }
}
```

**Required Permission:** `users.delete`

**Important:** If `deleteEvents=false`, user's events are transferred to a default "Deleted User" account.

---

### 3.5 Send Message to User

**Endpoint:** `POST /admin/users/:userId/send-message`

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "subject": "Account Verification Required",
  "message": "Dear user, please verify your email address...",
  "type": "email",
  "priority": "high"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "sentAt": "2025-01-15T10:30:00Z",
  "messageId": "msg_12345"
}
```

**Message Types:**
- `email` - Send email
- `sms` - Send SMS (if phone verified)
- `notification` - In-app notification

**Required Permission:** `users.write`

---

## 4. Events Management

### 4.1 Get All Events

**Endpoint:** `GET /admin/events`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (optional): Page number (default: `1`)
- `limit` (optional): Items per page (default: `20`, max: `100`)
- `search` (optional): Search by title or organizer
- `status` (optional): `pending`, `approved`, `rejected`, `cancelled` (default: `all`)
- `category` (optional): Filter by category
- `startDate` (optional): Filter events starting after this date (ISO 8601)
- `endDate` (optional): Filter events starting before this date (ISO 8601)
- `sortBy` (optional): `title`, `startDate`, `ticketsSold`, `revenue` (default: `startDate`)
- `order` (optional): `asc`, `desc` (default: `desc`)

**Response (200 OK):**
```json
{
  "success": true,
  "events": [
    {
      "id": "event_001",
      "title": "Summer Music Festival 2025",
      "slug": "summer-music-festival-2025",
      "organizer": {
        "id": "user_789",
        "name": "Event Co.",
        "email": "contact@eventco.com",
        "avatar": "https://..."
      },
      "status": "pending",
      "category": "music",
      "startDate": "2025-06-15T18:00:00Z",
      "endDate": "2025-06-15T23:00:00Z",
      "location": {
        "venueName": "Eko Atlantic",
        "city": "Lagos",
        "country": "Nigeria"
      },
      "capacity": 500,
      "ticketsSold": 0,
      "ticketsAvailable": 500,
      "revenue": 0,
      "currency": "NGN",
      "featured": false,
      "image": "https://cloudinary.com/...",
      "createdAt": "2025-01-15T09:00:00Z",
      "submittedForApproval": "2025-01-15T09:30:00Z"
    }
  ],
  "pagination": {
    "total": 487,
    "page": 1,
    "pages": 25,
    "limit": 20
  },
  "summary": {
    "pending": 15,
    "approved": 450,
    "rejected": 12,
    "cancelled": 10
  }
}
```

**Required Permission:** `events.read`

---

### 4.2 Get Single Event

**Endpoint:** `GET /admin/events/:eventId`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "event": {
    "id": "event_001",
    "title": "Summer Music Festival 2025",
    "slug": "summer-music-festival-2025",
    "description": "The biggest music festival in Lagos...",
    "organizer": {
      "id": "user_789",
      "name": "Event Co.",
      "email": "contact@eventco.com",
      "phone": "+234812345678",
      "eventsCreated": 12,
      "totalAttendees": 5000
    },
    "status": "pending",
    "category": "music",
    "tags": ["music", "festival", "outdoor"],
    "startDate": "2025-06-15T18:00:00Z",
    "endDate": "2025-06-15T23:00:00Z",
    "location": {
      "type": "physical",
      "venueName": "Eko Atlantic",
      "address": "123 Event Street",
      "city": "Lagos",
      "state": "Lagos",
      "country": "Nigeria",
      "coordinates": {
        "lat": 6.4281,
        "lng": 3.4219
      }
    },
    "capacity": 500,
    "ticketsSold": 150,
    "ticketsAvailable": 350,
    "tickets": [
      {
        "id": "ticket_001",
        "name": "General Admission",
        "type": "regular",
        "price": 5000,
        "quantity": 300,
        "sold": 100,
        "available": 200
      },
      {
        "id": "ticket_002",
        "name": "VIP",
        "type": "vip",
        "price": 15000,
        "quantity": 200,
        "sold": 50,
        "available": 150
      }
    ],
    "revenue": 1250000,
    "currency": "NGN",
    "featured": false,
    "images": [
      "https://cloudinary.com/image1.jpg",
      "https://cloudinary.com/image2.jpg"
    ],
    "refundPolicy": "non-refundable",
    "ageRestriction": "18+",
    "createdAt": "2025-01-15T09:00:00Z",
    "updatedAt": "2025-01-15T09:30:00Z",
    "submittedForApproval": "2025-01-15T09:30:00Z",
    "reviewNotes": null
  }
}
```

**Required Permission:** `events.read`

---

### 4.3 Approve Event

**Endpoint:** `PUT /admin/events/:eventId/status`

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "status": "approved",
  "notes": "Event approved. Looks great!",
  "notifyOrganizer": true,
  "featured": false
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Event approved successfully",
  "event": {
    "id": "event_001",
    "status": "approved",
    "approvedAt": "2025-01-15T10:30:00Z",
    "approvedBy": "admin_12345",
    "reviewNotes": "Event approved. Looks great!"
  },
  "notification": {
    "sent": true,
    "sentTo": "contact@eventco.com",
    "sentAt": "2025-01-15T10:30:05Z"
  }
}
```

**Required Permission:** `events.write`

---

### 4.4 Reject Event

**Endpoint:** `PUT /admin/events/:eventId/status`

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "status": "rejected",
  "reason": "Incomplete event details",
  "notes": "Please provide more information about the venue and add clearer images.",
  "notifyOrganizer": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Event rejected",
  "event": {
    "id": "event_001",
    "status": "rejected",
    "rejectedAt": "2025-01-15T10:30:00Z",
    "rejectedBy": "admin_12345",
    "rejectionReason": "Incomplete event details",
    "reviewNotes": "Please provide more information..."
  }
}
```

**Required Permission:** `events.write`

---

### 4.5 Delete Event

**Endpoint:** `DELETE /admin/events/:eventId`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `refundTickets` (optional): `true` or `false` (default: `true`)
- `reason` (optional): Reason for deletion

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Event deleted successfully",
  "deletedData": {
    "eventId": "event_001",
    "ticketsRefunded": 150,
    "totalRefund": 1250000,
    "currency": "NGN"
  }
}
```

**Required Permission:** `events.delete`

---

### 4.6 Feature/Unfeature Event

**Endpoint:** `POST /admin/events/:eventId/feature`

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "featured": true,
  "duration": 7,
  "durationUnit": "days",
  "position": 1
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Event featured successfully",
  "event": {
    "id": "event_001",
    "featured": true,
    "featuredUntil": "2025-01-22T10:30:00Z",
    "featuredPosition": 1
  }
}
```

**Duration Units:** `hours`, `days`, `weeks`
**Position:** 1-10 (1 is top position on homepage)

**Required Permission:** `events.write`

---

## 5. Audit Logs

### 5.1 Get Audit Logs

**Endpoint:** `GET /admin/audit-logs`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (optional): Page number (default: `1`)
- `limit` (optional): Items per page (default: `50`, max: `100`)
- `action` (optional): Filter by action type
- `adminId` (optional): Filter by admin who performed action
- `targetType` (optional): `user`, `event`, `admin`, `settings`
- `targetId` (optional): Filter by specific target ID
- `startDate` (optional): Filter logs after this date (ISO 8601)
- `endDate` (optional): Filter logs before this date (ISO 8601)

**Response (200 OK):**
```json
{
  "success": true,
  "logs": [
    {
      "id": "log_001",
      "timestamp": "2025-01-15T10:30:00Z",
      "admin": {
        "id": "admin_12345",
        "name": "Admin User",
        "email": "admin@eventskona.com"
      },
      "action": "user.suspend",
      "target": {
        "type": "user",
        "id": "user_001",
        "name": "John Doe"
      },
      "details": {
        "reason": "Spam activity",
        "duration": "30 days",
        "previousStatus": "active",
        "newStatus": "suspended"
      },
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
      "changes": {
        "status": {
          "from": "active",
          "to": "suspended"
        }
      }
    }
  ],
  "pagination": {
    "total": 1523,
    "page": 1,
    "pages": 31,
    "limit": 50
  }
}
```

**Action Types:**
- **Users:** `user.create`, `user.update`, `user.suspend`, `user.ban`, `user.delete`, `user.message`
- **Events:** `event.approve`, `event.reject`, `event.delete`, `event.feature`, `event.unfeature`
- **Admins:** `admin.login`, `admin.logout`, `admin.create`, `admin.update`, `admin.delete`
- **Settings:** `settings.category.create`, `settings.category.update`, `settings.category.delete`, `settings.currency.toggle`, `settings.validation.update`

**Required Permission:** `audit_logs.read`

---

### 5.2 Export Audit Logs

**Endpoint:** `GET /admin/audit-logs/export`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `format`: `csv`, `json`, `pdf` (default: `csv`)
- `startDate` (optional): ISO 8601 date
- `endDate` (optional): ISO 8601 date
- `action` (optional): Filter by action type
- `adminId` (optional): Filter by admin

**Response (200 OK):**
- Content-Type: `text/csv` or `application/json` or `application/pdf`
- File download with name: `audit_logs_2025-01-15.csv`

**Required Permission:** `audit_logs.read`

---

## 6. Settings & Configuration

### 6.1 Get Categories

**Endpoint:** `GET /admin/settings/categories`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "categories": [
    {
      "id": "music",
      "name": "Music",
      "icon": "Music",
      "color": "#8b5cf6",
      "eventsCount": 45,
      "enabled": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "business",
      "name": "Business",
      "icon": "Briefcase",
      "color": "#3b82f6",
      "eventsCount": 32,
      "enabled": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Required Permission:** `settings.read`

---

### 6.2 Create Category

**Endpoint:** `POST /admin/settings/categories`

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "id": "wellness",
  "name": "Wellness",
  "icon": "Heart",
  "color": "#ec4899",
  "enabled": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Category created successfully",
  "category": {
    "id": "wellness",
    "name": "Wellness",
    "icon": "Heart",
    "color": "#ec4899",
    "eventsCount": 0,
    "enabled": true,
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

**Validation Rules:**
- `id`: Unique, lowercase, alphanumeric with hyphens
- `name`: 2-50 characters
- `color`: Valid hex color code
- `icon`: Valid Lucide icon name

**Required Permission:** `settings.write`

---

### 6.3 Update Category

**Endpoint:** `PUT /admin/settings/categories/:categoryId`

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "name": "Health & Wellness",
  "icon": "HeartPulse",
  "color": "#f43f5e",
  "enabled": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "category": {
    "id": "wellness",
    "name": "Health & Wellness",
    "icon": "HeartPulse",
    "color": "#f43f5e",
    "eventsCount": 5,
    "enabled": true,
    "updatedAt": "2025-01-15T10:30:00Z"
  }
}
```

**Required Permission:** `settings.write`

---

### 6.4 Delete Category

**Endpoint:** `DELETE /admin/settings/categories/:categoryId`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `moveTo` (optional): Category ID to move existing events to

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Category deleted successfully",
  "deletedData": {
    "categoryId": "wellness",
    "eventsMovedTo": "health",
    "eventsCount": 5
  }
}
```

**Response (400 Bad Request) - If events exist:**
```json
{
  "success": false,
  "error": {
    "code": "CATEGORY_HAS_EVENTS",
    "message": "Cannot delete category with 5 existing events",
    "eventsCount": 5,
    "suggestion": "Specify a 'moveTo' category ID to move events"
  }
}
```

**Required Permission:** `settings.delete`

---

### 6.5 Get Currencies

**Endpoint:** `GET /admin/settings/currencies`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "currencies": [
    {
      "code": "NGN",
      "name": "Nigerian Naira",
      "symbol": "₦",
      "enabled": true,
      "eventsCount": 487,
      "totalRevenue": 125000000
    },
    {
      "code": "USD",
      "name": "US Dollar",
      "symbol": "$",
      "enabled": true,
      "eventsCount": 125,
      "totalRevenue": 350000
    },
    {
      "code": "EUR",
      "name": "Euro",
      "symbol": "€",
      "enabled": false,
      "eventsCount": 0,
      "totalRevenue": 0
    }
  ]
}
```

**Required Permission:** `settings.read`

---

### 6.6 Toggle Currency

**Endpoint:** `PUT /admin/settings/currencies/:currencyCode`

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "enabled": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Currency enabled successfully",
  "currency": {
    "code": "EUR",
    "enabled": true,
    "updatedAt": "2025-01-15T10:30:00Z"
  }
}
```

**Response (400 Bad Request) - If disabling currency with active events:**
```json
{
  "success": false,
  "error": {
    "code": "CURRENCY_HAS_ACTIVE_EVENTS",
    "message": "Cannot disable currency with 125 active events",
    "eventsCount": 125
  }
}
```

**Required Permission:** `settings.write`

---

### 6.7 Get Validation Rules

**Endpoint:** `GET /admin/settings/validation-rules`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "rules": {
    "eventTitle": {
      "minLength": 5,
      "maxLength": 100
    },
    "eventDescription": {
      "minLength": 20,
      "maxLength": 2000
    },
    "ticketPrice": {
      "min": 0,
      "max": 10000000,
      "currency": "NGN"
    },
    "eventCapacity": {
      "min": 1,
      "max": 100000
    },
    "eventImages": {
      "minCount": 1,
      "maxCount": 5,
      "maxSizeMB": 5,
      "allowedFormats": ["jpg", "jpeg", "png", "webp"]
    }
  }
}
```

**Required Permission:** `settings.read`

---

### 6.8 Update Validation Rules

**Endpoint:** `PUT /admin/settings/validation-rules`

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "eventTitle": {
    "minLength": 10,
    "maxLength": 150
  },
  "eventDescription": {
    "minLength": 50,
    "maxLength": 3000
  },
  "ticketPrice": {
    "min": 0,
    "max": 50000000
  },
  "eventCapacity": {
    "min": 1,
    "max": 200000
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Validation rules updated successfully",
  "rules": { ... },
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

**Required Permission:** `settings.write`

---

## 7. Analytics (Future)

### 7.1 Get Analytics Overview

**Endpoint:** `GET /admin/analytics/overview`

**Status:** To be implemented

---

## 8. Admins Management (Future)

### 8.1 Get All Admins

**Endpoint:** `GET /admin/admins`

**Status:** To be implemented

### 8.2 Create Admin

**Endpoint:** `POST /admin/admins`

**Status:** To be implemented

---

## 9. Common Patterns

### 9.1 Pagination

All list endpoints support pagination with consistent parameters:

```
GET /admin/users?page=2&limit=50
```

Response format:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 2543,
    "page": 2,
    "pages": 51,
    "limit": 50,
    "hasNext": true,
    "hasPrev": true
  }
}
```

---

### 9.2 Searching

Search parameters are consistent across endpoints:

```
GET /admin/users?search=john
GET /admin/events?search=music+festival
```

Searches across relevant fields (name, email, title, etc.)

---

### 9.3 Filtering

Filter parameters use consistent naming:

```
GET /admin/events?status=pending&category=music&startDate=2025-01-01
```

---

### 9.4 Sorting

Sorting uses `sortBy` and `order`:

```
GET /admin/users?sortBy=createdAt&order=desc
```

---

## 10. Error Handling

### 10.1 Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional context"
    }
  }
}
```

---

### 10.2 HTTP Status Codes

- `200` - OK (Success)
- `201` - Created (Resource created successfully)
- `400` - Bad Request (Validation error, invalid parameters)
- `401` - Unauthorized (Invalid or missing token)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found (Resource doesn't exist)
- `409` - Conflict (Duplicate resource)
- `422` - Unprocessable Entity (Validation failed)
- `429` - Too Many Requests (Rate limit exceeded)
- `500` - Internal Server Error

---

### 10.3 Common Error Codes

**Authentication:**
- `INVALID_CREDENTIALS` - Wrong email/password
- `INVALID_TOKEN` - JWT token is invalid
- `EXPIRED_TOKEN` - JWT token has expired
- `UNAUTHORIZED` - No token provided
- `INSUFFICIENT_PERMISSIONS` - User doesn't have required permission

**Validation:**
- `VALIDATION_ERROR` - Input validation failed
- `MISSING_REQUIRED_FIELD` - Required field not provided
- `INVALID_FORMAT` - Field format is invalid

**Resources:**
- `NOT_FOUND` - Resource doesn't exist
- `ALREADY_EXISTS` - Duplicate resource
- `CANNOT_DELETE` - Resource cannot be deleted (has dependencies)

**Rate Limiting:**
- `RATE_LIMIT_EXCEEDED` - Too many requests

---

## 11. Security

### 11.1 Authentication

All admin endpoints require JWT authentication:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Expiry:** 8 hours
**Refresh Token Expiry:** 7 days

---

### 11.2 Permissions

Each endpoint requires specific permissions:

| Resource | Read | Write | Delete |
|----------|------|-------|--------|
| Users | `users.read` | `users.write` | `users.delete` |
| Events | `events.read` | `events.write` | `events.delete` |
| Analytics | `analytics.read` | - | - |
| Audit Logs | `audit_logs.read` | - | - |
| Admins | `admins.read` | `admins.write` | `admins.delete` |
| Settings | `settings.read` | `settings.write` | `settings.delete` |

**Super Admin** bypasses all permission checks.

---

### 11.3 Rate Limiting

**Login Endpoint:**
- 5 attempts per 15 minutes per IP
- 10 attempts per hour per email

**Other Endpoints:**
- 100 requests per minute per admin
- 1000 requests per hour per admin

**Response Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642251600
```

---

### 11.4 Audit Logging

**All admin actions MUST be logged:**

- Who performed the action (admin ID)
- What action was performed
- When it was performed (timestamp)
- What was changed (before/after values)
- IP address and user agent

---

### 11.5 IP Whitelisting (Optional)

Configure allowed IP addresses in environment:

```env
ENABLE_IP_WHITELIST=true
ALLOWED_IPS=192.168.1.100,203.45.67.89
```

---

## 12. Environment Variables

### Required:
```env
# API Base URL
API_URL=https://api.eventskona.com

# JWT Secrets
ADMIN_JWT_SECRET=your-super-secret-key-min-32-chars
ADMIN_JWT_EXPIRY=8h
ADMIN_REFRESH_TOKEN_SECRET=your-refresh-secret
ADMIN_REFRESH_TOKEN_EXPIRY=7d

# Database
DATABASE_URL=postgresql://user:pass@host:5432/eventskona

# CORS
CORS_ORIGIN=https://admin-dash.appguts.com
```

### Optional:
```env
# Security
ENABLE_IP_WHITELIST=false
ALLOWED_IPS=127.0.0.1,192.168.1.100

# Rate Limiting
RATE_LIMIT_LOGIN=5
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_GENERAL=100
RATE_LIMIT_GENERAL_WINDOW=1m

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=admin@eventskona.com
SMTP_PASS=your-app-password

# Notifications
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_SMS_NOTIFICATIONS=false
```

---

## 13. Testing

### 13.1 Postman Collection

Import the Postman collection: `EventsKona_Admin_API.postman_collection.json`

### 13.2 Test Accounts

**Super Admin:**
- Email: `admin@eventskona.com`
- Password: `Admin@123!`

**Moderator:**
- Email: `moderator@eventskona.com`
- Password: `Mod@123!`

**Viewer:**
- Email: `viewer@eventskona.com`
- Password: `View@123!`

---

## 14. Changelog

**v1.0.0** (January 2025)
- Initial API documentation
- Authentication endpoints
- Dashboard endpoints
- Users management endpoints
- Events management endpoints
- Audit logs endpoints
- Settings & configuration endpoints

---

## 15. Support

**Frontend Team:** dev@appguts.com
**Backend Team:** backend@eventskona.com
**Documentation:** https://docs.eventskona.com/admin-api

---

**End of Documentation**

Total Endpoints: **35 endpoints**
Status: **Ready for Implementation**
Last Updated: **January 15, 2025**
