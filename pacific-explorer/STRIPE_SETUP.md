# Stripe Payment Integration Setup

## Overview
Pacific Explorer uses Stripe for payment processing with a hybrid business model:
- **60% Revenue**: Commission on bookings
- **25% Revenue**: Premium subscriptions
- **15% Revenue**: Advertising & partnerships

## Current Status
✅ **Database Schema**: Complete with Subscription, Commission, Booking, Ad, and Partnership models
✅ **API Endpoints**: Subscription and Commission APIs implemented
✅ **UI Components**: Subscription plans and admin commission dashboard
✅ **Environment Variables**: Dummy values configured for development

## Environment Variables (Already Set)

The following dummy values are configured in `.env`:

```bash
# Stripe Payment Processing Configuration
STRIPE_SECRET_KEY="sk_test_dummy_stripe_secret_key_for_development_only"
STRIPE_PUBLISHABLE_KEY="pk_test_dummy_stripe_publishable_key_for_development_only"

# Stripe Price IDs for subscription plans
STRIPE_PREMIUM_PRICE_ID="price_dummy_premium_price_id"
STRIPE_PRO_PRICE_ID="price_dummy_pro_price_id"

# Stripe Webhook Configuration
STRIPE_WEBHOOK_SECRET="whsec_dummy_webhook_secret_for_development_only"
```

## To Enable Real Stripe Payments

### 1. Create Stripe Account
1. Sign up at [Stripe Dashboard](https://dashboard.stripe.com/)
2. Enable test mode for development

### 2. Get API Keys
1. Go to **Developers** → **API Keys**
2. Copy your **Secret key** (starts with `sk_test_`)
3. Copy your **Publishable key** (starts with `pk_test_`)

### 3. Create Subscription Products
1. Go to **Products** → **Create Product**
2. Create "Premium Plan" - $9.99/month
3. Create "Pro Plan" - $19.99/month
4. Copy the **Price IDs** from each product

### 4. Set Up Webhooks
1. Go to **Developers** → **Webhooks**
2. Add endpoint: `https://yourdomain.com/api/subscriptions/webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the **Webhook signing secret**

### 5. Update Environment Variables

Replace the dummy values in `.env` with real ones:

```bash
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_PREMIUM_PRICE_ID="price_..."
STRIPE_PRO_PRICE_ID="price_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 6. Enable Stripe Integration

In `app/api/subscriptions/route.ts`, uncomment the Stripe imports and integration code:

```typescript
// Uncomment these lines:
// import Stripe from 'stripe';
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2025-10-29.clover',
// });
```

### 7. Test Payments

Use Stripe test cards:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires authentication**: `4000 0025 0000 3155`

## API Endpoints

### Subscriptions
- `GET /api/subscriptions` - Get user's subscription
- `POST /api/subscriptions` - Create/update subscription
- `PUT /api/subscriptions` - Change subscription plan
- `DELETE /api/subscriptions` - Cancel subscription
- `POST /api/subscriptions/webhook` - Stripe webhooks

### Commissions
- `GET /api/commissions` - Get commissions (filtered by user role)
- `POST /api/commissions` - Create commission on booking
- `PUT /api/commissions?id={id}` - Update commission status

## Database Models

### Subscription Model
```prisma
model Subscription {
  id                   Int                @id @default(autoincrement())
  userId               String
  plan                 SubscriptionPlan   // BASIC, PREMIUM, PRO
  status               SubscriptionStatus // ACTIVE, CANCELED, PAST_DUE, UNPAID
  stripeSubscriptionId String?            @unique
  currentPeriodStart   DateTime
  currentPeriodEnd     DateTime
  cancelAtPeriodEnd    Boolean            @default(false)
  // ...timestamps
}
```

### Commission Model
```prisma
model Commission {
  id               Int              @id @default(autoincrement())
  bookingId        Int              @unique
  amount           Float
  percentage       Float            // e.g., 0.10 for 10%
  businessId       String           // Business owner ID
  status           CommissionStatus // PENDING, PROCESSED, FAILED
  stripeTransferId String?          // Stripe transfer ID
  // ...relations and timestamps
}
```

## Business Logic

### Commission Calculation
- Automatically created when booking is confirmed
- Amount = booking total × commission percentage (typically 5-15%)
- Paid to business owner via Stripe transfers

### Subscription Features
- **Basic**: Free, limited features
- **Premium**: $9.99/month, enhanced features
- **Pro**: $19.99/month, professional tools

### Revenue Streams
- **60%**: Commission on bookings
- **25%**: Subscription revenue
- **15%**: Advertising and partnerships

## Testing

1. Start development server: `npm run dev`
2. Visit `/subscription` to test subscription plans
3. Visit `/admin` to test commission dashboard
4. Use Stripe test cards for payment testing

## Production Deployment

1. Switch to live Stripe keys (remove `_test_` from keys)
2. Update webhook URL to production domain
3. Configure Stripe Connect for commission payouts
4. Set up proper error handling and monitoring
5. Implement PCI compliance measures

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Prisma Documentation](https://www.prisma.io/docs)</content>
<parameter name="filePath">/home/alois/Documents/cassini_hackathon/pacific-explorer/STRIPE_SETUP.md
