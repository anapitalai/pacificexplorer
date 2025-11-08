# Admin Dashboard - Full CRUD Operations

## Overview
Enhanced admin dashboard with complete Create, Read, Update, Delete (CRUD) operations for users and destinations.

## Features Added

### User Management

#### 1. View All Users
- Display all registered users in a table
- Show username, email, role, status, and join date
- Real-time data with server-side rendering

#### 2. Edit User Role
- **Click on role badge** to edit
- Dropdown with options: TOURIST, HOTEL_OWNER, ADMIN
- Instant update with API call
- Visual feedback on success/error
- **Promote to Admin** button for quick promotion

#### 3. Toggle User Status
- Click on Active/Inactive badge to toggle
- Activate or deactivate user accounts
- Updates statistics automatically
- Visual color changes (green = active, gray = inactive)

#### 4. Delete Users
- Delete button for each user
- Confirmation dialog before deletion
- Prevents self-deletion (admin can't delete themselves)
- Updates user count and statistics
- Cascading delete (removes related sessions/accounts)

#### 5. Promote Users
- Quick "Promote" button for non-admin users
- One-click promotion to ADMIN role
- Only shows for TOURIST and HOTEL_OWNER roles
- Confirmation and success messages

### Destination Management

#### 1. View All Destinations
- Display all tourism destinations
- Show name, province, category, featured status, creation date
- Sortable table view

#### 2. Toggle Featured Status
- **Click on star icon** to toggle featured
- Filled star = featured, outline star = not featured
- Also available as "Feature/Unfeature" button
- Updates statistics automatically
- Visual feedback with hover effects

#### 3. Delete Destinations
- Delete button for each destination
- Confirmation dialog before deletion
- Updates destination count
- Permanent deletion

#### 4. View Destinations
- "View" link opens destination detail page
- Shows full information to visitors

### Statistics Dashboard
- **Total Users**: All registered users
- **Active Users**: Users with active status
- **Total Destinations**: All tourism locations
- **Featured Destinations**: Destinations marked as featured
- **System Status**: Health indicator
- Auto-updates when changes are made

## API Endpoints

### User Management APIs

#### GET `/api/admin/users`
Fetch all users (Admin only).

**Response:**
```json
[
  {
    "id": "clxyz123",
    "username": "john_doe",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "TOURIST",
    "isActive": true,
    "emailVerified": "2025-10-24T00:00:00.000Z",
    "createdAt": "2025-10-20T00:00:00.000Z",
    "updatedAt": "2025-10-24T00:00:00.000Z"
  }
]
```

#### PATCH `/api/admin/users/[id]`
Update user details (Admin only).

**Request Body:**
```json
{
  "role": "ADMIN",           // Optional: TOURIST, HOTEL_OWNER, ADMIN
  "isActive": true,          // Optional: true/false
  "name": "New Name"         // Optional: display name
}
```

**Response:**
```json
{
  "id": "clxyz123",
  "username": "john_doe",
  "email": "john@example.com",
  "name": "New Name",
  "role": "ADMIN",
  "isActive": true,
  "emailVerified": "2025-10-24T00:00:00.000Z",
  "createdAt": "2025-10-20T00:00:00.000Z",
  "updatedAt": "2025-10-24T00:00:00.000Z"
}
```

#### DELETE `/api/admin/users/[id]`
Delete a user (Admin only).

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

**Error (400):**
```json
{
  "error": "Cannot delete your own account"
}
```

### Destination Management APIs

#### GET `/api/admin/destinations`
Fetch all destinations (Public).

**Response:**
```json
[
  {
    "id": 1,
    "name": "Tufi Resort",
    "province": "Oro Province",
    "category": "Coastal",
    "description": "World-class diving...",
    "longDescription": "...",
    "latitude": -9.0755,
    "longitude": 149.3199,
    "image": "from-ocean-400 to-ocean-600",
    "featured": true,
    "satelliteImageUrl": null,
    "activities": ["Diving", "Snorkeling"],
    "bestTimeToVisit": "May to November",
    "accessibility": "Moderate",
    "highlights": ["Pristine reefs", "WWII wrecks"],
    "createdAt": "2025-10-20T00:00:00.000Z",
    "updatedAt": "2025-10-24T00:00:00.000Z"
  }
]
```

#### POST `/api/admin/destinations`
Create new destination (Admin only).

**Request Body:**
```json
{
  "name": "New Destination",
  "province": "Central Province",
  "category": "Coastal",
  "description": "Short description",
  "longDescription": "Detailed description",
  "latitude": "-9.5",
  "longitude": "147.2",
  "image": "gradient-class",
  "featured": false,
  "activities": ["Hiking", "Swimming"],
  "bestTimeToVisit": "Year-round",
  "accessibility": "Easy",
  "highlights": ["Beautiful views", "Great hiking"]
}
```

#### PATCH `/api/admin/destinations/[id]`
Update destination (Admin only).

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "featured": true,
  "category": "Inland"
}
```

#### DELETE `/api/admin/destinations/[id]`
Delete destination (Admin only).

**Response:**
```json
{
  "message": "Destination deleted successfully"
}
```

## UI Components

### AdminDashboard Component Updates

#### State Management
```typescript
const [users, setUsers] = useState(initialUsers);
const [destinations, setDestinations] = useState(initialDestinations);
const [stats, setStats] = useState(initialStats);
const [isLoading, setIsLoading] = useState(false);
const [editingUser, setEditingUser] = useState<string | null>(null);
```

#### Handler Functions

**handleDeleteUser(userId)**
- Shows confirmation dialog
- Calls DELETE API
- Updates local state
- Updates statistics
- Shows success/error alert

**handleUpdateUserRole(userId, newRole)**
- Calls PATCH API with new role
- Updates user in local state
- Shows success/error alert
- Closes edit mode

**handleToggleUserStatus(userId, currentStatus)**
- Calls PATCH API to toggle status
- Updates user in local state
- Updates active user count
- Shows success/error alert

**handleDeleteDestination(destinationId)**
- Shows confirmation dialog
- Calls DELETE API
- Updates local state
- Updates statistics
- Shows success/error alert

**handleToggleFeatured(destinationId, currentFeatured)**
- Calls PATCH API to toggle featured
- Updates destination in local state
- Updates featured count
- Shows success/error alert

### Users Table Features

#### Interactive Role Badge
```tsx
<span 
  className="role-badge cursor-pointer"
  onClick={() => setEditingUser(user.id)}
  title="Click to edit role"
