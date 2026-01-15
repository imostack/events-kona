# Prisma Schema Review & Gap Analysis

**Date:** January 2025
**Reviewer:** Admin Panel Development Team
**Schema Version:** Current (as provided by Backend Developer)

---

## Executive Summary

**Status:** ❌ **CRITICAL ISSUES FOUND - Schema requires significant changes**

The current schema is well-structured for the main EventsKona application, but is **missing critical models and fields** required for the admin panel to function. Without these additions, the admin panel cannot:
- Authenticate admin users
- Track admin actions (audit logs)
- Approve/reject events
- Suspend users
- Manage platform settings
- Send messages to users

---

## Critical Missing Components

### 🔴 BLOCKER #1: No Admin Model

**Problem:** There is no `Admin` model for admin authentication.

**Current State:**
```prisma
enum UserRole {
  USER
  ORGANIZER
  ADMIN  // ❌ This is for regular users with admin privileges, NOT admin panel users
}
```

**Issue:** The schema has `ADMIN` in the `UserRole` enum, but this appears to be for regular users with elevated privileges on the main app, NOT for the separate admin panel authentication system.

**Required Fix:** Add a dedicated `Admin` model:

```prisma
model Admin {
  id            String      @id @default(uuid())
  email         String      @unique
  passwordHash  String
  name          String
  role          AdminRole
  avatar        String?
  isActive      Boolean     @default(true)
  lastLoginAt   DateTime?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  // Relations
  auditLogs     AuditLog[]

  @@map("admins")
  @@index([email])
  @@index([role])
  @@index([isActive])
}

enum AdminRole {
  SUPER_ADMIN
  MODERATOR
  VIEWER
}
```

**Impact:** Without this, admin login (`POST /admin/auth/login`) cannot work.

---

### 🔴 BLOCKER #2: No AuditLog Model

**Problem:** There is a `SystemLog` model, but it's not suitable for admin audit logging.

**Current SystemLog:**
```prisma
model SystemLog {
  id          String   @id @default(uuid())
  action      String
  entityType  String?
  entityId    String?
  userId      String?  // ❌ References User, not Admin
  user        User?    @relation(fields: [userId], references: [id])
  // ...
}
```

**Issues:**
1. `userId` references `User` table (main app users), not admins
2. No dedicated fields for admin-specific actions
3. Generic naming doesn't differentiate admin actions from user actions

**Required Fix:** Add dedicated `AuditLog` model:

```prisma
model AuditLog {
  id          String   @id @default(uuid())
  adminId     String
  admin       Admin    @relation(fields: [adminId], references: [id])
  action      String   // e.g., "EVENT_APPROVED", "USER_SUSPENDED"
  targetType  String   // e.g., "User", "Event", "Category"
  targetId    String?
  details     Json?    // Additional context
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())

  @@map("audit_logs")
  @@index([adminId])
  @@index([action])
  @@index([targetType])
  @@index([createdAt])
}
```

**Impact:** Without this, the Audit Logs page (`/admin/audit-logs`) cannot track admin actions.

---

### 🔴 BLOCKER #3: No Event Approval System

**Problem:** Events don't have a status field for pending/approved/rejected workflow.

**Current Event Model:**
```prisma
model Event {
  // Status
  isPublished      Boolean     @default(false)
  isFeatured       Boolean     @default(false)
  isCancelled      Boolean     @default(false)
  // ❌ No approval status
}
```

**Issues:**
1. No `status` field with values like PENDING, APPROVED, REJECTED
2. No `rejectionReason` field for admin feedback when rejecting
3. `isPublished` is boolean, but we need multi-state workflow

**Required Fix:** Add event approval fields:

