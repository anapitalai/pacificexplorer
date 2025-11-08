# 🔄 Persistent Admin Account - Database Reset Guide

## Overview

The admin account **anapitalai** is now configured to automatically persist after every database reset. This is achieved through Prisma's seeding mechanism.

## 🔐 Admin Credentials (Always Available)

```
📧 Email:    anapitalai@admin.com
👤 Username: anapitalai
🔑 Password: admin123
🔐 Role:     ADMIN
```

These credentials will be automatically recreated after any database reset operation.

---

## How It Works

### 1. Automatic Seeding

The admin account is defined in `/prisma/seed.ts` and automatically runs when you:

- Reset the database with `prisma db push --force-reset`
- Run migrations that affect the database
- Manually execute `npm run prisma:seed`

### 2. Smart Logic

The seed script includes smart logic:

```typescript
if (!existingAdmin) {
  // Create new admin account
} else {
  // Update existing admin (ensure ADMIN role, reset password)
}
```

This ensures:
- ✅ Admin account is created if missing
- ✅ Existing user is upgraded to ADMIN if needed
- ✅ Password is reset to default `admin123`
- ✅ Account is activated and verified

---

## Database Reset Methods

### Method 1: Quick Reset Script (Recommended)

```bash
./scripts/reset-and-seed.sh
```

This interactive script will:
1. ⚠️  Ask for confirmation
2. 🗑️  Reset database schema
3. 🔧 Regenerate Prisma Client
4. 🌱 Seed default data (including admin account)
5. ✅ Show summary with credentials

**What gets seeded:**
- Admin account (anapitalai)
- Sample destinations (Tufi Resort, Kokoda Track, etc.)

---

### Method 2: Manual Reset Commands

```bash
# Step 1: Reset database
npx prisma db push --force-reset --accept-data-loss

# Step 2: Generate Prisma Client
npx prisma generate

# Step 3: Seed database
npm run prisma:seed
```

---

### Method 3: Prisma Migrate (Production)

```bash
# Create a new migration
npx prisma migrate dev --name reset_database

# Seed will run automatically after migration
```

---

### Method 4: Seed Only (No Reset)

If you just want to ensure admin exists without resetting:

```bash
npm run prisma:seed
```

This is safe to run anytime - it won't duplicate data.

---

## Configuration Files

### 1. Seed Script
**Location:** `/prisma/seed.ts`

```typescript
// Admin account configuration
const adminUsername = 'anapitalai';
const adminEmail = 'anapitalai@admin.com';
const adminPassword = 'admin123';
```

**To customize:**
1. Edit these values in `seed.ts`
2. Run `npm run prisma:seed`

### 2. Package.json Configuration

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "scripts": {
    "prisma:seed": "tsx prisma/seed.ts"
  }
}
```

This tells Prisma to automatically run the seed after certain operations.

---

## Testing the Persistence

### Test 1: Full Reset

```bash
# Reset everything
./scripts/reset-and-seed.sh

# Verify admin exists
psql -d pacific-explorer -c "SELECT username, email, role FROM \"User\" WHERE username='anapitalai';"
```

### Test 2: Login After Reset

```bash
# Reset database
./scripts/reset-and-seed.sh

# Try logging in
curl -X POST http://localhost:3005/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"anapitalai","password":"admin123"}'
```

### Test 3: Multiple Resets

```bash
# Run reset 3 times
for i in {1..3}; do
  echo "Reset #$i"
  npx prisma db push --force-reset --accept-data-loss
  npm run prisma:seed
  sleep 2
done

# Admin should still exist
```

---

## Production Deployment

### Environment Variables

For different environments, use environment variables:

```bash
# .env.production
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=super-secure-password-here
```

Update `seed.ts`:

```typescript
const adminUsername = process.env.ADMIN_USERNAME || 'anapitalai';
const adminEmail = process.env.ADMIN_EMAIL || 'anapitalai@admin.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
```

### Docker Setup

```dockerfile
# Dockerfile
FROM node:20-alpine

# Copy files
COPY . /app
WORKDIR /app

# Install dependencies
RUN npm install

# Build
RUN npm run build

# Migrate and seed on startup
CMD npx prisma migrate deploy && \
    npx prisma db seed && \
    npm start
```

### Kubernetes Init Container

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pacific-explorer
spec:
  initContainers:
  - name: db-seed
    image: pacific-explorer:latest
    command: ['npm', 'run', 'prisma:seed']
  containers:
  - name: app
    image: pacific-explorer:latest
```

---

## Automation Scripts

### Auto-seed on Server Start

Create `scripts/start-with-seed.sh`:

```bash
#!/bin/bash
echo "🌱 Ensuring database is seeded..."
npm run prisma:seed

echo "🚀 Starting server..."
npm start
```

Make it executable:
```bash
chmod +x scripts/start-with-seed.sh
```

Update `package.json`:
```json
{
  "scripts": {
    "start:seeded": "./scripts/start-with-seed.sh"
  }
}
```

---

## Scheduled Seeding (Cron)

Set up a daily seed verification:

