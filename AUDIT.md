# Events-Kona Project Audit (Feb 13, 2026)

## Phase 1: Fix Broken Items

### 1.1 Profile/Organizer image upload never sent to API
- **Files:** `app/profile/page.tsx`, `app/settings/page.tsx` (Account + Organizer tabs)
- **Issue:** File selected in input but POST body doesn't include image. Need to upload via `POST /api/upload` first, then save the returned URL.
- **Status:** DONE - Uploads to Cloudinary via `/api/upload`, saves URL via onboarding API. Spinner overlay during upload.

### 1.2 Organizer social links not saved
- **Files:** `app/settings/page.tsx` (Organizer tab), `app/api/auth/onboarding/route.ts`
- **Issue:** twitter/instagram/linkedin fields collected in UI but not in Zod schema or DB update. Need to store in preferences or add fields to User model.
- **Status:** DONE - Added `organizerSocials` to Zod schema + DB update. Social links now save/load via `organizerSocials` JSON field.

### 1.3 Homepage stats are hardcoded
- **File:** `app/page.tsx` (stats banner section)
- **Issue:** "5K+ Attendees", "1.2K+ Organizers" are static text. Need a `GET /api/stats` endpoint or compute from existing data.
- **Status:** DONE - Created `GET /api/stats` endpoint. Homepage fetches real counts (events, organizers, registrations).

### 1.4 Event card shows likesCount as "attendees"
- **Files:** `components/event-card.tsx`, `lib/types.ts` (apiEventToLegacy)
- **Issue:** The `attendees` prop is populated from `likesCount`. Should use `ticketsSold` or `_count.registrations`.
- **Status:** DONE - Changed to `_count.registrations ?? ticketsSold`. Added `_count.registrations` to events list API.

### 1.5 Delete Account — no confirmation or API call
- **File:** `app/settings/page.tsx` (Privacy tab, Danger Zone)
- **Issue:** Button exists but does nothing. Need confirmation modal + `DELETE /api/auth/account` endpoint.
- **Status:** DONE - Created `DELETE /api/auth/account` (password + "DELETE MY ACCOUNT" confirmation). Modal in Settings. Soft-deletes user, wipes PII.

### 1.6 2FA is UI-only
- **File:** `app/settings/page.tsx` (Privacy tab)
- **Issue:** Hardcoded secret key, no real backend. Low priority — can defer.
- **Status:** DEFERRED

---

## Phase 2: Wire Up Ticket Purchase Flow (Core Revenue)

### 2.1 Ticket selection & checkout UI on event detail page
- **File:** `app/event/[id]/page.tsx`
- **Backend:** `GET /api/events/{id}/tickets`, `POST /api/orders`
- **Issue:** Event detail page shows "Register" for free events but has no ticket purchase flow for paid events. Need ticket type selector, quantity picker, promo code input, and checkout button.
- **Status:** NOT STARTED

### 2.2 Paystack payment integration (frontend)
- **Backend:** `POST /api/orders` returns Paystack payment data for paid events
- **Issue:** Need to initialize Paystack popup after order creation, then call `POST /api/orders/{id}/verify-payment` on success.
- **Status:** NOT STARTED

### 2.3 Order history page
- **Backend:** `GET /api/orders`, `GET /api/orders/{id}`
- **Issue:** No orders page exists. Could add as tab in My Events or separate page.
- **Status:** NOT STARTED

### 2.4 Order cancellation
- **Backend:** `POST /api/orders/{id}/cancel`
- **Issue:** No cancel button on orders. Need refund policy display.
- **Status:** NOT STARTED

---

## Phase 3: Wire Up Remaining Event Actions

### 3.1 Cancel event button on My Events
- **File:** `app/my-events/page.tsx`
- **Backend:** `POST /api/events/{id}/cancel` (requires reason, min 10 chars)
- **Status:** NOT STARTED

### 3.2 Promo code management for organizers
- **Backend:** `GET/POST /api/events/{id}/promo-codes`, `PUT/DELETE /api/events/{id}/promo-codes/{codeId}`
- **Issue:** No UI for creating/managing promo codes. Could add to event edit or My Events detail.
- **Status:** NOT STARTED

### 3.3 Promo code validation at checkout
- **Backend:** `POST /api/events/{id}/validate-promo`
- **Issue:** Depends on Phase 2.1 (checkout UI) being built first.
- **Status:** NOT STARTED

