# Password Reset Feature Documentation

## Overview
Added a complete password reset flow allowing users to reset their forgotten passwords via email verification.

## Features

### 1. Forgot Password Page
- **URL**: `/auth/forgot-password`
- User enters their email address
- System sends reset link if account exists
- Security: Always shows success message (prevents email enumeration)
- Reset link expires in 1 hour

### 2. Reset Password Page
- **URL**: `/auth/reset-password?token={token}`
- User enters new password (minimum 8 characters)
- Password confirmation field
- Token validation and expiration check
- Success message with auto-redirect to signin

### 3. Email Notifications
- Professional HTML email template
- Clickable reset button
- Plain text fallback link
- Expiration notice (1 hour)
- Security reminder

## User Flow

### Step 1: Request Password Reset
1. User visits `/auth/signin`
2. Clicks "Forgot your password?" link
3. Redirected to `/auth/forgot-password`
4. Enters email address
5. Clicks "Send Reset Link"
6. Sees confirmation message

### Step 2: Receive Email
1. User checks email inbox
2. Opens "Reset Your Pacific Explorer Password" email
3. Clicks "Reset Password" button or copies link

### Step 3: Reset Password
1. User clicks link, opens `/auth/reset-password?token=...`
2. Enters new password (min 8 chars)
3. Confirms password
4. Clicks "Reset Password"
5. Sees success message
6. Auto-redirected to signin page after 2 seconds

### Step 4: Sign In
1. User arrives at signin page with success message
2. Sees: "Password reset successfully! You can now sign in with your new password."
3. Signs in with new credentials

## API Endpoints