```prisma
model Event {
  // ... existing fields ...

  // Moderation & Approval
  status           EventStatus  @default(PENDING)
  rejectionReason  String?
  approvedBy       String?      // Admin ID who approved
  approvedAt       DateTime?
  rejectedBy       String?      // Admin ID who rejected
  rejectedAt       DateTime?

  // ... rest of fields ...

  @@index([status])
}

enum EventStatus {
  PENDING      // Newly created, awaiting admin approval
  APPROVED     // Admin approved, visible to public
  REJECTED     // Admin rejected
  CANCELLED    // Organizer cancelled
  COMPLETED    // Event has finished
}
```

**Impact:** Without this:
- Admins cannot approve/reject events (`PUT /admin/events/:id/status`)
- Events page filter by status won't work
- No moderation workflow

---

### 🔴 BLOCKER #4: No User Suspension System

**Problem:** Users cannot be suspended by admins.

**Current User Model:**
```prisma
model User {
  id                       String        @id @default(uuid())
  email                    String        @unique
  // ❌ No status field for ACTIVE/SUSPENDED/DELETED
  emailVerified            Boolean       @default(false)
  role                     UserRole      @default(USER)
}
```

**Required Fix:** Add user status field:

```prisma
model User {
  // ... existing fields ...

  status              UserStatus   @default(ACTIVE)
  suspendedBy         String?      // Admin ID who suspended
  suspendedAt         DateTime?
  suspensionReason    String?

  // ... rest of fields ...

  @@index([status])
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  DELETED
}
```

**Impact:** Without this, admins cannot suspend users (`PUT /admin/users/:id/status`).

---

### 🔴 BLOCKER #5: No Settings Model

**Problem:** No way to store dynamic platform configuration (categories, currencies, validation rules).

**Current State:** Categories are hardcoded in frontend code.

**Required Fix:** Add Settings model:

```prisma
model Setting {
  id          String   @id @default(uuid())
  key         String   @unique
  value       Json     // JSONB for flexible config
  description String?
  updatedBy   String?  // Admin ID
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("settings")
  @@index([key])
}
```

**Default Data Needed:**
```sql
INSERT INTO settings (id, key, value) VALUES
  -- Currencies
  (gen_random_uuid(), 'currencies', '[
    {"code": "NGN", "name": "Nigerian Naira", "symbol": "₦", "enabled": true},
    {"code": "USD", "name": "US Dollar", "symbol": "$", "enabled": true},
    {"code": "GHS", "name": "Ghanaian Cedi", "symbol": "GH₵", "enabled": true},
    {"code": "EUR", "name": "Euro", "symbol": "€", "enabled": false},
    {"code": "GBP", "name": "British Pound", "symbol": "£", "enabled": false}
  ]'::jsonb),

  -- Validation Rules
  (gen_random_uuid(), 'validation_rules', '{
    "eventTitle": {"minLength": 5, "maxLength": 100},
    "eventDescription": {"minLength": 20, "maxLength": 2000},
    "ticketPrice": {"min": 0, "max": 10000000},
    "eventCapacity": {"min": 1, "max": 100000}
  }'::jsonb);
```

**Impact:** Without this:
- Settings page (`/admin/settings`) cannot manage currencies
- Cannot update validation rules dynamically
- Categories remain hardcoded

---

### 🔴 BLOCKER #6: No Category Model

**Problem:** Categories are stored as strings, not a proper table.

**Current Event Model:**
```prisma
model Event {
  category         String  // ❌ Just a string, not a relation
  tags             String[]
}
```

**Issues:**
1. Cannot manage categories from admin panel
2. Cannot add icons/colors to categories
3. Cannot track events per category
4. Cannot enforce valid category values

**Required Fix:** Add Category model:

```prisma
model Category {
  id          String   @id @default(uuid())
  name        String   @unique
  slug        String   @unique
  icon        String?  // Icon name (e.g., "Music", "Briefcase")
  color       String?  // Hex color (e.g., "#8b5cf6")
  description String?
  isActive    Boolean  @default(true)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  events      Event[]

  @@map("categories")
  @@index([isActive])
  @@index([sortOrder])
}

// Update Event model:
model Event {
  // Change this:
  // category         String

  // To this:
  categoryId       String?
  category         Category? @relation(fields: [categoryId], references: [id])

  @@index([categoryId])
}
```

