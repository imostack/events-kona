# EventsKona Admin Dashboard

Administrative dashboard for managing the EventsKona platform.

## Overview

This is a separate Next.js application designed to run on the `admin-dash.eventskona.com` subdomain. It provides comprehensive administrative tools for managing users, events, analytics, and platform settings.

## Features

- **Role-Based Access Control (RBAC)**
  - Super Admin: Full system access
  - Admin: User and event management
  - Moderator: Content moderation
  - Support: Read-only access

- **User Management**
  - View, suspend, and ban users
  - Send notifications
  - Track user activity

- **Event Management**
  - Approve/reject pending events
  - Monitor published events
  - Delete inappropriate content

- **Audit Logging**
  - Track all administrative actions
  - Export logs for compliance
  - Filter by resource, action, and date

- **Dashboard Analytics**
  - Real-time platform metrics
  - User and event statistics
  - Recent activity monitoring

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Access the admin dashboard:
   ```
   http://localhost:3001
   ```

### Development Credentials

**Super Admin:**
- Email: admin@appguts.com
- Password: admin123

**Moderator:**
- Email: moderator@appguts.com
- Password: mod123

## Project Structure

```
admin/
├── app/
│   ├── (auth)/
│   │   └── login/          # Admin login page
│   ├── (dashboard)/
│   │   ├── page.tsx        # Dashboard home
│   │   ├── users/          # User management
│   │   ├── events/         # Event management
│   │   └── audit-logs/     # Audit log viewer
│   └── layout.tsx          # Root layout
├── components/
│   ├── admin-sidebar.tsx   # Navigation sidebar
│   └── admin-navbar.tsx    # Top navigation bar
├── lib/
│   ├── admin-auth-context.tsx  # Authentication context
│   └── audit-logger.ts         # Audit logging utility
└── types/
    └── admin.ts            # TypeScript types
```

## Deployment

### Subdomain Configuration

The admin dashboard is designed to be deployed on `admin-dash.eventskona.com`.

#### Vercel Deployment

1. Create a new Vercel project for the admin dashboard
2. Set the root directory to `admin/`
3. Configure custom domain: `admin-dash.eventskona.com`
4. Deploy

#### DNS Configuration

Add an A record or CNAME:
```
Type: CNAME
Name: admin-dash
Value: your-vercel-deployment.vercel.app
```

## Security Notes

⚠️ **Important**: This MVP uses mock authentication with localStorage. For production:

1. Implement proper JWT-based authentication
2. Add 2FA for all admin accounts
3. Use secure session management
4. Enable HTTPS only
5. Implement rate limiting
6. Add IP whitelisting for admin access
7. Use environment variables for sensitive data
8. Implement proper password hashing
9. Add CSRF protection
10. Enable audit log persistence to database

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4
- Lucide React (icons)

## Author

App Guts - EventsKona Team

## License

Proprietary - All rights reserved