>
  {user.role}
</span>
```

**Edit Mode:**
```tsx
<select
  value={user.role}
  onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
>
  <option value="TOURIST">TOURIST</option>
  <option value="HOTEL_OWNER">HOTEL_OWNER</option>
  <option value="ADMIN">ADMIN</option>
</select>
```

#### Interactive Status Badge
```tsx
<button
  onClick={() => handleToggleUserStatus(user.id, user.isActive)}
  className="status-badge"
  title="Click to toggle status"
>
  {user.isActive ? 'Active' : 'Inactive'}
</button>
```

#### Action Buttons
- **Promote**: Only shows for non-admin users
- **Delete**: Shows for all users (except self)

### Destinations Table Features

#### Interactive Featured Star
```tsx
<button
  onClick={() => handleToggleFeatured(destination.id, destination.featured)}
  className="hover:scale-110 transition-transform"
>
  {destination.featured ? 
    <FilledStar /> : 
    <OutlineStar />
  }
</button>
```

#### Action Buttons
- **View**: Links to destination detail page
- **Feature/Unfeature**: Toggles featured status
- **Delete**: Removes destination

## Security Features

### Authorization
- All admin endpoints require ADMIN role
- Server-side session validation
- Unauthorized requests return 401

### Self-Protection
- Admins cannot delete themselves
- Admins cannot change their own role from ADMIN
- Prevents accidental lockout

### Cascading Deletes
- Deleting user removes their sessions
- Deleting user removes their accounts
- Prisma handles referential integrity

### Confirmation Dialogs
- Delete actions require confirmation
- Prevents accidental deletions
- Clear warning messages

## User Experience

### Visual Feedback
- **Loading States**: Disabled buttons during API calls
- **Success Messages**: Alert on successful operations
- **Error Messages**: Alert on failed operations
- **Color Coding**: 
  - Red: Admin role, delete actions
  - Yellow: Hotel owner role, featured items
  - Blue: Tourist role, view actions
  - Green: Active status
  - Gray: Inactive status

### Interactive Elements
- Hover effects on all buttons
- Cursor changes for clickable items
- Smooth transitions
- Scale animations on stars

### Real-time Updates
- Local state updates immediately
- No page reload required
- Statistics auto-calculate
- Optimistic UI updates

## Testing

### Test User Management

1. **View Users:**
   - Login as admin (anapitalai/admin123)
   - Navigate to Dashboard > Users tab
   - Verify all users displayed

2. **Edit Role:**
   - Click on user role badge
   - Select ADMIN from dropdown
   - Verify role updates and badge changes

3. **Promote User:**
   - Click "Promote" button on non-admin user
   - Verify user becomes ADMIN
   - Verify "Promote" button disappears

4. **Toggle Status:**
   - Click on Active/Inactive badge
   - Verify status changes
   - Verify statistics update

5. **Delete User:**
   - Click "Delete" button
   - Confirm deletion
   - Verify user removed from list
   - Verify statistics update

6. **Self-Protection:**
   - Try to delete own account
   - Should show error message
   - Try to change own role from ADMIN
   - Should show error message

### Test Destination Management

1. **View Destinations:**
   - Navigate to Dashboard > Destinations tab
   - Verify all destinations displayed

2. **Toggle Featured (Icon):**
   - Click on star icon
   - Verify star fills/unfills
   - Verify statistics update

3. **Toggle Featured (Button):**
   - Click "Feature"/"Unfeature" button
   - Verify text changes
   - Verify star icon changes

4. **Delete Destination:**
   - Click "Delete" button
   - Confirm deletion
   - Verify destination removed
   - Verify statistics update

5. **View Destination:**
   - Click "View" link
   - Verify opens destination page

## Database Schema

No schema changes required. Uses existing fields:
- User: `id`, `username`, `email`, `name`, `role`, `isActive`, `emailVerified`, `createdAt`, `updatedAt`
- Destination: `id`, `name`, `province`, `category`, `featured`, `createdAt`, etc.

## Error Handling

### API Errors
- Network errors caught and displayed
- Server errors show generic message
- Validation errors show specific message

### Client Errors
- Missing data handled gracefully
- Loading states prevent double-clicks
- Optimistic updates can be rolled back

### Common Error Messages
- "Unauthorized" - Not logged in as admin
- "Cannot delete your own account" - Self-deletion attempt
- "Cannot change your own admin role" - Self-demotion attempt
- "Failed to update user" - Server error
- "Failed to delete destination" - Server error

## Future Enhancements

### User Management
- [ ] Bulk operations (delete multiple users)
- [ ] User search and filtering
- [ ] Sort by username, email, role, date
- [ ] Export users to CSV
- [ ] User activity logs
- [ ] Reset user password (admin action)
- [ ] Send notification emails
- [ ] User profile editing (name, email)

### Destination Management
- [ ] Create new destination form (inline or modal)
- [ ] Edit destination inline (expand row)
- [ ] Bulk featured/unfeatured
- [ ] Destination search and filtering
- [ ] Sort by various fields
- [ ] Export destinations to CSV
- [ ] Image upload and management
- [ ] Drag-and-drop reordering
- [ ] Category management
- [ ] Province management

### Dashboard Enhancements
- [ ] Charts and graphs (users over time, popular destinations)
- [ ] Activity feed (recent changes)
- [ ] Quick stats cards (today's registrations, new destinations)
- [ ] Audit log (who changed what, when)
- [ ] Performance metrics
- [ ] Export reports

### UX Improvements
- [ ] Inline editing for all fields
- [ ] Modal dialogs for confirmation
- [ ] Toast notifications instead of alerts
- [ ] Undo/redo functionality
- [ ] Keyboard shortcuts
- [ ] Drag-and-drop for bulk actions
- [ ] Advanced filtering and search

## Performance Considerations

### Optimization Strategies
- Server-side data fetching
- Client-side state management
- Optimistic UI updates
- Debounced search inputs
- Pagination for large datasets
- Lazy loading for images

### Current Limitations
- No pagination (all users/destinations loaded)
- No search functionality
- No filtering options
- Alerts block UI (should use toasts)

## Deployment Notes

### Environment Requirements
- Next.js 16.0.0+
- Prisma 6.18.0+
- PostgreSQL database
- Admin user in database

### Production Checklist
- [ ] Test all CRUD operations
- [ ] Verify authorization checks
- [ ] Test error scenarios
- [ ] Check mobile responsiveness
- [ ] Review security measures
- [ ] Monitor API performance
- [ ] Set up error logging
- [ ] Configure rate limiting

## File Structure

```
pacific-explorer/
├── app/
│   ├── api/
│   │   └── admin/
│   │       ├── users/
│   │       │   ├── route.ts              # NEW - List/Delete users
│   │       │   └── [id]/
│   │       │       └── route.ts          # NEW - Update/Delete user
│   │       └── destinations/
│   │           ├── route.ts              # NEW - List/Create destinations
│   │           └── [id]/
│   │               └── route.ts          # NEW - Get/Update/Delete destination
│   └── dashboard/
│       └── page.tsx                      # UPDATED - Fetches admin data
├── components/
│   └── AdminDashboard.tsx                # UPDATED - Full CRUD UI
└── ADMIN_DASHBOARD_CRUD.md               # NEW - This documentation
```

## Conclusion

The admin dashboard now provides complete control over users and destinations with:
- ✅ Full CRUD operations
- ✅ Role-based access control
- ✅ Real-time updates
- ✅ Interactive UI elements
- ✅ Security measures
- ✅ Error handling
- ✅ Visual feedback

Admins can efficiently manage all aspects of the Pacific Explorer platform from a single, intuitive interface.
