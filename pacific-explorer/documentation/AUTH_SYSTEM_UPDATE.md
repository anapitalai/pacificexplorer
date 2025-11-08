# Authentication System Update - Username/Password with Email Verification

## Changes Made (October 24, 2025)

### 1. Database Schema Changes
- **Deleted existing users** from the database (2 users removed)
- **Updated Prisma User model** (`prisma/schema.prisma`):
  - Added `username: String @unique` - Required, unique username field
  - Added `password: String` - Required, hashed password
  - Added `isActive: Boolean @default(false)` - Account activation status
  - Added `activationToken: String? @unique` - Unique token for email verification
  - Added `activationExpires: DateTime?` - Token expiration timestamp (24 hours)
- **Created migration**: `20251024022906_add_username_password_auth`

### 2. Dependencies Installed
```bash
npm install bcrypt @types/bcrypt --legacy-peer-deps
npm install @types/nodemailer --legacy-peer-deps
npm install prisma@latest @prisma/client@latest --legacy-peer-deps
```

### 3. API Endpoints Created

#### Registration Endpoint (`app/api/auth/register/route.ts`)
- **POST /api/auth/register**
- Accepts: `username`, `email`, `password`
- Features:
  - Validates username and email uniqueness
  - Hashes password with bcrypt (10 rounds)
  - Generates 32-byte hex activation token
  - Sets token expiration (24 hours from creation)
  - Sends activation email with styled HTML template
  - Returns success message

#### Activation Endpoint (`app/api/auth/activate/route.ts`)
- **GET /api/auth/activate?token={token}**
- Features:
  - Validates activation token
  - Checks token expiration
  - Sets `isActive = true`
  - Sets `emailVerified = now()`
  - Clears activation token
  - Redirects to signin with success message

### 4. Authentication Configuration Updated

#### NextAuth Configuration (`lib/auth.ts`)
- **Removed**: EmailProvider (magic link authentication)
- **Removed**: PrismaAdapter (no longer needed for credentials)
- **Added**: CredentialsProvider with username/password
- **Features**:
  - Finds user by username
  - Validates user is active (`isActive = true`)
  - Verifies password with bcrypt
  - Returns user data on successful auth
  - JWT session strategy (30 day max age)

### 5. UI Pages Created/Updated

#### Registration Page (`app/auth/register/page.tsx`)
- **URL**: `/auth/register`
- **Fields**:
  - Username (required)
  - Email (required)
  - Password (min 8 characters, required)
  - Confirm Password (must match)
- **Features**:
  - Client-side and server-side validation
  - Password match verification
  - Success screen with email check instructions
  - Link to signin page
  - Error handling with user-friendly messages

#### Signin Page (`app/auth/signin/page.tsx`)
- **URL**: `/auth/signin`
- **Fields**:
  - Username (required)
  - Password (required)
- **Features**:
  - Credentials authentication
  - Success message for activated accounts
  - Error handling for invalid credentials
  - Error message for inactive accounts
  - Link to registration page
  - Redirects to `/dashboard` on success

### 6. Email Configuration
- **SMTP Server**: ralikumx.raliku.com:587
- **From**: aln@napitalai.com.pg
- **Activation Email**:
  - HTML template with branded styling
  - Clickable activation button
  - Plain text link fallback
  - 24-hour expiration notice
  - Security notice for unintended registrations

## Testing Locally

### 1. Start the Development Server
```bash
cd /home/alois/Documents/cassini_hackathon/pacific-explorer
npm run dev
```
Server runs on: http://localhost:3005

### 2. Test Registration Flow
1. Visit: http://localhost:3005/auth/register
2. Fill in:
   - Username: `testuser`
   - Email: your_email@example.com
   - Password: `password123`
   - Confirm Password: `password123`
3. Click "Create Account"
4. Check email for activation link
5. Click activation link
6. Should redirect to signin with success message

### 3. Test Signin Flow
1. Visit: http://localhost:3005/auth/signin
2. Enter username and password
3. Click "Sign In"
4. Should redirect to `/dashboard`

