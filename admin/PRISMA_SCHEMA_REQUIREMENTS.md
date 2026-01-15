# Prisma Schema Requirements for EventsKona Admin Panel

**Purpose:** This document outlines all required database models, fields, and relationships that must be present in the `schema.prisma` file to support the admin panel and API endpoints.

**Reference Documents:**
- `admin/ADMIN_API_DOCUMENTATION.md` - Complete API specification
- `admin/MANAGING_CONFIGURATION.md` - Settings configuration guide
- `admin/CODEBASE_API_VERIFICATION.md` - Frontend-API alignment verification

---

## Required Models

### 1. Admin Model ✅ REQUIRED

**Purpose:** Stores admin user accounts with roles and permissions

```prisma
model Admin {
  id            String   @id @default(cuid())
  email         String   @unique
  password      String   // Hashed with bcrypt
  name          String
  role          AdminRole
  avatar        String?
  isActive      Boolean  @default(true)
  lastLoginAt   DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  auditLogs     AuditLog[]

  @@index([email])
  @@index([role])
}

enum AdminRole {
  SUPER_ADMIN
  MODERATOR
  VIEWER
}
```

**Required Fields Explanation:**
- `id` - Unique identifier (CUID recommended for security)
- `email` - Login credential (must be unique)
- `password` - Hashed password (never store plaintext)
- `name` - Display name for UI
- `role` - One of: SUPER_ADMIN, MODERATOR, VIEWER
- `isActive` - Soft delete / suspension capability
- `lastLoginAt` - For security tracking
- `auditLogs` - Relation to track admin actions

**API Endpoints Using This:**
- `POST /admin/auth/login`
- `GET /admin/auth/me`
- `GET /admin/admins` (future)
- `POST /admin/admins` (future)

---

### 2. User Model ✅ REQUIRED (Shared with Main App)

**Purpose:** Main app users that admins manage

```prisma
model User {
  id              String       @id @default(cuid())
  email           String       @unique
  password        String       // Hashed
  firstName       String?
  lastName        String?
  phoneNumber     String?
  avatar          String?
  bio             String?
  status          UserStatus   @default(ACTIVE)
  emailVerified   Boolean      @default(false)
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  // Relations
  events          Event[]
  orders          Order[]
  tickets         Ticket[]
  messages        Message[]    @relation("ReceivedMessages")

  @@index([email])
  @@index([status])
  @@index([createdAt])
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  DELETED
}
```

**Required Fields Explanation:**
- `status` - Allows admin to suspend users
- `emailVerified` - Track verification status
- `createdAt` - For "Joined Date" in admin UI
- Relations to events, orders, tickets for count statistics

**API Endpoints Using This:**
- `GET /admin/users`
- `GET /admin/users/:id`
- `PUT /admin/users/:id/status`
- `DELETE /admin/users/:id`
- `POST /admin/users/:id/send-message`

**Admin UI Fields Required:**
- User table shows: name, email, status, eventsCreated (count), joinedDate
- User profile shows: full details + events list + orders list

---

### 3. Event Model ✅ REQUIRED (Shared with Main App)

**Purpose:** Events created by users, managed by admins

```prisma
model Event {
  id              String        @id @default(cuid())
  title           String
  description     String
  categoryId      String
  organizerId     String

  // Event Details
  startDate       DateTime
  endDate         DateTime?
  location        String?
  address         String?
  city            String?
  state           String?
  country         String?

  // Online Event
  isOnline        Boolean       @default(false)
  meetingLink     String?

  // Media
  coverImage      String?
  images          String[]      // Array of image URLs

  // Status & Moderation
  status          EventStatus   @default(PENDING)
  rejectionReason String?
  isFeatured      Boolean       @default(false)
  featuredAt      DateTime?

  // Stats
  viewCount       Int           @default(0)
  shareCount      Int           @default(0)

  // Timestamps
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  publishedAt     DateTime?

  // Relations
  organizer       User          @relation(fields: [organizerId], references: [id])
  category        Category      @relation(fields: [categoryId], references: [id])
  ticketTypes     TicketType[]
  orders          Order[]
  tickets         Ticket[]

  @@index([organizerId])
  @@index([categoryId])
  @@index([status])
  @@index([isFeatured])
  @@index([startDate])
  @@index([createdAt])
}

enum EventStatus {
  PENDING      // Submitted, awaiting approval
  APPROVED     // Admin approved
  REJECTED     // Admin rejected
  CANCELLED    // Organizer cancelled
  COMPLETED    // Event finished
}
```