**Default Categories:**
```sql
INSERT INTO categories (id, name, slug, icon, color) VALUES
  (gen_random_uuid(), 'Music', 'music', 'Music', '#8b5cf6'),
  (gen_random_uuid(), 'Business', 'business', 'Briefcase', '#3b82f6'),
  (gen_random_uuid(), 'Food & Drink', 'food', 'Utensils', '#f97316'),
  (gen_random_uuid(), 'Arts', 'arts', 'Palette', '#ec4899'),
  (gen_random_uuid(), 'Sports', 'sports', 'Trophy', '#10b981'),
  (gen_random_uuid(), 'Technology', 'tech', 'Cpu', '#06b6d4'),
  (gen_random_uuid(), 'Education', 'education', 'GraduationCap', '#f59e0b'),
  (gen_random_uuid(), 'Religious', 'religious', 'Calendar', '#f43f5e');
```

**Impact:** Without this:
- Cannot manage categories from Settings page
- Cannot add new categories without code deployment
- Main app cannot fetch dynamic category list

---

### 🟡 BLOCKER #7: No Message Model (Admin-to-User)

**Problem:** No way for admins to send messages to users.

**Current State:** No message system exists.

**Required Fix:** Add Message model:

```prisma
model Message {
  id          String   @id @default(uuid())
  recipientId String
  recipient   User     @relation("ReceivedMessages", fields: [recipientId], references: [id])
  subject     String
  body        String
  sentBy      String?  // Admin ID
  isRead      Boolean  @default(false)
  readAt      DateTime?
  createdAt   DateTime @default(now())

  @@map("messages")
  @@index([recipientId])
  @@index([isRead])
  @@index([createdAt])
}

// Update User model to add relation:
model User {
  // ... existing fields ...
  messagesReceived  Message[] @relation("ReceivedMessages")
}
```

**Impact:** Without this, admins cannot send messages (`POST /admin/users/:id/send-message`).

---

## Other Issues Found

### ⚠️ Issue #8: Event.isFeatured Missing Timestamp

**Current:**
```prisma
isFeatured       Boolean     @default(false)
```

**Recommended:**
```prisma
isFeatured       Boolean     @default(false)
featuredBy       String?     // Admin ID who featured it
featuredAt       DateTime?   // When it was featured
```

**Impact:** Minor - tracking who featured and when is useful for audit purposes.

---

### ⚠️ Issue #9: Missing Database URL in Datasource

**Current:**
```prisma
datasource db {
  provider = "postgresql"
  // ❌ No url field
}
```

**Required:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Impact:** Schema won't work without DATABASE_URL.

---

### ⚠️ Issue #10: Order.finalAmount vs totalAmount

**Current:**
```prisma
model Order {
  totalAmount      Decimal
  discountAmount   Decimal     @default(0)
  finalAmount      Decimal
}
```

**Question:** Is `finalAmount` calculated as `totalAmount - discountAmount`? Should be clarified or made a computed field.

---

### ⚠️ Issue #11: TicketStatus Enum Mismatch

**Current:**
```prisma
enum TicketStatus {
  VALID
  USED
  CANCELLED
  TRANSFERRED
  REFUNDED
}
```

**Admin Panel Expects:**
```prisma
enum TicketStatus {
  ACTIVE      // Instead of VALID
  USED
  CANCELLED
  REFUNDED
}
```

**Impact:** Minor naming difference. Either update admin panel or keep as is.

---

## Schema Completeness Checklist

### ✅ What's Good in Current Schema:

- [x] User model with comprehensive fields
- [x] Event model with detailed information
- [x] TicketType model properly structured
- [x] Order model with payment tracking
- [x] Payment model with Paystack integration
- [x] Attendee tracking system
- [x] Notification system
- [x] Support ticket system
- [x] Proper indexes on frequently queried fields
- [x] Payout system for organizers