```bash
# Add to crontab
crontab -e

# Add this line (runs daily at 2am)
0 2 * * * cd /path/to/pacific-explorer && npm run prisma:seed >> /tmp/seed.log 2>&1
```

---

## Adding More Default Data

### Seed Additional Admin Accounts

Edit `/prisma/seed.ts`:

```typescript
// Add after main admin creation
const additionalAdmins = [
  {
    username: 'superadmin',
    email: 'super@admin.com',
    password: 'SecurePassword123!',
    name: 'Super Administrator',
  },
  {
    username: 'support',
    email: 'support@admin.com',
    password: 'SupportPass123!',
    name: 'Support Team',
  },
];

for (const admin of additionalAdmins) {
  const existing = await prisma.user.findUnique({
    where: { username: admin.username }
  });
  
  if (!existing) {
    const hashed = await bcrypt.hash(admin.password, 10);
    await prisma.user.create({
      data: {
        ...admin,
        password: hashed,
        role: 'ADMIN',
        isActive: true,
        emailVerified: new Date(),
      }
    });
    console.log(`✅ Created admin: ${admin.username}`);
  }
}
```

### Seed Hotels

```typescript
const hotels = [
  {
    name: "Hilton Port Moresby",
    province: "National Capital District",
    latitude: -9.4438,
    longitude: 147.1803,
    starRating: 5,
    priceRange: "Luxury",
    amenities: ["WiFi", "Pool", "Restaurant", "Gym", "Spa"],
  },
  // ... more hotels
];

for (const hotel of hotels) {
  const existing = await prisma.hotel.findFirst({
    where: { name: hotel.name }
  });
  
  if (!existing) {
    await prisma.hotel.create({ data: hotel });
    console.log(`✅ Created hotel: ${hotel.name}`);
  }
}
```

---

## Troubleshooting

### Issue: Seed doesn't run after reset

**Solution:**
```bash
# Manually run seed
npm run prisma:seed

# Check package.json has correct configuration
grep -A 2 '"prisma"' package.json
```

### Issue: Admin account not created

**Solution:**
```bash
# Check seed script output
npm run prisma:seed 2>&1 | tee seed.log

# Verify database connection
npx prisma db pull
```

### Issue: Password doesn't work

**Solution:**
```bash
# Reset password manually
npx tsx scripts/create-default-admin.ts

# Or via seed
npm run prisma:seed
```

### Issue: Multiple admin accounts

**Solution:**
```sql
-- List all admins
SELECT id, username, email, role 
FROM "User" 
WHERE role = 'ADMIN';

-- Keep only one (delete others)
DELETE FROM "User" 
WHERE username != 'anapitalai' 
AND role = 'ADMIN';
```

---

## Best Practices

1. ✅ **Never delete seed.ts** - It ensures admin persistence
2. ✅ **Keep default password simple for dev** - Easy to remember
3. ✅ **Use env vars in production** - Secure passwords
4. ✅ **Document custom seeds** - So team knows what data exists
5. ✅ **Test seed idempotency** - Should be safe to run multiple times
6. ✅ **Version control seed.ts** - Track changes to default data
7. ✅ **Log seed operations** - Easy troubleshooting
8. ✅ **Backup before major resets** - Safety first

---

## Verification Checklist

After any database reset:

- [ ] Admin account exists
  ```bash
  npx tsx -e "
    import { PrismaClient } from '@prisma/client';
    const prisma = new PrismaClient();
    prisma.user.findUnique({where: {username: 'anapitalai'}})
      .then(u => console.log('Admin found:', u?.username, u?.role));
  "
  ```

- [ ] Admin can login
  - Go to http://localhost:3005/auth/signin
  - Enter: anapitalai / admin123
  - Should redirect to dashboard

- [ ] Admin has correct role
  ```sql
  SELECT role FROM "User" WHERE username='anapitalai';
  -- Should return: ADMIN
  ```

- [ ] Account is active
  ```sql
  SELECT "isActive", "emailVerified" 
  FROM "User" 
  WHERE username='anapitalai';
  -- isActive: true
  -- emailVerified: <timestamp>
  ```

---

## Related Files

- `/prisma/seed.ts` - Main seed script
- `/scripts/reset-and-seed.sh` - Quick reset script
- `/scripts/create-default-admin.ts` - Manual admin creation
- `/package.json` - Seed configuration
- `/prisma/schema.prisma` - Database schema

---

## Quick Reference

```bash
# Reset and seed (interactive)
./scripts/reset-and-seed.sh

# Reset and seed (automatic)
npx prisma db push --force-reset --accept-data-loss && npm run prisma:seed

# Seed only (safe, no deletion)
npm run prisma:seed

# Verify admin exists
psql -d pacific-explorer -c "SELECT * FROM \"User\" WHERE username='anapitalai';"

# Manual admin creation
npx tsx scripts/create-default-admin.ts

# Check seed configuration
cat package.json | grep -A 5 prisma
```

---

**Status**: ✅ Fully Configured & Tested  
**Last Updated**: October 24, 2025  
**Maintainer**: Pacific Explorer Team