**CRITICAL Fields for Admin Panel:**
- `status` - MUST have PENDING, APPROVED, REJECTED values
- `rejectionReason` - Required when admin rejects event
- `isFeatured` - Admin can feature events on homepage
- `featuredAt` - Track when featured
- `viewCount` - For analytics dashboard

**API Endpoints Using This:**
- `GET /admin/events`
- `GET /admin/events/:id`
- `PUT /admin/events/:id/status` - Approve/Reject
- `POST /admin/events/:id/feature` - Feature event
- `DELETE /admin/events/:id`

**Admin UI Requirements:**
- Events table filters by status: All, Pending, Approved, Rejected
- Show: title, organizer name, status, category, date, tickets sold
- Actions: Approve, Reject, Delete, Feature

---

### 4. Category Model ✅ REQUIRED

**Purpose:** Event categories managed through Settings page

```prisma
model Category {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  icon        String?  // Icon name (e.g., "Music", "Briefcase")
  color       String?  // Hex color (e.g., "#8b5cf6")
  isActive    Boolean  @default(true)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  events      Event[]

  @@index([isActive])
  @@index([sortOrder])
}
```

**Required for Settings Page:**
- Admin can add/edit/delete categories
- Must track event count per category
- Icon and color for UI display

**API Endpoints Using This:**
- `GET /api/admin/settings/categories`
- `POST /api/admin/settings/categories`
- `PUT /api/admin/settings/categories/:id`
- `DELETE /api/admin/settings/categories/:id`
- `GET /api/settings/categories` (public for main app)

**Default Categories (from main app):**
```sql
INSERT INTO "Category" (id, name, slug, icon, color) VALUES
  ('music', 'Music', 'music', 'Music', '#8b5cf6'),
  ('business', 'Business', 'business', 'Briefcase', '#3b82f6'),
  ('food', 'Food & Drink', 'food', 'Utensils', '#f97316'),
  ('arts', 'Arts', 'arts', 'Palette', '#ec4899'),
  ('sports', 'Sports', 'sports', 'Trophy', '#10b981'),
  ('tech', 'Technology', 'tech', 'Cpu', '#06b6d4'),
  ('education', 'Education', 'education', 'GraduationCap', '#f59e0b'),
  ('religious', 'Religious', 'religious', 'Calendar', '#f43f5e');
```

---

### 5. TicketType Model ✅ REQUIRED (Shared with Main App)

**Purpose:** Different ticket tiers for each event

```prisma
model TicketType {
  id              String   @id @default(cuid())
  eventId         String
  name            String   // e.g., "General Admission", "VIP"
  description     String?
  price           Decimal  @db.Decimal(10, 2)
  currency        String   @default("NGN")
  quantity        Int
  quantitySold    Int      @default(0)
  maxPerOrder     Int      @default(10)
  salesStartDate  DateTime?
  salesEndDate    DateTime?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  event           Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  tickets         Ticket[]

  @@index([eventId])
  @@index([isActive])
}
```

**Required for Admin Dashboard:**
- Calculate total tickets sold per event
- Revenue calculations (price × quantitySold)
- Support multiple currencies

---

### 6. Order Model ✅ REQUIRED (Shared with Main App)

**Purpose:** Ticket purchase orders for revenue tracking

```prisma
model Order {
  id              String      @id @default(cuid())
  userId          String
  eventId         String
  orderNumber     String      @unique
  status          OrderStatus @default(PENDING)

  // Payment
  totalAmount     Decimal     @db.Decimal(10, 2)
  currency        String      @default("NGN")
  paymentMethod   String?
  paymentIntentId String?
  paidAt          DateTime?

  // Buyer Info
  buyerEmail      String
  buyerName       String
  buyerPhone      String?

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relations
  user            User        @relation(fields: [userId], references: [id])
  event           Event       @relation(fields: [eventId], references: [id])
  tickets         Ticket[]

  @@index([userId])
  @@index([eventId])
  @@index([status])
  @@index([createdAt])
}

enum OrderStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
  CANCELLED
}
```

**Required for Admin Dashboard:**
- Revenue stats: SUM(totalAmount) WHERE status = COMPLETED
- Filter by date range for charts
- Track payment methods

---

### 7. Ticket Model ✅ REQUIRED (Shared with Main App)

**Purpose:** Individual tickets issued from orders

```prisma
model Ticket {
  id            String       @id @default(cuid())
  orderId       String
  userId        String
  eventId       String
  ticketTypeId  String
  ticketNumber  String       @unique
  qrCode        String?
  status        TicketStatus @default(ACTIVE)
  checkedInAt   DateTime?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  // Relations
  order         Order        @relation(fields: [orderId], references: [id])
  user          User         @relation(fields: [userId], references: [id])
  event         Event        @relation(fields: [eventId], references: [id])
  ticketType    TicketType   @relation(fields: [ticketTypeId], references: [id])

  @@index([orderId])
  @@index([userId])
  @@index([eventId])
  @@index([status])
}

enum TicketStatus {
  ACTIVE
  USED
  CANCELLED
  REFUNDED
}
```