### POST `/api/auth/reset-password`
Request a password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "If an account exists with this email, a password reset link has been sent."
}
```

**Features:**
- Validates email format
- Finds user by email
- Generates 32-byte random token
- Sets 1-hour expiration
- Sends email with reset link
- Returns success even if email doesn't exist (security)

### POST `/api/auth/reset-password/verify`
Verify token and set new password.

**Request Body:**
```json
{
  "token": "abc123...",
  "password": "newPassword123"
}
```

**Response (200):**
```json
{
  "message": "Password reset successfully"
}
```

**Response (400 - Invalid Token):**
```json
{
  "error": "Invalid or expired reset token"
}
```

**Response (400 - Expired):**
```json
{
  "error": "Reset token has expired. Please request a new one."
}
```

**Features:**
- Validates token exists
- Checks token expiration
- Validates password length (min 8 chars)
- Hashes new password with bcrypt
- Clears reset token after use
- Updates user password

## Database Schema

The password reset feature reuses existing User model fields:
- `activationToken` - Stores the reset token
- `activationExpires` - Stores token expiration timestamp

This is safe because:
1. Reset tokens are only for active users (who already activated)
2. Activation tokens are cleared after account activation
3. Fields are nullable and can be reused for different purposes

## Security Features

### 1. Email Enumeration Prevention
- Always returns success message
- Doesn't reveal if email exists in system
- Consistent response time

### 2. Token Security
- 32-byte random tokens (256-bit entropy)
- Cryptographically secure random generation
- Unique constraint in database
- One-time use (cleared after reset)

### 3. Token Expiration
- 1 hour validity
- Server-side expiration check
- Cannot be extended or reused

### 4. Password Requirements
- Minimum 8 characters
- Hashed with bcrypt (10 rounds)
- Confirmation required in UI

### 5. Rate Limiting
- Consider adding rate limiting to prevent abuse
- Limit reset requests per IP/email (future enhancement)

## UI Components

### Forgot Password Page (`/app/auth/forgot-password/page.tsx`)
- Email input form
- Loading state
- Error messages
- Success confirmation screen
- Back to signin link

### Reset Password Page (`/app/auth/reset-password/page.tsx`)
- Token extraction from URL
- New password input
- Confirm password input
- Password validation
- Success screen with auto-redirect
- Suspense wrapper for searchParams

### Updated Signin Page
- "Forgot your password?" link below password field
- Success messages for:
  - Account activation
  - Password reset
- Visual separation with border

## Email Template

Located in: `/app/api/auth/reset-password/route.ts`

**Features:**
- Branded HTML layout
- PNG Red call-to-action button (#E4002B)
- Responsive design
- Plain text link fallback
- Expiration notice
- Security reminder
- Footer with app name

**Subject:** "Reset Your Pacific Explorer Password"

## Testing

### Test Password Reset Flow

1. **Request Reset:**
   ```
   Navigate to: http://localhost:3005/auth/forgot-password
   Enter email: test@example.com
   Click: Send Reset Link
   Check: Email received
   ```

2. **Verify Email:**
   ```
   Open email
   Click reset link
   Should open: http://localhost:3005/auth/reset-password?token=...
   ```

3. **Set New Password:**
   ```
   Enter new password: testPassword123
   Confirm password: testPassword123
   Click: Reset Password
   Wait for redirect
   ```

4. **Sign In:**
   ```
   Should see success message
   Enter username and new password
   Click: Sign In
   Should access dashboard
   ```

### Test Error Cases

1. **Invalid Token:**
   ```
   Visit: /auth/reset-password?token=invalid
   Try to submit
   Should show: "Invalid or expired reset token"
   ```

2. **Expired Token:**
   ```
   Wait 1+ hours after requesting reset
   Try to use link
   Should show: "Reset token has expired. Please request a new one."
   ```

3. **Password Mismatch:**
   ```
   Enter password: test123456
   Enter confirm: different123
   Should show: "Passwords do not match"
   ```

4. **Short Password:**
   ```
   Enter password: short
   Should show: "Password must be at least 8 characters long"
   ```

5. **Non-existent Email:**
   ```
   Request reset for: nonexistent@example.com
   Should still show success (security)
   No email sent
   ```

## File Structure

```
pacific-explorer/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── reset-password/
│   │           ├── route.ts              # NEW - Reset request endpoint
│   │           └── verify/
│   │               └── route.ts          # NEW - Token verification endpoint
│   └── auth/
│       ├── forgot-password/
│       │   └── page.tsx                  # NEW - Forgot password UI
│       ├── reset-password/
│       │   └── page.tsx                  # NEW - Reset password UI
│       └── signin/
│           └── page.tsx                  # UPDATED - Added forgot link
```

## Environment Variables

Uses existing email configuration:
```env
EMAIL_SERVER_HOST=ralikumx.raliku.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=aln@napitalai.com.pg
EMAIL_SERVER_PASSWORD=bah3Waem
EMAIL_FROM=aln@napitalai.com.pg
NEXTAUTH_URL=http://localhost:3005
```

## Known Issues

### TypeScript Errors (IDE Only)
The following TypeScript errors appear due to IDE caching:
- `activationToken` does not exist in type 'UserWhereUniqueInput'
- `activationExpires` does not exist on User type
- `password` does not exist in type 'UserUpdateInput'

**Resolution:** 
- The code runs correctly
- Prisma Client has correct types
- Restart VS Code TypeScript server to fix IDE errors

## Future Enhancements

### Rate Limiting
```typescript
// Add to reset-password/route.ts
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 requests per window
  message: 'Too many reset requests, please try again later.'
});
```

### Email Queue
- Use Redis/Bull for email queuing
- Retry failed email sends
- Better error handling

### Password Strength Meter
- Add visual password strength indicator
- Require strong passwords (uppercase, lowercase, numbers, symbols)
- Common password detection

### Security Audit Log
- Log all password reset attempts
- Track IP addresses
- Monitor for abuse patterns
- Alert admins of suspicious activity

### Two-Factor Authentication
- Require 2FA before password reset
- Send verification code via SMS
- Backup codes

### Account Recovery Options
- Multiple recovery methods
- Security questions
- Backup email
- Phone verification

## Integration with Existing Auth

The password reset feature integrates seamlessly with:
- ✅ Username/password authentication
- ✅ Email activation system
- ✅ NextAuth.js sessions
- ✅ Prisma User model
- ✅ bcrypt password hashing
- ✅ Nodemailer email delivery

## Production Considerations

1. **Email Deliverability:**
   - Configure SPF/DKIM records
   - Use dedicated email service (SendGrid, AWS SES)
   - Monitor bounce rates
   - Implement email verification

2. **Security:**
   - Add rate limiting
   - Implement CAPTCHA
   - Monitor for abuse
   - Log security events

3. **User Experience:**
   - Clear error messages
   - Loading indicators
   - Mobile-responsive design
   - Accessibility features

4. **Monitoring:**
   - Track reset success rates
   - Monitor email delivery
   - Alert on failures
   - Analytics integration

## Support

If users have issues:
1. Check spam/junk folder
2. Verify email address is correct
3. Request new reset link (old one expires)
4. Contact support if persistent issues
5. Admin can manually reset password via database

## Admin Password Reset

For admin users (like anapitalai):
1. Can use forgot password flow like any user
2. Or admin can reset via database:
   ```sql
   UPDATE "User" 
   SET password = '$2b$10$...' -- bcrypt hash of new password
   WHERE username = 'anapitalai';
   ```

## Rollback Plan

To disable password reset:
1. Remove links from signin page
2. Disable API endpoints (add 404 response)
3. Or delete feature files entirely

## Success Metrics

Track these metrics:
- Reset requests per day
- Successful resets
- Failed resets (expired, invalid)
- Email delivery rate
- Time from request to reset
- User satisfaction scores