### ❌ Critical Missing for Admin Panel:

- [ ] **Admin model** (authentication)
- [ ] **AuditLog model** (admin action tracking)
- [ ] **Event.status** field (PENDING/APPROVED/REJECTED)
- [ ] **Event.rejectionReason** field
- [ ] **User.status** field (ACTIVE/SUSPENDED/DELETED)
- [ ] **Category model** (dynamic category management)
- [ ] **Setting model** (platform configuration)
- [ ] **Message model** (admin-to-user messaging)

### ⚠️ Recommended Additions:

- [ ] Event.featuredBy and featuredAt timestamps
- [ ] User.suspendedBy and suspensionReason
- [ ] Event.approvedBy and approvedAt timestamps
- [ ] Database URL in datasource config

---

## Impact Analysis

### Admin Panel Pages Affected:

| Page | Current Status | Blocker |
|------|---------------|---------|
| Login (`/admin/login`) | ❌ Cannot work | No Admin model |
| Dashboard (`/admin`) | ⚠️ Partial | Missing audit logs for activity feed |
| Users (`/admin/users`) | ❌ Cannot suspend | No User.status field |
| Events (`/admin/events`) | ❌ Cannot approve/reject | No Event.status field |
| Audit Logs (`/admin/audit-logs`) | ❌ Cannot track | No AuditLog model |
| Settings (`/admin/settings`) | ❌ Cannot manage | No Setting/Category models |

**Verdict:** 0% of admin panel features will work with current schema.

---

## API Endpoints Affected

### ❌ Completely Blocked (Cannot Implement):

1. `POST /admin/auth/login` - No Admin model
2. `GET /admin/auth/me` - No Admin model
3. `PUT /admin/events/:id/status` - No Event.status field
4. `PUT /admin/users/:id/status` - No User.status field
5. `GET /admin/audit-logs` - No AuditLog model
6. `GET /admin/settings/categories` - No Category model
7. `PUT /admin/settings/currencies/:code` - No Setting model
8. `POST /admin/users/:id/send-message` - No Message model

### ⚠️ Partially Working (Missing Optional Fields):

1. `GET /admin/dashboard/stats` - Works but incomplete
2. `GET /admin/users` - Works but cannot filter by status
3. `GET /admin/events` - Works but cannot filter by approval status

---

## Migration Plan

### Phase 1: Critical Admin Authentication (Week 1)

**Priority:** 🔴 CRITICAL

**Add:**
```prisma
model Admin {
  id            String      @id @default(uuid())
  email         String      @unique
  passwordHash  String
  name          String
  role          AdminRole
  avatar        String?
  isActive      Boolean     @default(true)
  lastLoginAt   DateTime?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  auditLogs     AuditLog[]

  @@map("admins")
  @@index([email])
  @@index([role])
}

enum AdminRole {
  SUPER_ADMIN
  MODERATOR
  VIEWER
}
```

**Seed Data:**
```sql
-- Create first super admin (IMPORTANT: Change password after first login!)
INSERT INTO admins (id, email, password_hash, name, role, is_active)
VALUES (
  gen_random_uuid(),
  'admin@eventskona.com',
  '$2b$10$YourHashedPasswordHere',  -- Use bcrypt to hash "admin123" or similar
  'Super Admin',
  'SUPER_ADMIN',
  true
);
```

**Enables:** Admin login functionality

---

### Phase 2: Event Approval System (Week 1)

**Priority:** 🔴 CRITICAL

**Add to Event model:**
```prisma
status           EventStatus  @default(PENDING)
rejectionReason  String?
approvedBy       String?
approvedAt       DateTime?
rejectedBy       String?
rejectedAt       DateTime?

@@index([status])
```

**Add enum:**
```prisma
enum EventStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
  COMPLETED
}
```