**Required for Admin Dashboard:**
- Total tickets sold count
- Check-in statistics

---

### 8. AuditLog Model ✅ REQUIRED FOR ADMIN

**Purpose:** Track all admin actions for security and compliance

```prisma
model AuditLog {
  id          String   @id @default(cuid())
  adminId     String
  action      String   // e.g., "USER_SUSPENDED", "EVENT_APPROVED"
  targetType  String   // e.g., "User", "Event", "Category"
  targetId    String?
  details     Json?    // Additional details in JSON format
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())

  // Relations
  admin       Admin    @relation(fields: [adminId], references: [id])

  @@index([adminId])
  @@index([action])
  @@index([targetType])
  @@index([createdAt])
}
```

**CRITICAL for Admin Panel:**
- Every admin action MUST create audit log entry
- Displayed in Audit Logs page
- Filter by: action, admin, date range

**API Endpoints Using This:**
- `GET /admin/audit-logs`
- `GET /admin/audit-logs/export`

**Required Audit Actions:**
```typescript
enum AuditAction {
  // Authentication
  ADMIN_LOGIN = "ADMIN_LOGIN"
  ADMIN_LOGOUT = "ADMIN_LOGOUT"

  // Users
  USER_VIEWED = "USER_VIEWED"
  USER_SUSPENDED = "USER_SUSPENDED"
  USER_ACTIVATED = "USER_ACTIVATED"
  USER_DELETED = "USER_DELETED"
  USER_MESSAGE_SENT = "USER_MESSAGE_SENT"

  // Events
  EVENT_VIEWED = "EVENT_VIEWED"
  EVENT_APPROVED = "EVENT_APPROVED"
  EVENT_REJECTED = "EVENT_REJECTED"
  EVENT_DELETED = "EVENT_DELETED"
  EVENT_FEATURED = "EVENT_FEATURED"
  EVENT_UNFEATURED = "EVENT_UNFEATURED"

  // Categories
  CATEGORY_CREATED = "CATEGORY_CREATED"
  CATEGORY_UPDATED = "CATEGORY_UPDATED"
  CATEGORY_DELETED = "CATEGORY_DELETED"

  // Settings
  CURRENCY_ENABLED = "CURRENCY_ENABLED"
  CURRENCY_DISABLED = "CURRENCY_DISABLED"
  VALIDATION_RULES_UPDATED = "VALIDATION_RULES_UPDATED"
}
```

---

### 9. Settings Model ✅ REQUIRED FOR ADMIN

**Purpose:** Store platform configuration (categories, currencies, validation rules)

```prisma
model Setting {
  id          String   @id @default(cuid())
  key         String   @unique
  value       Json     // JSONB storage for flexible config
  description String?
  updatedBy   String?  // Admin ID
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([key])
}
```

**Required Settings Keys:**

1. **`currencies`** - Supported currencies
```json
{
  "currencies": [
    {"code": "NGN", "name": "Nigerian Naira", "symbol": "₦", "enabled": true},
    {"code": "USD", "name": "US Dollar", "symbol": "$", "enabled": true},
    {"code": "GHS", "name": "Ghanaian Cedi", "symbol": "GH₵", "enabled": true},
    {"code": "EUR", "name": "Euro", "symbol": "€", "enabled": false},
    {"code": "GBP", "name": "British Pound", "symbol": "£", "enabled": false}
  ]
}
```

2. **`validation_rules`** - Form validation constraints
```json
{
  "eventTitle": {"minLength": 5, "maxLength": 100},
  "eventDescription": {"minLength": 20, "maxLength": 2000},
  "ticketPrice": {"min": 0, "max": 10000000},
  "eventCapacity": {"min": 1, "max": 100000}
}
```

**API Endpoints Using This:**
- `GET /api/admin/settings/currencies`
- `PUT /api/admin/settings/currencies/:code`
- `GET /api/settings/currencies` (public)
- `GET /api/admin/settings/validation-rules`
- `PUT /api/admin/settings/validation-rules`
- `GET /api/settings/validation-rules` (public)

---

### 10. Message Model ✅ REQUIRED FOR ADMIN

**Purpose:** Admin can send messages to users

