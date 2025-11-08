# 🔐 Default Admin Account Setup

## Admin Account Created

A default admin account has been successfully created for initial system access.

### Login Credentials

```
📧 Email:    anapitalai@gmail.com
👤 Username: anapitalai
🔑 Password: admin123
🔐 Role:     ADMIN
```

## How to Login

1. Navigate to: http://localhost:3005/auth/signin
2. Enter credentials:
   - **Username or Email**: `anapitalai` or `anapitalai@gmail.com`
   - **Password**: `admin123`
3. Click "Sign In"

## Access Levels

The admin account has full access to:

✅ **Admin Dashboard** - `/admin`
  - User Management
  - Destination Management
  - Hotels Management
  - System Overview

✅ **All Features**
  - Create/Edit/Delete Users
  - Create/Edit/Delete Destinations
  - Create/Edit/Delete Hotels
  - View Analytics
  - Manage System Settings

## Security Recommendations

⚠️ **IMPORTANT SECURITY STEPS:**

1. **Change the default password immediately after first login**
2. **Use a strong, unique password** (minimum 12 characters, mixed case, numbers, special characters)
3. **Enable two-factor authentication** (when available)
4. **Never share admin credentials**
5. **Use environment variables for production** (not hardcoded values)

## Changing the Admin Password

### Option 1: Via Admin Dashboard
1. Login as admin
2. Go to Profile Settings
3. Click "Change Password"
4. Enter new password
5. Save changes

### Option 2: Via Script
Create a password reset script:
```bash
npx tsx scripts/reset-admin-password.ts
```

### Option 3: Direct Database Update
```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPassword() {
  const newPassword = 'your-new-secure-password';
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  await prisma.user.update({
    where: { username: 'anapitalai' },
    data: { password: hashedPassword },
  });
  
  console.log('✅ Password updated!');
}
```

## Creating Additional Admin Accounts

### Method 1: Via Admin Dashboard
1. Login as admin
2. Go to Admin Dashboard → Users tab
3. Click "Add User"
4. Fill in details:
   - Name, Email, Username
   - Set Role to "ADMIN"
   - Set password
5. Save

### Method 2: Via Script
```bash
# Edit the script to use different credentials
nano scripts/create-default-admin.ts

# Run the script
npx tsx scripts/create-default-admin.ts
```

### Method 3: Promote Existing User
```typescript
await prisma.user.update({
  where: { email: 'user@example.com' },
  data: { role: 'ADMIN' },
});
```

## User Roles Hierarchy

1. **ADMIN** (Highest)
   - Full system access
   - User management
   - All CRUD operations
   - System configuration

2. **HOTEL_OWNER**
   - Manage own hotels
   - View own analytics
   - Limited user data access

3. **TOURIST** (Default)
   - Browse destinations
   - View hotels
   - Book accommodations
   - Personal profile only

## Re-running the Setup Script

The script is **idempotent** - you can run it multiple times safely:

```bash
npx tsx scripts/create-default-admin.ts
```

**What it does:**
- ✅ Checks if admin account exists
- ✅ If exists: Reports current details
- ✅ If not exists: Creates new account
- ✅ If username exists as non-admin: Upgrades to admin role

## Production Deployment

### Environment Variables

For production, use environment variables instead of hardcoded credentials:

```env
# .env.production
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=super-secure-password-here
```

### Setup Script
```typescript
const adminEmail = process.env.ADMIN_EMAIL || 'anapitalai@admin.com';
const adminUsername = process.env.ADMIN_USERNAME || 'anapitalai';
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
```

### Docker Deployment
```dockerfile
# In Dockerfile
ENV ADMIN_EMAIL=admin@yourdomain.com
ENV ADMIN_USERNAME=admin
ENV ADMIN_PASSWORD=${ADMIN_PASSWORD}
```

```bash
# Build with secret
docker build --build-arg ADMIN_PASSWORD=$(cat admin_password.txt) .
```

## Troubleshooting

### Cannot Login

**Issue**: "Invalid credentials" error

**Solutions:**
1. Verify username/email: `anapitalai` or `anapitalai@gmail.com`
2. Verify password: `admin123`
3. Check database:
   ```bash
   npx tsx scripts/verify-admin.ts
   ```

### Account Locked

**Issue**: Account shows as inactive

**Solution:**
```sql
UPDATE "User" 
SET "isActive" = true, 
    "emailVerified" = NOW() 
WHERE username = 'anapitalai';
```

### Password Not Working

**Issue**: Password reset needed

**Solution:**
```bash
# Reset to default
npx tsx scripts/create-default-admin.ts
```

### Multiple Admin Accounts

**Issue**: Confused about which admin to use

**Solution:**
```sql
-- List all admin accounts
SELECT id, name, email, username, role, "isActive"
FROM "User" 
WHERE role = 'ADMIN';
```

## Audit Log

Keep track of admin account usage:

```typescript
// Log admin actions
await prisma.auditLog.create({
  data: {
    userId: session.user.id,
    action: 'USER_CREATED',
    details: 'Created new hotel owner account',
    ipAddress: request.ip,
    timestamp: new Date(),
  },
});
```

## Best Practices

1. ✅ **Change default password immediately**
2. ✅ **Use unique passwords for each environment** (dev, staging, prod)
3. ✅ **Never commit credentials to Git**
4. ✅ **Use environment variables**
5. ✅ **Enable audit logging**
6. ✅ **Regularly review admin accounts**
7. ✅ **Remove unused admin accounts**
8. ✅ **Use SSH keys for server access**
9. ✅ **Enable database backups**
10. ✅ **Monitor for suspicious activity**

## Script Location

```
/scripts/create-default-admin.ts
```

## Related Files

- `/lib/auth.ts` - Authentication configuration
- `/prisma/schema.prisma` - User model definition
- `/app/api/auth/[...nextauth]/route.ts` - Auth API
- `/app/auth/signin/page.tsx` - Login page

## Support

For issues or questions:
1. Check console logs
2. Verify database connection
3. Review Prisma schema
4. Test with known credentials
5. Check NextAuth configuration

---

**Created**: October 24, 2025  
**Script**: `/scripts/create-default-admin.ts`  
**Status**: ✅ Admin Account Active