**Migration:**
```sql
-- Add status column
ALTER TABLE events ADD COLUMN status TEXT NOT NULL DEFAULT 'PENDING';

-- Update existing published events to APPROVED
UPDATE events SET status = 'APPROVED' WHERE is_published = true;

-- Add other columns
ALTER TABLE events ADD COLUMN rejection_reason TEXT;
ALTER TABLE events ADD COLUMN approved_by TEXT;
ALTER TABLE events ADD COLUMN approved_at TIMESTAMP;
ALTER TABLE events ADD COLUMN rejected_by TEXT;
ALTER TABLE events ADD COLUMN rejected_at TIMESTAMP;

-- Add index
CREATE INDEX events_status_idx ON events(status);
```

**Enables:** Event approval/rejection workflow

---

### Phase 3: User Suspension System (Week 1)

**Priority:** 🔴 CRITICAL

**Add to User model:**
```prisma
status              UserStatus   @default(ACTIVE)
suspendedBy         String?
suspendedAt         DateTime?
suspensionReason    String?

@@index([status])
```

**Add enum:**
```prisma
enum UserStatus {
  ACTIVE
  SUSPENDED
  DELETED
}
```

**Migration:**
```sql
ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE users ADD COLUMN suspended_by TEXT;
ALTER TABLE users ADD COLUMN suspended_at TIMESTAMP;
ALTER TABLE users ADD COLUMN suspension_reason TEXT;
CREATE INDEX users_status_idx ON users(status);
```

**Enables:** User suspension feature

---

### Phase 4: Audit Logging (Week 2)

**Priority:** 🔴 CRITICAL

**Add:**
```prisma
model AuditLog {
  id          String   @id @default(uuid())
  adminId     String
  admin       Admin    @relation(fields: [adminId], references: [id])
  action      String
  targetType  String
  targetId    String?
  details     Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())

  @@map("audit_logs")
  @@index([adminId])
  @@index([action])
  @@index([targetType])
  @@index([createdAt])
}
```

**Enables:** Audit Logs page and compliance tracking

---

### Phase 5: Dynamic Categories (Week 2)

**Priority:** 🟡 HIGH

**Add:**
```prisma
model Category {
  id          String   @id @default(uuid())
  name        String   @unique
  slug        String   @unique
  icon        String?
  color       String?
  description String?
  isActive    Boolean  @default(true)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  events      Event[]

  @@map("categories")
  @@index([isActive])
  @@index([sortOrder])
}
```

**Update Event:**
```prisma
// Remove: category String
// Add:
categoryId  String?
category    Category? @relation(fields: [categoryId], references: [id])

@@index([categoryId])
```

**Migration:**
```sql
-- Create categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  color TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, slug, icon, color, sort_order) VALUES
  ('Music', 'music', 'Music', '#8b5cf6', 1),
  ('Business', 'business', 'Briefcase', '#3b82f6', 2),
  ('Food & Drink', 'food', 'Utensils', '#f97316', 3),
  ('Arts', 'arts', 'Palette', '#ec4899', 4),
  ('Sports', 'sports', 'Trophy', '#10b981', 5),
  ('Technology', 'tech', 'Cpu', '#06b6d4', 6),
  ('Education', 'education', 'GraduationCap', '#f59e0b', 7),
  ('Religious', 'religious', 'Calendar', '#f43f5e', 8);

-- Migrate existing events
ALTER TABLE events ADD COLUMN category_id UUID;

-- Map old string categories to new category IDs
UPDATE events e
SET category_id = c.id
FROM categories c
WHERE LOWER(e.category) = LOWER(c.slug);

-- Drop old column (after verifying migration)
-- ALTER TABLE events DROP COLUMN category;

-- Add foreign key
ALTER TABLE events
ADD CONSTRAINT events_category_id_fkey
FOREIGN KEY (category_id) REFERENCES categories(id);
```

**Enables:** Dynamic category management from Settings page

---

### Phase 6: Settings & Configuration (Week 2)

**Priority:** 🟡 HIGH