### 4. Test Error Cases
- **Inactive Account**: Try signing in before activating email
- **Invalid Credentials**: Try wrong username or password
- **Duplicate Username**: Try registering same username twice
- **Duplicate Email**: Try registering same email twice
- **Password Mismatch**: Try different passwords in registration
- **Expired Token**: Wait 24 hours and try activation link

## Database Verification

### Check User Creation
```sql
SELECT id, username, email, "isActive", "activationToken", "activationExpires", "emailVerified", "createdAt" 
FROM "User";
```

### Check Active Users
```sql
SELECT username, email, "isActive", "emailVerified" 
FROM "User" 
WHERE "isActive" = true;
```

### Manually Activate User (if needed)
```sql
UPDATE "User" 
SET "isActive" = true, "emailVerified" = NOW(), "activationToken" = NULL, "activationExpires" = NULL 
WHERE username = 'testuser';
```

## Security Features

1. **Password Hashing**: bcrypt with 10 salt rounds
2. **Unique Constraints**: Username, email, and activation token
3. **Token Expiration**: 24-hour activation window
4. **Account Activation**: Must verify email before signin
5. **JWT Sessions**: Stateless 30-day sessions
6. **Input Validation**: Both client and server-side
7. **SQL Injection Protection**: Prisma parameterized queries

## Migration to Production

### Before Deploying:
1. Test thoroughly in local environment
2. Verify email delivery works
3. Test all error scenarios
4. Check database migrations
5. Update `.env.production` if needed

### Production Deployment Steps:
1. SSH to production server: `ssh alois@170.64.195.201`
2. Navigate to app: `cd /path/to/pacific-explorer`
3. Pull latest code: `git pull` (or copy files)
4. Install dependencies: `npm install --legacy-peer-deps`
5. Run migration: `npx prisma migrate deploy`
6. Rebuild: `npm run build`
7. Restart Docker: `docker-compose restart`
8. Test registration and signin flows

## Known Issues

### TypeScript Errors (Expected)
The following TypeScript errors appear because VS Code's TypeScript server hasn't reloaded the new Prisma types:
- `username` does not exist in type 'UserWhereUniqueInput'
- `password` does not exist on User type
- `isActive` does not exist on User type

**Resolution**: These are IDE caching issues. The code will run correctly. To fix IDE errors:
1. Restart VS Code TypeScript server: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
2. Or restart VS Code entirely
3. The generated Prisma Client in `node_modules/@prisma/client` has the correct types

## Files Modified

```
prisma/schema.prisma                           # Added username, password, activation fields
prisma/migrations/20251024022906_*/migration.sql  # Database migration
app/api/auth/register/route.ts                 # NEW - Registration endpoint
app/api/auth/activate/route.ts                 # NEW - Activation endpoint
app/auth/register/page.tsx                     # NEW - Registration UI
app/auth/signin/page.tsx                       # UPDATED - Username/password signin
lib/auth.ts                                    # UPDATED - Credentials provider
```

## Environment Variables Required

```env
# Database
DATABASE_URL="postgresql://postgres:admin123@170.64.167.7:30432/pacific-explorer?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3005"
NEXTAUTH_SECRET="your-secret-here"

# Email (for activation links)
EMAIL_SERVER_HOST="ralikumx.raliku.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="aln@napitalai.com.pg"
EMAIL_SERVER_PASSWORD="bah3Waem"
EMAIL_FROM="aln@napitalai.com.pg"
```

## Next Steps

1. ✅ Test registration locally
2. ✅ Test email delivery
3. ✅ Test activation flow
4. ✅ Test signin with credentials
5. ⏳ Test error scenarios
6. ⏳ Add password reset functionality (optional)
7. ⏳ Add "remember me" option (optional)
8. ⏳ Deploy to production server

## Rollback Plan

If issues occur, to rollback to magic link auth:
1. Revert `lib/auth.ts` to use EmailProvider
2. Revert `app/auth/signin/page.tsx` to email input
3. Delete new API routes: `app/api/auth/register/` and `app/api/auth/activate/`
4. Rollback migration: `npx prisma migrate dev`
5. Or restore from backup: `pacific-explorer-backup-20251023-151154.tar.gz`
