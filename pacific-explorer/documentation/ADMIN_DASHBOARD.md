# Admin Dashboard Setup

## Overview
Created an admin dashboard for Pacific Explorer with full user and destination management capabilities.

## Admin Credentials
- **Username**: `anapitalai`
- **Password**: `admin123`
- **Email**: aln@napitalai.com.pg
- **Role**: ADMIN

## Features

### 1. Admin Dashboard Overview Tab
- **Total Users**: Count of all registered users
- **Active Users**: Count of users with activated accounts
- **Destinations**: Total tourism destinations in the system
- **System Status**: Health monitoring indicator

### 2. Users Management Tab
- View all registered users with:
  - Username and full name
  - Email address
  - Role (ADMIN, OPERATOR, TOURIST)
  - Status (Active/Inactive)
  - Join date
- Visual role badges (color-coded)
- Activation status indicators

### 3. Destinations Management Tab
- View all tourism destinations with:
  - Name and location
  - Province
  - Category (Coastal, Inland, Geothermal, Cultural)
  - Featured status
  - Creation date
- Quick actions: View and Edit links
- "Add New Destination" button (UI placeholder for future development)

## Access Control

### Admin Detection
The dashboard automatically detects user role from the session:
```typescript
const isAdmin = session.user.role === 'ADMIN';
```

### Visual Indicators
- Admin users see an "ADMIN" badge in the header
- Regular users see the standard tourist dashboard
- Role-based content rendering

## Database Seeding

The admin user is created automatically when running:
```bash
npx tsx prisma/seed.ts
```

The seed script:
1. Checks if admin user exists
2. If not, creates user with:
   - Username: anapitalai
   - Hashed password: admin123
   - Role: ADMIN
   - Active: true
   - Email verified: true
3. Also seeds 8 tourism destinations

## Testing Admin Access

### 1. Login as Admin
1. Navigate to: http://localhost:3005/auth/signin
2. Enter credentials:
   - Username: `anapitalai`
   - Password: `admin123`
3. Click "Sign In"
4. You'll be redirected to `/dashboard`

### 2. Verify Admin Dashboard
- Should see "ADMIN" badge in header
- Dashboard shows "Admin Dashboard" title with shield icon
- Three tabs available: Overview, Users, Destinations
- Overview shows system statistics
- Users tab displays all registered users
- Destinations tab shows all tourism locations

### 3. Switch Between Tabs
- Click "Overview" to see system statistics
- Click "Users (N)" to manage user accounts
- Click "Destinations (N)" to manage tourism locations

### User Dashboard

Non-admin users (role: TOURIST or HOTEL_OWNER) see the standard dashboard with:
- Welcome message with their name
- Navigation to key features:
  - **Discover**: Browse all destinations
  - **Explore**: Interactive map view
- User menu with:
  - Profile settings (coming soon)
  - Sign out

## Components Created

### `/components/AdminDashboard.tsx`
Client component with three main sections:
- **Overview**: Statistics cards with system metrics
- **Users**: Table view of all user accounts
- **Destinations**: Table view of all tourism destinations

Features:
- Tab-based navigation
- Color-coded status badges
- Responsive design
- Interactive table rows with hover effects

### `/app/dashboard/page.tsx` (Updated)
Server component that:
- Checks user authentication
- Detects admin role
- Fetches admin data if user is admin
- Renders AdminDashboard or regular dashboard accordingly

## Database Queries

Admin dashboard uses these Prisma queries:

```typescript
// Fetch all users
const users = await prisma.user.findMany({
  select: {
    id: true,
    username: true,
    email: true,
    name: true,
    role: true,
    isActive: true,
    emailVerified: true,
    createdAt: true,
  },
  orderBy: { createdAt: 'desc' },
});

// Fetch all destinations
const destinations = await prisma.destination.findMany({
  select: {
    id: true,
    name: true,
    province: true,
    category: true,
    featured: true,
    createdAt: true,
  },
  orderBy: { createdAt: 'desc' },
});
```

## Security Considerations

1. **Role-Based Access**: Only users with role='ADMIN' can see admin dashboard
2. **Server-Side Checks**: Role verification happens server-side (not just UI)
3. **Session Validation**: All dashboard access requires valid NextAuth session
4. **Password Security**: Admin password hashed with bcrypt (10 rounds)
5. **Email Verified**: Admin account pre-verified for immediate access

## Future Enhancements

### User Management
- [ ] Activate/deactivate user accounts
- [ ] Change user roles (promote to OPERATOR/ADMIN)
- [ ] Reset user passwords
- [ ] Delete user accounts
- [ ] View user activity logs

### Destination Management
- [ ] Create new destinations with form
- [ ] Edit existing destinations
- [ ] Delete destinations
- [ ] Toggle featured status
- [ ] Upload destination images
- [ ] Manage destination activities

### Analytics
- [ ] User registration trends (chart)
- [ ] Popular destinations (views/saves)
- [ ] Activity heatmap
- [ ] Geographic distribution of destinations

### System Settings
- [ ] Email template customization
- [ ] Site-wide announcements
- [ ] Feature flags
- [ ] API rate limiting configuration

## File Structure

```
pacific-explorer/
├── app/
│   └── dashboard/
│       └── page.tsx              # Updated with admin detection
├── components/
│   └── AdminDashboard.tsx        # NEW - Admin dashboard component
├── prisma/
│   └── seed.ts                   # Updated with admin user creation
└── AUTH_SYSTEM_UPDATE.md         # Authentication documentation
```

## Testing Checklist

- [x] Admin user created in database
- [x] Admin can login with credentials
- [x] Admin sees admin dashboard after login
- [x] Admin badge visible in header
- [x] Overview tab shows correct statistics
- [x] Users tab displays all users
- [x] Destinations tab displays all destinations
- [x] Tab switching works correctly
- [x] Regular users see tourist dashboard
- [ ] Admin can logout successfully
- [ ] Admin can access from production server

## Production Deployment

When deploying to production (170.64.195.201):

1. Ensure database migrations are applied:
   ```bash
   npx prisma migrate deploy
   ```

2. Run seed script to create admin user:
   ```bash
   npx tsx prisma/seed.ts
   ```

3. Verify admin login works:
   - https://pacificexplorer.napitalai.com.pg/auth/signin
   - Username: anapitalai
   - Password: admin123

4. Consider changing admin password after first login (future feature)

## Notes

- Admin user is auto-created during seed, not via registration
- Admin account is pre-activated (no email verification needed)
- Seed script is idempotent (safe to run multiple times)
- Admin dashboard uses Prisma queries (not API endpoints)
- All date formatting uses local date format
- Tables are responsive and horizontally scrollable on mobile

## Default Seeded Data

The seed script creates:
- 1 Admin user (anapitalai)
- 8 Tourism destinations:
  1. Tufi Resort (Coastal)
  2. Kokoda Track (Inland)
  3. Tavurvur Volcano (Geothermal)
  4. Varirata National Park (Inland)
  5. Loloata Island Resort (Coastal)
  6. Mount Wilhelm (Inland)
  7. Sepik River (Cultural)
  8. Kimbe Bay (Coastal)

## Color Scheme

Admin dashboard uses project colors:
- **Admin Badge**: PNG Red (#E4002B)
- **ADMIN Role**: PNG Red background
- **OPERATOR Role**: PNG Yellow background  
- **TOURIST Role**: Ocean blue background
- **Active Status**: Paradise Green
- **Inactive Status**: Gray
- **Featured Icon**: PNG Yellow star
