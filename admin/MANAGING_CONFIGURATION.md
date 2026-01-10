# Managing Categories, Currencies & Data Formats

This guide explains how to manage platform configuration through the admin panel.

## ✅ Solution: Backend-Managed Configuration

Instead of hardcoding categories and currencies in the frontend, they're managed through the backend and Settings page in admin panel.

---

## 1. Managing Categories

### How to Add a New Category:

1. **Via Admin Panel** (Recommended):
   - Login to admin panel at `admin-dash.appguts.com`
   - Go to **Settings** page
   - Click **"Add Category"** button
   - Fill in:
     - Name: e.g., "Sports & Fitness"
     - Icon: Choose from icon library
     - Color: Pick a hex color (#10b981)
   - Click **Save**

2. **Via Backend API** (For developers):
```bash
POST /api/admin/settings/categories
Content-Type: application/json
Authorization: Bearer {admin_token}

{
  "id": "sports-fitness",
  "name": "Sports & Fitness",
  "icon": "Dumbbell",
  "color": "#10b981"
}
```

### How to Edit/Delete Category:

**Admin Panel**:
- Go to Settings → Categories table
- Click **Edit** icon → Modify → Save
- Click **Delete** icon → Confirm deletion

**Note**: Deleting a category will affect all events using it. Backend should either:
- Move events to "Uncategorized" category
- Prevent deletion if events exist
- Show warning with event count

---

## 2. Managing Currencies

### How to Enable/Disable Currency:

**Admin Panel** (Settings page):
- Go to **Supported Currencies** section
- Toggle **Enable/Disable** button for each currency
- Active events count shows how many events use that currency

**Backend API**:
```bash
PUT /api/admin/settings/currencies/EUR
Content-Type: application/json
Authorization: Bearer {admin_token}

{
  "enabled": true
}
```

### How to Add New Currency:

**Backend** (Database):
```sql
INSERT INTO settings (key, value) VALUES
('currencies', jsonb_insert(
  (SELECT value FROM settings WHERE key = 'currencies'),
  '{999}',
  '{"code": "KES", "name": "Kenyan Shilling", "symbol": "KSh", "enabled": true}'
));
```

**Or via API**:
```bash
POST /api/admin/settings/currencies
Content-Type: application/json

{
  "code": "KES",
  "name": "Kenyan Shilling",
  "symbol": "KSh",
  "enabled": true
}
```

---

## 3. Managing Validation Rules

### How to Update Validation Rules:

**Admin Panel** (Settings page):
- Go to **Validation Rules** section
- Modify min/max values for:
  - Event Title length
  - Event Description length
  - Ticket Price range
  - Event Capacity
- Click **"Save Validation Rules"**

**Backend API**:
```bash
PUT /api/admin/settings/validation-rules
Content-Type: application/json
Authorization: Bearer {admin_token}

{
  "eventTitle": { "minLength": 5, "maxLength": 150 },
  "eventDescription": { "minLength": 20, "maxLength": 3000 },
  "ticketPrice": { "min": 0, "max": 50000000 },
  "eventCapacity": { "min": 1, "max": 200000 }
}
```

---

## 4. Backend Implementation

### Database Schema:

```sql
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by INTEGER REFERENCES admins(id)
);

-- Default categories
INSERT INTO settings (key, value) VALUES
('categories', '[
  {"id": "music", "name": "Music", "icon": "Music", "color": "#8b5cf6"},
  {"id": "business", "name": "Business", "icon": "Briefcase", "color": "#3b82f6"},
  {"id": "food", "name": "Food & Drink", "icon": "Utensils", "color": "#f97316"},
  {"id": "arts", "name": "Arts", "icon": "Palette", "color": "#ec4899"},
  {"id": "sports", "name": "Sports", "icon": "Trophy", "color": "#10b981"},
  {"id": "tech", "name": "Technology", "icon": "Cpu", "color": "#06b6d4"},
  {"id": "education", "name": "Education", "icon": "GraduationCap", "color": "#f59e0b"},
  {"id": "religious", "name": "Religious", "icon": "Calendar", "color": "#f43f5e"}
]');

-- Default currencies
INSERT INTO settings (key, value) VALUES
('currencies', '[
  {"code": "NGN", "name": "Nigerian Naira", "symbol": "₦", "enabled": true},
  {"code": "USD", "name": "US Dollar", "symbol": "$", "enabled": true},
  {"code": "GHS", "name": "Ghanaian Cedi", "symbol": "GH₵", "enabled": true},
  {"code": "EUR", "name": "Euro", "symbol": "€", "enabled": false},
  {"code": "GBP", "name": "British Pound", "symbol": "£", "enabled": false}
]');

-- Default validation rules
INSERT INTO settings (key, value) VALUES
('validation_rules', '{
  "eventTitle": {"minLength": 5, "maxLength": 100},
  "eventDescription": {"minLength": 20, "maxLength": 2000},
  "ticketPrice": {"min": 0, "max": 10000000},
  "eventCapacity": {"min": 1, "max": 100000}
}');
```

### API Endpoints Required:

#### Categories:
- `GET /api/settings/categories` - Public (for main app dropdown)
- `GET /api/admin/settings/categories` - Admin only
- `POST /api/admin/settings/categories` - Create category
- `PUT /api/admin/settings/categories/:id` - Update category
- `DELETE /api/admin/settings/categories/:id` - Delete category

#### Currencies:
- `GET /api/settings/currencies` - Public (for main app)
- `GET /api/admin/settings/currencies` - Admin only
- `PUT /api/admin/settings/currencies/:code` - Enable/disable currency

#### Validation Rules:
- `GET /api/settings/validation-rules` - Public (for form validation)
- `PUT /api/admin/settings/validation-rules` - Admin only

---

## 5. Frontend Integration

### Main App - Fetch Categories Dynamically:

**Create**: `lib/config.ts`
```typescript
// Fetch categories from backend
export async function getCategories() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings/categories`)
  if (!res.ok) return DEFAULT_CATEGORIES // Fallback
  return res.json()
}

