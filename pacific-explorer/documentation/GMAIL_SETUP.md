# Gmail SMTP Setup Guide for Pacific Explorer

## 🚨 Important: Gmail Requires App Password

Gmail **does not allow** regular passwords for SMTP access. You need to create an **App Password**.

---

## 📧 Step-by-Step Setup

### Option 1: Use Gmail with App Password (Recommended)

#### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** in the left menu
3. Under "How you sign in to Google", enable **2-Step Verification**
4. Follow the prompts to set it up (you'll need your phone)

#### Step 2: Generate App Password
1. After 2FA is enabled, go back to **Security**
2. Scroll down to "How you sign in to Google"
3. Click on **App passwords** (or visit: https://myaccount.google.com/apppasswords)
4. Select **Mail** as the app
5. Select **Other (Custom name)** as the device
6. Enter: "Pacific Explorer"
7. Click **Generate**
8. **Copy the 16-character password** (it looks like: `abcd efgh ijkl mnop`)

#### Step 3: Update Your .env File
```env
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="anapitalai@gmail.com"
EMAIL_SERVER_PASSWORD="abcdefghijklmnop"  # Replace with your App Password (no spaces)
EMAIL_FROM="Pacific Explorer <anapitalai@gmail.com>"
```

**Important:** 
- Remove all spaces from the App Password
- Use your Gmail address as `EMAIL_FROM`
- The App Password is 16 characters (looks random)

---

### Option 2: Use Ethereal Email (Testing - Easy Setup) ⚡

Ethereal is a fake SMTP service perfect for testing. No setup required!

1. Visit: https://ethereal.email/
2. Click **Create Ethereal Account**
3. Copy the credentials shown
4. Update your `.env`:

```env
EMAIL_SERVER_HOST="smtp.ethereal.email"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="[username from ethereal]"
EMAIL_SERVER_PASSWORD="[password from ethereal]"
EMAIL_FROM="Pacific Explorer <noreply@pacificexplorer.com>"
```

**Pros:**
- ✅ No configuration needed
- ✅ Works instantly
- ✅ View emails in browser at https://ethereal.email/messages

**Cons:**
- ⚠️ Only for testing (emails aren't delivered to real inboxes)

---

### Option 3: Use Mailtrap (Best for Development)

1. Sign up at https://mailtrap.io/ (free tier available)
2. Create a new inbox
3. Copy the SMTP credentials
4. Update your `.env`:

```env
EMAIL_SERVER_HOST="smtp.mailtrap.io"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="[your mailtrap username]"
EMAIL_SERVER_PASSWORD="[your mailtrap password]"
EMAIL_FROM="Pacific Explorer <noreply@pacificexplorer.com>"
```

---

## 🔧 Current Configuration Issues

Your current setup:
```env
EMAIL_SERVER_USER="anapitalai@gmail.com"
EMAIL_SERVER_PASSWORD="aip4yeiZ"  # ❌ This looks like a regular password
```

**Problem:** Gmail blocks regular passwords for SMTP. You need an App Password.

---

## ✅ Testing Authentication

After updating your `.env` file:

1. **Restart the dev server:**
   ```bash
   # Press Ctrl+C to stop the current server
   npm run dev
   ```

2. **Try signing in:**
   - Go to http://localhost:3005/auth/signin
   - Enter your email
   - Click "Send magic link"
   - Check your email (or Ethereal/Mailtrap inbox)

3. **Check for errors:**
   - Look at the terminal output
   - With `debug: true` enabled, you'll see detailed error messages

---

## 🐛 Common Errors and Fixes

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"
**Fix:** You're using a regular password. Create an App Password (see Option 1 above)

### Error: "EAUTH: Authentication failed"
**Fix:** 
- Make sure 2FA is enabled on your Google account
- Generate a new App Password
- Remove any spaces from the App Password

### Error: "ETIMEDOUT" or "ECONNREFUSED"
**Fix:**
- Check your firewall settings
- Try using port 465 instead of 587
- Update `.env`: `EMAIL_SERVER_PORT="465"`

### Error: "self signed certificate"
**Fix:** Already handled in the updated config with `rejectUnauthorized: false`

---

## 🎯 Recommended Approach

**For Development/Testing:**
Use **Ethereal Email** (Option 2) - it's the fastest and easiest

**For Production:**
Use **Gmail with App Password** (Option 1) or a professional email service like:
- SendGrid (free tier: 100 emails/day)
- Amazon SES (very cheap, reliable)
- Postmark (great deliverability)

---

## 📝 Quick Start with Ethereal (1 minute)

```bash
# 1. Visit https://ethereal.email/ and click "Create Ethereal Account"
# 2. Copy the credentials shown
# 3. Update your .env file with those credentials
# 4. Restart: npm run dev
# 5. Try signing in at http://localhost:3005/auth/signin
# 6. Check emails at https://ethereal.email/messages
```

---

## 🔐 Security Notes

- **Never commit** your `.env` file to git
- App Passwords are as sensitive as your regular password
- Revoke unused App Passwords from your Google Account
- For production, use environment variables on your hosting platform

---

## Need Help?

If emails still aren't working:
1. Check the terminal for error messages (debug mode is now enabled)
2. Verify your `.env` file has no extra spaces
3. Make sure you restarted the dev server after changing `.env`
4. Try Ethereal Email first to rule out configuration issues

---

**Updated:** October 22, 2025
**Status:** Debug mode enabled, TLS configured for Gmail