**Add:**
```prisma
model Setting {
  id          String   @id @default(uuid())
  key         String   @unique
  value       Json
  description String?
  updatedBy   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("settings")
  @@index([key])
}
```

**Seed:**
```sql
INSERT INTO settings (id, key, value) VALUES
  (gen_random_uuid(), 'currencies', '[
    {"code": "NGN", "name": "Nigerian Naira", "symbol": "₦", "enabled": true},
    {"code": "USD", "name": "US Dollar", "symbol": "$", "enabled": true},
    {"code": "GHS", "name": "Ghanaian Cedi", "symbol": "GH₵", "enabled": true}
  ]'::jsonb),
  (gen_random_uuid(), 'validation_rules', '{
    "eventTitle": {"minLength": 5, "maxLength": 100},
    "eventDescription": {"minLength": 20, "maxLength": 2000},
    "ticketPrice": {"min": 0, "max": 10000000},
    "eventCapacity": {"min": 1, "max": 100000}
  }'::jsonb);
```

**Enables:** Currency management and validation rules from Settings page

---

### Phase 7: Admin Messaging (Week 3)

**Priority:** 🟢 MEDIUM

**Add:**
```prisma
model Message {
  id          String   @id @default(uuid())
  recipientId String
  recipient   User     @relation("ReceivedMessages", fields: [recipientId], references: [id])
  subject     String
  body        String
  sentBy      String?
  isRead      Boolean  @default(false)
  readAt      DateTime?
  createdAt   DateTime @default(now())

  @@map("messages")
  @@index([recipientId])
  @@index([isRead])
}
```

**Update User:**
```prisma
messagesReceived  Message[] @relation("ReceivedMessages")
```

**Enables:** Admin-to-user messaging feature

---

## Complete Updated Schema

Here's what the final schema should look like with all changes:

```prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["jsonProtocol"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  // ✅ Added
}

// ===== ADMIN PANEL ENUMS (NEW) =====
enum AdminRole {
  SUPER_ADMIN
  MODERATOR
  VIEWER
}

enum UserStatus {  // ✅ NEW
  ACTIVE
  SUSPENDED
  DELETED
}

enum EventStatus {  // ✅ NEW
  PENDING
  APPROVED
  REJECTED
  CANCELLED
  COMPLETED
}

// ===== EXISTING ENUMS (Keep as is) =====
enum UserRole {
  USER
  ORGANIZER
  ADMIN
}

enum EventFormat {
  IN_PERSON
  ONLINE
  HYBRID
}

enum TicketTypeEnum {
  REGULAR
  VIP
  EARLY_BIRD
  GROUP
  STUDENT
  MEMBER
}

enum OrderStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
  CANCELLED
}

enum TicketStatus {
  VALID
  USED
  CANCELLED
  TRANSFERRED
  REFUNDED
}

enum PaymentType {
  TICKET
  PROMOTION
  REFUND
}

enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
  REFUNDED
}

enum DiscountType {
  PERCENTAGE
  FIXED
}

// ===== NEW ADMIN MODELS =====

model Admin {
  id            String      @id @default(uuid())
  email         String      @unique
  passwordHash  String
  name          String
  role          AdminRole
  avatar        String?
  isActive      Boolean     @default(true)
  lastLoginAt   DateTime?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  auditLogs     AuditLog[]

  @@map("admins")
  @@index([email])
  @@index([role])
  @@index([isActive])
}

model AuditLog {
  id          String   @id @default(uuid())
  adminId     String
  admin       Admin    @relation(fields: [adminId], references: [id])
  action      String
  targetType  String
  targetId    String?
  details     Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())

  @@map("audit_logs")
  @@index([adminId])
  @@index([action])
  @@index([targetType])
  @@index([createdAt])
}

model Category {
  id          String   @id @default(uuid())
  name        String   @unique
  slug        String   @unique
  icon        String?
  color       String?
  description String?
  isActive    Boolean  @default(true)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  events      Event[]

  @@map("categories")
  @@index([isActive])
  @@index([sortOrder])
}

model Setting {
  id          String   @id @default(uuid())
  key         String   @unique
  value       Json
  description String?
  updatedBy   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("settings")
  @@index([key])
}

model Message {
  id          String   @id @default(uuid())
  recipientId String
  recipient   User     @relation("ReceivedMessages", fields: [recipientId], references: [id])
  subject     String
  body        String
  sentBy      String?
  isRead      Boolean  @default(false)
  readAt      DateTime?
  createdAt   DateTime @default(now())

  @@map("messages")
  @@index([recipientId])
  @@index([isRead])
  @@index([createdAt])
}

// ===== UPDATED USER MODEL =====

model User {
  id                       String        @id @default(uuid())
  email                    String        @unique
  passwordHash             String
  firstName                String?
  lastName                 String?
  phone                    String?
  avatarUrl                String?
  emailVerified            Boolean       @default(false)
  role                     UserRole      @default(USER)
  status                   UserStatus    @default(ACTIVE)  // ✅ NEW
  suspendedBy              String?                          // ✅ NEW
  suspendedAt              DateTime?                        // ✅ NEW
  suspensionReason         String?                          // ✅ NEW
  hasCompletedOnboarding   Boolean       @default(false)

  // Profile
  bio                      String?
  website                  String?
  twitter                  String?
  instagram                String?
  facebook                 String?
  linkedin                 String?

  // Preferences
  emailUpdates             Boolean       @default(true)
  eventReminders           Boolean       @default(true)
  promotions               Boolean       @default(true)
  newsletter               Boolean       @default(false)
  smsNotifications         Boolean       @default(false)

  // Privacy
  profileVisibility        String        @default("public")
  showEmail                Boolean       @default(false)
  showPhone                Boolean       @default(false)
  dataSharing              Boolean       @default(false)

  // Tokens
  refreshToken             String?

  // Onboarding
  onboardingData          Json?

  // Timestamps
  createdAt                DateTime      @default(now())
  updatedAt                DateTime      @updatedAt
  lastLoginAt              DateTime?

  // Relations
  eventsCreated            Event[]
  ticketsPurchased         Ticket[]
  orders                   Order[]
  followers                OrganizerFollower[] @relation("followers")
  following                OrganizerFollower[] @relation("following")
  eventLikes               EventLike[]
  notifications            Notification[]
  supportTickets           SupportTicket[]
  payments                 Payment[]
  attendees                Attendee[]
  supportTicketReplies     SupportTicketReply[]
  systemLogs               SystemLog[]
  payoutAccount           PayoutAccount?
  payouts                 Payout[]
  messagesReceived        Message[] @relation("ReceivedMessages")  // ✅ NEW

  @@map("users")
  @@index([email])
  @@index([status])  // ✅ NEW
  @@index([createdAt])
}

// ===== UPDATED EVENT MODEL =====

model Event {
  id               String      @id @default(uuid())
  organizerId      String
  organizer        User        @relation(fields: [organizerId], references: [id])

  // Basic Info
  title            String
  slug             String      @unique
  description      String?
  shortDescription String?

  // Format & Location
  eventFormat      EventFormat @default(IN_PERSON)
  venueName        String?
  address          String?
  city             String?
  state            String?
  country          String      @default("Nigeria")
  currency         String      @default("NGN")
  onlineUrl        String?
  platform         String?
  latitude         Float?
  longitude        Float?

  // Date & Time
  startDate        DateTime
  endDate          DateTime
  timezone         String      @default("Africa/Lagos")

  // Media
  imageUrl         String?
  gallery          String[]

  // Pricing
  isFree           Boolean     @default(false)
  isRecurring      Boolean     @default(false)
  recurrenceConfig Json?

  // Capacity
  capacity         Int?
  isPrivate        Boolean     @default(false)

  // Status & Moderation (UPDATED)
  isPublished      Boolean         @default(false)
  status           EventStatus     @default(PENDING)      // ✅ NEW
  rejectionReason  String?                                // ✅ NEW
  approvedBy       String?                                // ✅ NEW
  approvedAt       DateTime?                              // ✅ NEW
  rejectedBy       String?                                // ✅ NEW
  rejectedAt       DateTime?                              // ✅ NEW
  isFeatured       Boolean         @default(false)
  featuredBy       String?                                // ✅ NEW
  featuredAt       DateTime?                              // ✅ NEW
  isCancelled      Boolean         @default(false)

  // Category (UPDATED)
  categoryId       String?                                // ✅ CHANGED from String
  category         Category?   @relation(fields: [categoryId], references: [id])  // ✅ NEW
  tags             String[]

  // Promotion
  promoted         Boolean     @default(false)
  promotionPackage String?
  promotionExpiry  DateTime?

  // Analytics
  views            Int         @default(0)
  likesCount       Int         @default(0)
  sharesCount      Int         @default(0)

  // Timestamps
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt
  publishedAt      DateTime?

  // Relations
  ticketTypes      TicketType[]
  orders           Order[]
  tickets          Ticket[]
  eventLikes       EventLike[]
  promoCodes       PromoCode[]
  attendees        Attendee[]
  payments         Payment[]

  @@map("events")
  @@index([organizerId])
  @@index([categoryId])      // ✅ NEW
  @@index([status])          // ✅ NEW
  @@index([startDate])
  @@index([isPublished, startDate])
  @@index([promoted, promotionExpiry])
  @@index([isFeatured])      // ✅ NEW
}

// ===== KEEP ALL OTHER MODELS AS IS =====
// (TicketType, Order, Ticket, Payment, PromoCode, OrganizerFollower, etc.)
```

