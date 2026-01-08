# API Updates - Create Event Endpoint (New Fields)

## Overview
This document outlines the **new fields** added to the existing **Create Event** feature that need to be integrated into the backend API.

---

## Updated Endpoints

### Primary Endpoints Affected
- `POST /api/events` - Create new event
- `POST /api/events/create-with-promotion` - Create event with promotion
- `PUT /api/events/:id` - Update event
- `GET /api/events/:id` - Get event details (will return new fields)

### New Fields Added

#### 1. **Age Restriction**
```json
{
  "ageRestriction": "all-ages" | "18+" | "21+" | "family-friendly"
}
```
- **Type**: String (enum)
- **Required**: No
- **Default**: `"all-ages"`
- **Description**: Specifies age requirements for event attendees
- **Options**:
  - `all-ages`: No age restrictions
  - `family-friendly`: Suitable for families with children
  - `18+`: Adults only (18 and above)
  - `21+`: For events with alcohol or adult content

---

#### 2. **Event Tags**
```json
{
  "tags": ["networking", "outdoor", "live-music"]
}
```
- **Type**: Array of strings
- **Required**: No
- **Max Length**: 5 tags
- **Description**: Keywords to improve event discoverability
- **Validation**:
  - Maximum 5 tags per event
  - Each tag should be lowercase
  - Tags are used for search and filtering

---

#### 3. **Event Capacity**
```json
{
  "capacity": 500
}
```
- **Type**: Number (integer)
- **Required**: No
- **Min**: 1
- **Description**: Maximum number of attendees allowed for the event
- **Use Cases**:
  - Venue space constraints
  - Free event registration limits
  - Prevents overselling

---

#### 4. **Refund Policy** *(Only for paid events)*
```json
{
  "refundPolicy": "non-refundable" | "refundable" | "partial"
}
```
- **Type**: String (enum)
- **Required**: No (only applicable when `isFree: false`)
- **Default**: `"non-refundable"`
- **Description**: Cancellation and refund policy for ticket purchases
- **Options**:
  - `non-refundable`: No refunds allowed
  - `refundable`: Full refund until 7 days before event
  - `partial`: 50% refund until 3 days before event

---

#### 5. **Contact Information**
```json
{
  "contactEmail": "event@example.com",
  "contactPhone": "+234 800 000 0000"
}
```
- **contactEmail**:
  - **Type**: String (email format)
  - **Required**: No
  - **Validation**: Valid email format
  - **Description**: Primary contact email for attendee inquiries

- **contactPhone**:
  - **Type**: String
  - **Required**: No
  - **Description**: Contact phone number (optional)
  - **Format**: International format recommended

---

## Updated `POST /api/events` Payload

This extends your existing payload structure. **Only the new fields are highlighted below.**

```json
{
  // ===== EXISTING FIELDS (unchanged) =====
  "title": "Summer Music Festival 2026",
  "description": "An amazing music festival featuring top artists...",
  "eventFormat": "venue",
  "venueName": "Lagos Arena",
  "address": "123 Main Street",
  "city": "Lagos",
  "country": "Nigeria",
  "currency": "NGN",
  "onlineUrl": null,
  "platform": null,
  "startDate": "2026-07-15",
  "startTime": "18:00",
  "endDate": "2026-07-15",
  "endTime": "23:00",
  "image": "base64_or_url",
  "isFree": false,
  "tickets": [
    {
      "name": "General Admission",
      "type": "regular",
      "price": 5000,
      "currency": "NGN",
      "quantity": 500,
      "description": "Access to main stage"
    }
  ],
  "isRecurring": false,
  "recurrence": null,
  "isPrivate": false,
  "category": "music",
  "promoteEvent": true,
  "selectedPromotion": "premium",

  // ===== 🆕 NEW FIELDS ADDED =====
  "ageRestriction": "18+",                    // NEW
  "tags": ["music", "outdoor", "festival", "live-band", "summer"],  // NEW
  "capacity": 1000,                           // NEW (frontend sends as string, convert to number)
  "refundPolicy": "refundable",               // NEW (only for paid events)
  "contactEmail": "info@summerfest.com",      // NEW
  "contactPhone": "+234 800 123 4567"         // NEW
}
```