```prisma
model Message {
  id          String      @id @default(cuid())
  recipientId String
  subject     String
  body        String
  sentBy      String?     // Admin ID
  isRead      Boolean     @default(false)
  readAt      DateTime?
  createdAt   DateTime    @default(now())

  // Relations
  recipient   User        @relation("ReceivedMessages", fields: [recipientId], references: [id])

  @@index([recipientId])
  @@index([isRead])
  @@index([createdAt])
}
```

**API Endpoints Using This:**
- `POST /admin/users/:id/send-message`

---

## Database Indexes Required

**Performance Critical Indexes:**

```prisma
// User indexes
@@index([email])           // Login lookups
@@index([status])          // Filter by status
@@index([createdAt])       // Sort by join date

// Event indexes
@@index([status])          // Filter pending/approved
@@index([organizerId])     // User's events
@@index([categoryId])      // Filter by category
@@index([isFeatured])      // Featured events query
@@index([startDate])       // Upcoming events
@@index([createdAt])       // Recent events

// Order indexes
@@index([userId])          // User's orders
@@index([eventId])         // Event's orders
@@index([status])          // Completed orders
@@index([createdAt])       // Revenue by date

// AuditLog indexes
@@index([adminId])         // Admin's actions
@@index([action])          // Filter by action type
@@index([targetType])      // Filter by target
@@index([createdAt])       // Recent activity
```

---

## Common Schema Issues to Check

### ❌ Missing Fields That Will Break Admin Panel:

1. **User.status** - MUST exist for suspension feature
2. **Event.status** - MUST have PENDING/APPROVED/REJECTED
3. **Event.isFeatured** - Required for feature event functionality
4. **Event.rejectionReason** - Required when rejecting events
5. **Admin model** - Completely missing? Must add!
6. **AuditLog model** - Completely missing? Must add!
7. **Setting model** - Completely missing? Must add!

### ❌ Incorrect Enum Values:

1. **EventStatus** must include:
   - `PENDING` (new events awaiting approval)
   - `APPROVED` (admin approved)
   - `REJECTED` (admin rejected)

2. **UserStatus** must include:
   - `ACTIVE` (normal user)
   - `SUSPENDED` (admin suspended)
   - `DELETED` (soft delete)

3. **AdminRole** must include:
   - `SUPER_ADMIN` (full access)
   - `MODERATOR` (limited access)
   - `VIEWER` (read-only)

### ❌ Missing Relations:

1. User → Events (one-to-many)
2. User → Orders (one-to-many)
3. Event → Category (many-to-one)
4. Event → TicketTypes (one-to-many)
5. Event → Orders (one-to-many)
6. Order → Tickets (one-to-many)
7. Admin → AuditLogs (one-to-many)

### ❌ Wrong Data Types:

1. **Price fields** - MUST be `Decimal @db.Decimal(10, 2)`, NOT Float
2. **Email fields** - MUST have `@unique` constraint
3. **JSON fields** - Use `Json` type for flexible data (settings, audit details)
4. **Date fields** - Use `DateTime` with proper defaults

---

## Verification Checklist

Use this checklist to verify the Prisma schema:

### Core Models
- [ ] `Admin` model exists with role and permissions
- [ ] `User` model has `status` field (ACTIVE/SUSPENDED/DELETED)
- [ ] `Event` model has `status` field (PENDING/APPROVED/REJECTED)
- [ ] `Event` model has `isFeatured` boolean field
- [ ] `Event` model has `rejectionReason` text field
- [ ] `Category` model exists with name, icon, color
- [ ] `TicketType` model exists with price and quantity
- [ ] `Order` model exists with totalAmount and status
- [ ] `Ticket` model exists
- [ ] `AuditLog` model exists for admin actions
- [ ] `Setting` model exists with JSON value field
- [ ] `Message` model exists for admin-to-user messages

### Enums
- [ ] `AdminRole` enum (SUPER_ADMIN, MODERATOR, VIEWER)
- [ ] `UserStatus` enum (ACTIVE, SUSPENDED, DELETED)
- [ ] `EventStatus` enum (PENDING, APPROVED, REJECTED, CANCELLED, COMPLETED)
- [ ] `OrderStatus` enum (PENDING, COMPLETED, FAILED, REFUNDED)
- [ ] `TicketStatus` enum (ACTIVE, USED, CANCELLED, REFUNDED)

### Relations
- [ ] User.events → Event[]
- [ ] User.orders → Order[]
- [ ] Event.organizer → User
- [ ] Event.category → Category
- [ ] Event.ticketTypes → TicketType[]
- [ ] Order.user → User
- [ ] Order.event → Event
- [ ] Admin.auditLogs → AuditLog[]