### 3.4 Unregister from free event
- **File:** `app/event/[id]/page.tsx`
- **Backend:** `DELETE /api/events/{id}/register`
- **Issue:** Register button toggles but doesn't call DELETE to unregister.
- **Status:** NOT STARTED

### 3.5 Unfollow organizer
- **Files:** `app/event/[id]/page.tsx`, `app/organizer/[slug]/page.tsx`, `app/my-events/page.tsx`
- **Backend:** `DELETE /api/users/{id}/follow`
- **Issue:** Follow button calls POST but doesn't call DELETE to unfollow. The POST endpoint toggles, so this may already work — needs testing.
- **Status:** NEEDS TESTING

---

## Phase 4: Wire Up Ticket Management

### 4.1 Tickets tab in My Events
- **File:** `app/my-events/page.tsx`
- **Backend:** `GET /api/tickets`
- **Issue:** Tickets tab exists but uses placeholder/hardcoded data. Wire to real API.
- **Status:** NOT STARTED

### 4.2 Ticket detail page
- **Backend:** `GET /api/tickets/{id}`
- **Issue:** No ticket detail page exists. Need to show QR code, event info, check-in status.
- **Status:** NOT STARTED

### 4.3 Ticket check-in / QR scanning page (for organizers)
- **Backend:** `POST /api/tickets/{id}/check-in`, `POST /api/tickets/scan`
- **Issue:** No scanner UI. Organizers need a way to scan/validate tickets at events.
- **Status:** NOT STARTED

### 4.4 Ticket transfer
- **Backend:** `POST /api/tickets/{id}/transfer`, `DELETE /api/tickets/{id}/transfer`
- **Issue:** No transfer UI. Users should be able to transfer tickets to others.
- **Status:** NOT STARTED

### 4.5 Ticket PDF download
- **Issue:** Download button exists but no PDF generation. Need server-side or client-side PDF.
- **Status:** NOT STARTED

---

## Phase 5: Missing Features (Lower Priority)

### 5.1 Email verification flow
- **Backend:** `POST /api/auth/resend-verification` exists
- **Issue:** No UI to prompt user to verify email or resend link.

### 5.2 Review/rating system
- **Issue:** Schema supports it but no API routes or UI built.

### 5.3 Real-time notifications
- **Issue:** Notification preferences saved but no actual notification delivery system.

### 5.4 Event sharing (social media)
- **Issue:** Share button exists with no implementation.

### 5.5 Admin dashboard
- **Issue:** Admin routes exist but no admin panel UI.

---

## Quick Reference: API Endpoints by Status

### Fully Wired (Frontend ↔ Backend):
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/google
- GET /api/auth/me
- POST /api/auth/refresh
- POST /api/auth/logout
- POST /api/auth/forgot-password
- POST /api/auth/reset-password
- POST /api/auth/change-password
- GET/POST /api/auth/onboarding
- GET /api/events (list/search)
- POST /api/events (create)
- GET /api/events/{id} (detail)
- PUT /api/events/{id} (edit)
- DELETE /api/events/{id}
- POST /api/events/{id}/publish
- GET /api/events/my
- POST /api/events/{id}/register (create only)
- GET/POST /api/events/{id}/like
- GET/POST /api/users/{id}/follow
- GET /api/users/me/liked-events
- GET /api/users/me/following
- GET /api/users/me/followers
- GET /api/organizers/{slug}
- GET /api/categories
- POST /api/upload
- GET /api/bank/verify
- POST /api/ai/generate-description

### Backend Ready, Frontend NOT Wired:
- GET/POST /api/orders
- GET /api/orders/{id}
- POST /api/orders/{id}/verify-payment
- POST /api/orders/{id}/cancel
- GET /api/tickets
- GET /api/tickets/{id}
- POST /api/tickets/{id}/check-in
- DELETE /api/tickets/{id}/check-in
- POST /api/tickets/{id}/transfer
- DELETE /api/tickets/{id}/transfer
- POST /api/tickets/scan
- POST /api/events/{id}/cancel
- GET/POST /api/events/{id}/promo-codes
- GET/PUT/DELETE /api/events/{id}/promo-codes/{codeId}
- POST /api/events/{id}/validate-promo
- DELETE /api/events/{id}/register
- POST /api/webhooks/paystack
- POST /api/auth/resend-verification
- POST /api/categories (admin)