---

## Recommended Actions

### Immediate (Before any API development):

1. ✅ Add `url = env("DATABASE_URL")` to datasource
2. ✅ Create Admin model with AdminRole enum
3. ✅ Add UserStatus enum and User.status field
4. ✅ Add EventStatus enum and Event.status field
5. ✅ Create AuditLog model
6. ✅ Create Category model (with migration for existing events)
7. ✅ Create Setting model with seed data
8. ✅ Create Message model

### Week 1:
- Run Prisma migration to add all admin-related models
- Seed database with:
  - First super admin account
  - Default categories (8 categories)
  - Default settings (currencies, validation rules)
- Test admin authentication

### Week 2:
- Implement all admin API endpoints
- Test event approval workflow
- Test user suspension
- Test audit logging

### Week 3:
- Frontend integration
- End-to-end testing
- Production deployment

---

## Summary

**Current Schema Status:** ❌ **Not Ready for Admin Panel**

**Missing Critical Components:**
1. Admin authentication system (0%)
2. Event approval workflow (0%)
3. User suspension capability (0%)
4. Audit logging (0%)
5. Dynamic category management (0%)
6. Settings configuration (0%)
7. Admin messaging (0%)

**Estimated Migration Effort:**
- Database changes: ~2 days
- API implementation: ~1-2 weeks
- Testing: ~3-5 days

**Risk Level:** 🔴 HIGH - Admin panel completely non-functional without these changes

---

## Questions for Backend Developer

1. **Admin Authentication:** Should we use the same password hashing as User model (appears to use bcrypt)?
2. **Category Migration:** Do you want to keep the old `Event.category` string field during migration or drop it immediately?
3. **Audit Logging:** Should we also log to SystemLog for redundancy, or only to AuditLog?
4. **Event Approval:** Should `isPublished` be automatically set to `true` when status becomes `APPROVED`?
5. **User Suspension:** Should suspended users be blocked from logging in to the main app?
6. **Database URL:** What's the format - local PostgreSQL, cloud provider (e.g., Supabase, Railway)?

---

**Reviewed By:** Admin Panel Frontend Team
**Date:** January 2025
**Status:** ⚠️ REQUIRES IMMEDIATE ATTENTION