### Indexes (Performance)
- [ ] User: email, status, createdAt
- [ ] Event: status, organizerId, categoryId, isFeatured, startDate
- [ ] Order: userId, eventId, status, createdAt
- [ ] AuditLog: adminId, action, targetType, createdAt

### Data Types
- [ ] All price fields use `Decimal @db.Decimal(10, 2)`
- [ ] All email fields have `@unique` constraint
- [ ] Setting.value uses `Json` type
- [ ] AuditLog.details uses `Json` type

### Required Fields for Admin Features
- [ ] Event.viewCount (Int) for analytics
- [ ] Event.featuredAt (DateTime?) to track when featured
- [ ] Order.paidAt (DateTime?) for revenue tracking
- [ ] Ticket.checkedInAt (DateTime?) for attendance tracking
- [ ] Admin.lastLoginAt (DateTime?) for security
- [ ] AuditLog.ipAddress and userAgent for security

---

## SQL Migration Examples

If fields are missing, here are the SQL migrations needed:

### Add Event Status Fields
```sql
-- Add status column if missing
ALTER TABLE "Event" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'PENDING';

-- Add featured fields
ALTER TABLE "Event" ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Event" ADD COLUMN "featuredAt" TIMESTAMP;
ALTER TABLE "Event" ADD COLUMN "rejectionReason" TEXT;

-- Create index
CREATE INDEX "Event_status_idx" ON "Event"("status");
CREATE INDEX "Event_isFeatured_idx" ON "Event"("isFeatured");
```

### Add User Status
```sql
ALTER TABLE "User" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ACTIVE';
CREATE INDEX "User_status_idx" ON "User"("status");
```

### Create Admin Table
```sql
CREATE TABLE "Admin" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "avatar" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "lastLoginAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL,

  CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");
CREATE INDEX "Admin_role_idx" ON "Admin"("role");
```

### Create AuditLog Table
```sql
CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "adminId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT,
  "details" JSONB,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditLog_adminId_idx" ON "AuditLog"("adminId");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_adminId_fkey"
  FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

### Create Settings Table
```sql
CREATE TABLE "Setting" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "value" JSONB NOT NULL,
  "description" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL,

  CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");

-- Insert default settings
INSERT INTO "Setting" (id, key, value) VALUES
  (gen_random_uuid(), 'currencies', '[
    {"code": "NGN", "name": "Nigerian Naira", "symbol": "₦", "enabled": true},
    {"code": "USD", "name": "US Dollar", "symbol": "$", "enabled": true},
    {"code": "GHS", "name": "Ghanaian Cedi", "symbol": "GH₵", "enabled": true},
    {"code": "EUR", "name": "Euro", "symbol": "€", "enabled": false},
    {"code": "GBP", "name": "British Pound", "symbol": "£", "enabled": false}
  ]'::jsonb),
  (gen_random_uuid(), 'validation_rules', '{
    "eventTitle": {"minLength": 5, "maxLength": 100},
    "eventDescription": {"minLength": 20, "maxLength": 2000},
    "ticketPrice": {"min": 0, "max": 10000000},
    "eventCapacity": {"min": 1, "max": 100000}
  }'::jsonb);
```

---

## Summary

**The Prisma schema MUST include:**

1. ✅ **Admin model** - For admin authentication and permissions
2. ✅ **User.status** - For user suspension feature
3. ✅ **Event.status** - For event approval workflow (PENDING/APPROVED/REJECTED)
4. ✅ **Event.isFeatured** - For featuring events
5. ✅ **Event.rejectionReason** - For rejection feedback
6. ✅ **Category model** - For dynamic category management
7. ✅ **AuditLog model** - For tracking all admin actions
8. ✅ **Setting model** - For currencies and validation rules
9. ✅ **Message model** - For admin-to-user messaging
10. ✅ **Proper enums** - AdminRole, UserStatus, EventStatus, OrderStatus
11. ✅ **All relations** - User-Event, Event-Category, Order-User, etc.
12. ✅ **Performance indexes** - On status, email, dates, IDs
13. ✅ **Decimal types** - For all price/money fields

**Without these, the admin panel CANNOT function.**

---

**Next Steps:**
1. Compare actual schema.prisma against this document
2. Identify missing models/fields/enums
3. Create migration to add missing elements
4. Seed database with default categories and settings
5. Create first super admin account for testing

**Questions to Ask Backend Developer:**
1. Does Admin model exist?
2. Does Event have PENDING/APPROVED/REJECTED status?
3. Does AuditLog model exist for tracking admin actions?
4. Does Setting model exist for configuration?
5. Are all enums defined correctly?
6. Are indexes added for performance?