### Notes:
- `capacity` is sent as a **string** from frontend (e.g., `"1000"`), convert to **integer** on backend
- All new fields are **optional** and backward compatible
- `refundPolicy` only applies when `isFree: false`

---

## Database Schema Updates

### Events Table - New Columns

#### SQL (PostgreSQL/MySQL):
```sql
-- Add new columns to events table
ALTER TABLE events ADD COLUMN age_restriction VARCHAR(20) DEFAULT 'all-ages';
ALTER TABLE events ADD COLUMN tags JSON;  -- or TEXT for MySQL < 5.7
ALTER TABLE events ADD COLUMN capacity INTEGER;
ALTER TABLE events ADD COLUMN refund_policy VARCHAR(20) DEFAULT 'non-refundable';
ALTER TABLE events ADD COLUMN contact_email VARCHAR(255);
ALTER TABLE events ADD COLUMN contact_phone VARCHAR(50);

-- Add indexes for better query performance
CREATE INDEX idx_events_age_restriction ON events(age_restriction);
CREATE INDEX idx_events_capacity ON events(capacity);

-- For PostgreSQL with JSONB (recommended):
-- ALTER TABLE events ADD COLUMN tags JSONB;
-- CREATE INDEX idx_events_tags ON events USING GIN(tags);
```

#### MongoDB (if using):
```javascript
// No schema changes needed, just add fields to documents
// Optionally add indexes:
db.events.createIndex({ "tags": 1 })
db.events.createIndex({ "ageRestriction": 1 })
db.events.createIndex({ "capacity": 1 })
```

#### Mongoose Schema (if using):
```javascript
const eventSchema = new Schema({
  // ... existing fields
  ageRestriction: {
    type: String,
    enum: ['all-ages', 'family-friendly', '18+', '21+'],
    default: 'all-ages'
  },
  tags: {
    type: [String],
    validate: [arrayLimit, 'Tags cannot exceed 5']
  },
  capacity: {
    type: Number,
    min: 1
  },
  refundPolicy: {
    type: String,
    enum: ['non-refundable', 'refundable', 'partial'],
    default: 'non-refundable'
  },
  contactEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  contactPhone: String
})

function arrayLimit(val) {
  return val.length <= 5
}
```

---

## Frontend Features Implemented

### 1. **Draft Auto-Save**
- Form data automatically saves to `localStorage` every second
- Drafts persist across browser sessions
- Users can resume incomplete event creation
- Draft is cleared upon successful event publication

### 2. **Manual Save Draft Button**
- Located in the header next to "Back" button
- Provides immediate feedback when clicked
- Allows users to save progress manually

### 3. **Enhanced UX**
- **Step 1**: Age restrictions and tags (with add/remove functionality)
- **Step 5**: Event capacity, refund policy, and contact information
- All new fields have helpful tooltips and validation

---

## Validation Rules (Backend)

1. **Age Restriction**:
   - Must be one of: `all-ages`, `family-friendly`, `18+`, `21+`

2. **Tags**:
   - Max 5 tags per event
   - Each tag: alphanumeric + hyphens, max 30 characters
   - Automatically converted to lowercase

3. **Capacity**:
   - Must be positive integer if provided
   - Optional field

4. **Refund Policy**:
   - Only validate if `isFree: false`
   - Must be one of: `non-refundable`, `refundable`, `partial`

5. **Contact Email**:
   - Must be valid email format if provided
   - Optional but recommended

6. **Contact Phone**:
   - Optional
   - No strict format validation (international numbers vary)

---

## Updated `GET /api/events/:id` Response

The response should now include the new fields:

```json
{
  "success": true,
  "data": {
    "id": "evt_123",
    "title": "Tech Summit 2025",
    "description": "...",
    "currency": "NGN",
    "country": "Nigeria",
    "isFree": false,
    "isRecurring": false,
    "eventFormat": "hybrid",
    "location": {...},
    "onlineUrl": "https://zoom.us/...",
    "startDate": "2025-07-15",
    "startTime": "18:00",
    "endDate": "2025-07-15",
    "endTime": "22:00",
    "tickets": [...],
    "organizer": {...},
    "attendees": 1200,
    "promoted": true,
    "promotionPackage": "premium",
    "category": "tech",

    // ===== 🆕 NEW FIELDS IN RESPONSE =====
    "ageRestriction": "18+",
    "tags": ["tech", "conference", "networking"],
    "capacity": 1500,
    "refundPolicy": "refundable",
    "contactEmail": "info@techsummit.com",
    "contactPhone": "+234 800 555 0123"
  }
}
```

---

## Optional: Enhanced Search & Filtering

Consider adding these query parameters to `GET /api/events` for better discoverability:

```
GET /api/events?tags=tech,networking&ageRestriction=all-ages&hasCapacity=true
```

**New Query Params:**
- `tags` - Filter by tags (comma-separated)
- `ageRestriction` - Filter by age restriction
- `hasCapacity` - Show only events with capacity limits
- `refundPolicy` - Filter by refund policy (for paid events)

Example:
```
GET /api/events?category=music&tags=outdoor,festival&ageRestriction=18+&currency=NGN
```

---

## Questions for Backend Team

1. **Tags Storage**: Should we create a separate `tags` table with many-to-many relationship for better indexing, or store as JSON array?
2. **Tags Search**: Should tags be indexed for full-text search? Do we need tag auto-complete?
3. **Capacity Tracking**: Do we need real-time attendee count vs capacity to prevent overselling?
4. **Refund Processing**: Will refunds be automated based on policy, or manual approval?
5. **Contact Info**: Should contact email/phone be validated against organizer's account info?
6. **Age Verification**: Do we need age verification at ticket purchase for 18+/21+ events?

---

## Notes

- All new fields are **optional** to maintain backward compatibility
- Frontend validation is in place, but backend should also validate
- Consider adding these fields to event update/edit endpoints as well
- Draft save is frontend-only (localStorage) - no backend changes needed

---

## Implementation Checklist for Backend

- [ ] **Database Migration**: Add 6 new columns to events table
- [ ] **Update Event Model/Schema**: Add new fields with validation
- [ ] **Update `POST /api/events`**: Accept and validate new fields
- [ ] **Update `POST /api/events/create-with-promotion`**: Accept new fields
- [ ] **Update `PUT /api/events/:id`**: Allow updating new fields
- [ ] **Update `GET /api/events/:id`**: Return new fields in response
- [ ] **Update `GET /api/events` (list)**: Return new fields for each event
- [ ] **Add Search/Filter**: Add query params for tags, ageRestriction, etc. *(optional)*
- [ ] **Add Indexes**: Create indexes on tags, ageRestriction, capacity for performance
- [ ] **Update API Documentation**: Document new fields in Swagger/Postman
- [ ] **Testing**: Write unit/integration tests for new fields
- [ ] **Validation**:
  - [ ] Tags: max 5, lowercase, alphanumeric
  - [ ] Age restriction: enum validation
  - [ ] Capacity: positive integer
  - [ ] Refund policy: enum validation, only for paid events
  - [ ] Contact email: email format validation

---

## Summary

**Fields Added**: 6 new fields
**Breaking Changes**: None (all fields optional)
**Database Changes**: 6 new columns + 2 indexes
**Frontend Status**: ✅ Complete and tested
**Backend Status**: ⏳ Awaiting integration

---

**Document Version**: 1.0
**Date**: January 7, 2026
**Frontend**: Complete ✅
**Backend**: Pending ⏳
**Priority**: Medium (Non-breaking enhancement)