// Fetch currencies
export async function getCurrencies() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings/currencies`)
  if (!res.ok) return DEFAULT_CURRENCIES
  return res.json()
}

// Fetch validation rules
export async function getValidationRules() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings/validation-rules`)
  if (!res.ok) return DEFAULT_RULES
  return res.json()
}
```

**Update**: `app/page.tsx`
```typescript
import { getCategories } from "@/lib/config"

export default function Home() {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  return (
    <div>
      {/* Use dynamic categories */}
      {categories.map(cat => (
        <CategoryCard key={cat.id} category={cat} />
      ))}
    </div>
  )
}
```

**Update**: `app/create-event/page.tsx`
```typescript
import { getCurrencies, getValidationRules } from "@/lib/config"

export default function CreateEvent() {
  const [currencies, setCurrencies] = useState([])
  const [rules, setRules] = useState(null)

  useEffect(() => {
    getCurrencies().then(setCurrencies)
    getValidationRules().then(setRules)
  }, [])

  // Use validation rules for form validation
  const validateTitle = (title) => {
    if (title.length < rules.eventTitle.minLength) {
      return `Title must be at least ${rules.eventTitle.minLength} characters`
    }
    // ... more validation
  }
}
```

---

## 6. Migration Plan

### Phase 1: Backend Setup (Week 1)
1. Create `settings` table in database
2. Insert default categories, currencies, validation rules
3. Build CRUD APIs for settings

### Phase 2: Admin Panel (Week 1)
1. ✅ Settings page already built (`admin/app/(dashboard)/settings/page.tsx`)
2. Connect to backend APIs
3. Test category/currency management

### Phase 3: Main App Integration (Week 2)
1. Create `lib/config.ts` with fetch functions
2. Update homepage to use dynamic categories
3. Update create-event page to use dynamic currencies
4. Update form validation to use dynamic rules
5. Add fallback to hardcoded values if API fails

### Phase 4: Testing (Week 2)
1. Test adding new category in admin → appears in main app
2. Test disabling currency → removed from create-event dropdown
3. Test updating validation rules → forms enforce new limits

---

## 7. Best Practices

### ✅ Do's:
- Always validate admin permissions before allowing changes
- Log all settings changes to audit trail
- Show warning when deleting categories with existing events
- Cache settings on frontend (30 min TTL)
- Provide fallback to defaults if API fails
- Show event count before deleting category/currency

### ❌ Don'ts:
- Don't allow deleting last category
- Don't allow disabling currency if events exist using it
- Don't set unrealistic validation limits (e.g., max title: 5 chars)
- Don't forget to invalidate cache after settings change

---

## 8. Example Workflow: Adding "Wellness" Category

1. **Admin logs into admin panel**
2. **Goes to Settings page**
3. **Clicks "Add Category"**
4. **Fills form**:
   - Name: "Wellness"
   - Icon: "Heart"
   - Color: #ec4899
5. **Clicks Save**
6. **Backend**:
   - Validates admin permission
   - Inserts into settings table
   - Logs to audit trail
   - Returns success
7. **Main App**:
   - Next user visits homepage
   - Fetches categories from API
   - "Wellness" appears in filter dropdown
8. **Event Creator**:
   - Goes to create event
   - Sees "Wellness" in category dropdown
   - Creates wellness event
9. **Admin Dashboard**:
   - Shows "Wellness: 1 event" in settings

---

## 9. API Response Examples

### GET /api/settings/categories
```json
{
  "categories": [
    {
      "id": "music",
      "name": "Music",
      "icon": "Music",
      "color": "#8b5cf6",
      "eventsCount": 45
    },
    {
      "id": "wellness",
      "name": "Wellness",
      "icon": "Heart",
      "color": "#ec4899",
      "eventsCount": 1
    }
  ]
}
```

### PUT /api/admin/settings/currencies/EUR
```json
{
  "success": true,
  "message": "EUR enabled successfully",
  "currency": {
    "code": "EUR",
    "name": "Euro",
    "symbol": "€",
    "enabled": true
  }
}
```

---

## 10. Troubleshooting

### Issue: New category not showing on main app
**Solution**:
- Check browser cache (clear cache)
- Check if category was saved in backend (GET /api/admin/settings/categories)
- Check main app is calling correct API endpoint
- Check API returns correct response format

### Issue: Can't delete category
**Solution**:
- Check if events exist using that category
- Backend should return error: "Cannot delete category with 45 existing events"
- Admin must re-categorize events first

---

**Summary**: With this system, you have full control over categories, currencies, and validation rules through the admin panel without touching code! 🎉
