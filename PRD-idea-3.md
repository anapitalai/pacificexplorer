# Product Requirements Document (PRD)
## Pacific Explorer: Sustainable Tourism Platform

---

## 1. Executive Summary

**Product Name:** Paradise Tourist Site Explorer

**Version:** 1.0

**Date:** October 22, 2025

**Challenge:** Beyond Horizons - Redefining Travel with Space Innovation (Challenge #3)

### Overview
Pacific Explorer is a satellite-powered tourism platform that leverages EU space technologies (Copernicus, Galileo, IRIS²) to help tourists discover hidden wonders across Papua New Guinea countries while promoting sustainable and personalized travel experiences. The platform combines real-time Earth observation data, precision navigation, and community-driven content to create immersive, eco-conscious travel planning tools.

### Problem Statement
- Papua New Guinea tourism lacks accessible, data-driven discovery tools
- Tourists struggle to find authentic, remote destinations beyond mainstream resorts
- Limited visibility into environmental conditions (coral health, coastal erosion, weather)
- No centralized platform combining satellite data with local tourism insights
- Travel providers need better tools to offer personalized, sustainable experiences

### Target Audience
1. **Primary:** International and regional tourists seeking authentic Pacific experiences
2. **Secondary:** Local tourism operators, provincial tourism boards, eco-conscious travelers
3. **Tertiary:** Marine conservation groups, coastal communities, travel agencies

---

## 2. Product Vision & Goals

### Vision Statement
To make Pacific Island tourism more accessible, sustainable, and personalized by leveraging space technologies that connect travelers with hidden destinations while supporting environmental preservation.

### Product Goals
1. Enable discovery of remote islands, reefs, mountains, waterfalls, and cultural sites
2. Provide real-time environmental and safety information using satellite data
3. Promote sustainable tourism through eco-conscious journey planning
4. Support local communities by highlighting provincial attractions
5. Integrate coastal and marine monitoring for traveler safety and awareness

### Success Metrics
- **Adoption:** 10,000+ active users in first 6 months
- **Engagement:** Average 5+ destinations explored per user session
- **Coverage:** All PNG provinces with at least 10 attractions mapped
- **Community:** 100+ user-contributed locations in first year
- **Sustainability:** 80% of users report increased environmental awareness

---

## 3. User Stories & Use Cases

### Primary User Stories

**As a tourist, I want to:**
- Discover hidden beaches, reefs, and remote islands before visiting
- View satellite imagery to see actual current conditions of destinations
- Get personalized recommendations based on my interests (coastal, inland, geothermal)
- Navigate safely to remote locations using GPS coordinates
- Understand environmental conditions (coral bleaching, erosion) before planning trips
- Save and share my favorite destinations with others

**As a tourism operator, I want to:**
- Showcase provincial attractions with satellite imagery
- Update real-time conditions for my tours (weather, accessibility)
- Reach international tourists searching for authentic experiences
- Demonstrate commitment to sustainable practices

**As a coastal community member, I want to:**
- Report changes in coastal conditions or coral health
- Tag new attractions or points of interest
- Share local knowledge about hidden gems
- Receive alerts about environmental changes affecting my area

### Use Cases

#### Use Case 1: Pre-Trip Destination Discovery
1. User opens app and selects interest category (e.g., "Coastal Attractions")
2. Map displays satellite imagery with tagged beaches, reefs, islands
3. User filters by province or specific features (diving spots, resorts)
4. User views high-resolution Sentinel-2 imagery of selected location
5. System shows recent environmental data (water clarity, vegetation)
6. User saves destinations to personalized trip itinerary

#### Use Case 2: Real-Time Navigation to Remote Site
1. Tourist selects saved destination from itinerary
2. App provides Galileo GNSS coordinates with offline capability
3. Navigation guides user with turn-by-turn directions
4. System alerts about recent environmental changes (e.g., trail conditions)
5. User geo-tags photos at location for community validation
6. Updates feed back into platform for future travelers

#### Use Case 3: Environmental Monitoring Dashboard
1. Tourism board logs into platform
2. Dashboard shows coastal erosion trends using Sentinel-3 data
3. Map highlights areas with coral bleaching detected
4. System generates reports for conservation planning
5. Alerts sent via IRIS² to remote communities about significant changes

---

## 4. Functional Requirements

### 4.1 Core Features

#### F1: Interactive Map & Discovery
- **F1.1** Display base map using MapLibre/Leaflet with satellite imagery overlay
- **F1.2** Show tourism attractions categorized by type:
  - Coastal: beaches, reefs, marine attractions, island resorts
  - Inland: wildlife, mountains, valleys, treks, waterfalls
  - Geothermal: volcanoes, hot springs
  - Cultural: villages, historical sites, festivals
- **F1.3** Filter destinations by province, district, or theme
- **F1.4** Search functionality by location name or feature type
- **F1.5** Toggle between satellite view (Sentinel-2) and map view

#### F2: Satellite Data Integration
- **F2.1** Display Copernicus Sentinel-2 imagery (optical, high-resolution)
- **F2.2** Integrate Sentinel-3 data for ocean/water quality monitoring
- **F2.3** Show chlorophyll concentration levels for coral reef health
- **F2.4** Display coastal erosion indicators with time-series comparison
- **F2.5** Provide cloud-free imagery composites for better visibility

#### F3: Personalized Travel Planning
- **F3.1** User profile with interest preferences
- **F3.2** AI-powered destination recommendations
- **F3.3** Itinerary builder with multi-day trip planning
- **F3.4** Save favorite destinations for offline access
- **F3.5** Share itineraries via link or social media

#### F4: Navigation & Wayfinding
- **F4.1** Galileo GNSS-based positioning with coordinates
- **F4.2** Turn-by-turn navigation to destinations
- **F4.3** Offline map download for remote areas
- **F4.4** Distance and travel time estimates
- **F4.5** Safety alerts for restricted or hazardous areas

#### F5: Community Contribution
- **F5.1** User photo uploads with geo-tagging
- **F5.2** Community observations (erosion, coral bleaching, new sites)
- **F5.3** Rating and review system for attractions
- **F5.4** Local guide suggestions and tips
- **F5.5** Validation workflow for community submissions

#### F6: Environmental Monitoring
- **F6.1** Coastal erosion tracking dashboard
- **F6.2** Coral bleaching detection alerts
- **F6.3** Time-series analysis of shoreline changes
- **F6.4** Sediment build-up monitoring
- **F6.5** Export reports for conservation authorities

#### F7: Remote Connectivity (IRIS²)
- **F7.1** Data sync in low-bandwidth environments
- **F7.2** Alert delivery to remote islands via satellite
- **F7.3** Offline-first architecture with background sync
- **F7.4** SMS fallback for critical notifications

### 4.2 Integration Requirements

#### I1: Data Sources
- **I1.1** Copernicus Open Access Hub API
- **I1.2** Sentinel Hub API for imagery processing
- **I1.3** Galileo GNSS positioning services
- **I1.4** FAO SEPAL platform for satellite analysis
- **I1.5** Collect Earth for community validation

#### I2: Third-Party Services
- **I2.1** Weather API for real-time conditions
- **I2.2** Social media sharing (Facebook, Instagram, WhatsApp)
- **I2.3** Payment gateway for premium features (future)
- **I2.4** Analytics platform (Google Analytics, Mixpanel)

---

## 5. Non-Functional Requirements

### 5.1 Performance
- **NFR1.1** Map loads within 2 seconds on 3G connection
- **NFR1.2** Satellite imagery renders within 5 seconds
- **NFR1.3** Search results return within 1 second
- **NFR1.4** Support 1,000+ concurrent users
- **NFR1.5** 99.5% uptime availability

### 5.2 Scalability
- **NFR2.1** Database handles 10,000+ attraction records
- **NFR2.2** Support 100,000+ registered users
- **NFR2.3** Store 1TB+ satellite imagery cache
- **NFR2.4** Horizontal scaling for API services

### 5.3 Security
- **NFR3.1** HTTPS encryption for all data transmission
- **NFR3.2** User authentication via OAuth 2.0
- **NFR3.3** Role-based access control (tourist, operator, admin)
- **NFR3.4** Data privacy compliance (GDPR-ready)
- **NFR3.5** Secure storage of user location data

### 5.4 Accessibility
- **NFR4.1** Mobile-first responsive design
- **NFR4.2** Support for Android and iOS (PWA)
- **NFR4.3** Offline-first architecture
- **NFR4.4** Multi-language support (English, Tok Pisin, Hiri Motu)
- **NFR4.5** WCAG 2.1 AA compliance

### 5.5 Usability
- **NFR5.1** Intuitive interface requiring no training
- **NFR5.2** Maximum 3 taps to reach any destination
- **NFR5.3** Clear visual hierarchy and iconography
- **NFR5.4** Consistent design patterns across platform

---

## 6. Technical Architecture

### 6.0 Why Next.js?

**Strategic Advantages for Pacific Explorer:**

1. **Full-Stack Framework**
   - Unified codebase for frontend and backend (API routes)
   - No need for separate Express/FastAPI server
   - TypeScript end-to-end for type safety

2. **Performance Optimizations**
   - **Server-Side Rendering (SSR):** Fast initial page loads for SEO
   - **Static Site Generation (SSG):** Pre-render destination pages
   - **Incremental Static Regeneration (ISR):** Update cached pages without rebuild
   - **Automatic Code Splitting:** Faster load times for remote areas
   - **Edge Runtime:** Deploy globally with minimal latency

3. **Developer Experience**
   - Hot Module Replacement (instant feedback)
   - Built-in TypeScript support
   - File-based routing (no configuration needed)
   - Integrated testing with Playwright
   - Excellent documentation and community

4. **PWA & Offline Support**
   - Easy PWA setup with `next-pwa`
   - Service Worker integration
   - Perfect for remote Pacific islands with poor connectivity

5. **Image & Asset Optimization**
   - Automatic image optimization (WebP, AVIF)
   - Lazy loading built-in
   - Critical for satellite imagery performance

6. **Deployment & Scalability**
   - One-click deployment to Vercel
   - Automatic HTTPS and global CDN
   - Serverless functions scale automatically
   - Zero config for production optimization

7. **Cost Efficiency**
   - Vercel free tier sufficient for MVP
   - No server management costs
   - Pay-as-you-grow pricing

**Next.js Features Used:**

| Feature | Use Case in Pacific Explorer |
|---------|------------------------------|
| App Router | Modern routing with layouts, loading states |
| Server Components | Reduce client bundle size, faster loads |
| Server Actions | Seamless form submissions, mutations |
| Route Handlers (API) | RESTful API endpoints |
| Middleware | Auth checks, rate limiting, redirects |
| Image Component | Optimized satellite imagery delivery |
| Metadata API | SEO for destination pages |
| Streaming | Progressive rendering for slow connections |
| Edge Runtime | Global performance for Pacific region |

### 6.1 Technology Stack

#### Frontend & Backend (Next.js Full-Stack)
- **Framework:** Next.js 14+ (App Router)
- **Runtime:** Node.js 18+ with TypeScript
- **Mapping:** MapLibre GL JS with React wrapper (react-map-gl)
- **UI Library:** Tailwind CSS + shadcn/ui components
- **State Management:** React Context API + Zustand (for complex state)
- **Forms:** React Hook Form + Zod validation
- **API Routes:** Next.js API Routes (serverless functions)
- **Authentication:** NextAuth.js (OAuth, JWT, credentials)
- **Image Optimization:** Next.js Image component with Sharp
- **Offline/PWA:** next-pwa plugin with Service Workers + IndexedDB

#### Database & Storage
- **Database:** PostgreSQL 15+ with PostGIS extension
- **ORM:** Prisma (TypeScript-first, excellent Next.js integration)
- **Cache:** Redis for session storage, API caching, and rate limiting
- **File Storage:** 
  - AWS S3 or Vercel Blob for satellite imagery
  - Cloudinary for user-uploaded photos (with transformations)
- **Vector Search:** pgvector for destination recommendations (future)

#### Data Processing & Background Jobs
- **Satellite Processing:** Python microservice (GDAL, Rasterio, Sentinelsat)
- **Analysis:** Google Earth Engine Python API or FAO SEPAL
- **ML Models:** TensorFlow.js (client-side) or Python backend (server-side)
- **Task Queue:** BullMQ (Redis-based, Node.js native)
- **Cron Jobs:** Next.js API routes with Vercel Cron or node-cron

#### Deployment & Infrastructure
- **Primary Hosting:** Vercel (optimized for Next.js)
- **Alternative:** AWS (EC2 + RDS), Railway, or DigitalOcean
- **CDN:** Vercel Edge Network or Cloudflare
- **Database Hosting:** Supabase, Neon, or AWS RDS
- **Redis Hosting:** Upstash (serverless Redis, free tier available)
- **CI/CD:** GitHub Actions integrated with Vercel

### 6.2 Data Model

#### Core Entities

**Destination**
- id, name, description, category, province, district
- latitude, longitude (Galileo coordinates)
- images (satellite + user photos)
- features (amenities, difficulty level)
- environmental_status (coral health, erosion level)
- created_at, updated_at

**User**
- id, email, name, profile_picture
- interests (array: coastal, inland, geothermal)
- saved_destinations, created_itineraries
- role (tourist, operator, admin)

**Itinerary**
- id, user_id, title, description
- destinations (array), duration_days
- shared (boolean), public_url

**Observation**
- id, user_id, destination_id
- observation_type (erosion, coral_bleaching, new_site)
- description, photos, coordinates
- verified (boolean), verified_by

**SatelliteData**
- id, destination_id, imagery_type (Sentinel-2/3)
- date_captured, cloud_cover, resolution
- file_url, thumbnail_url
- metadata (bands, processing level)

### 6.3 System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    Next.js App (Vercel Edge)                     │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Client Components (Browser)                               │  │
│  │  • Interactive Map (MapLibre + react-map-gl)               │  │
│  │  • Destination Cards, Filters, Search                      │  │
│  │  │  • PWA Service Worker + IndexedDB (Offline)             │  │
│  └────────────────────────┬───────────────────────────────────┘  │
│                           │                                       │
│  ┌────────────────────────▼───────────────────────────────────┐  │
│  │  Server Components & API Routes (Node.js Runtime)          │  │
│  │  • /app/page.tsx (SSR/ISR)                                 │  │
│  │  • /app/api/destinations/* (CRUD operations)               │  │
│  │  • /app/api/auth/[...nextauth] (NextAuth.js)               │  │
│  │  • /app/api/satellite/* (Imagery requests)                 │  │
│  │  • /app/api/observations/* (Community data)                │  │
│  └────────────────────────┬───────────────────────────────────┘  │
└───────────────────────────┼──────────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
┌─────────▼────────┐ ┌──────▼──────┐ ┌───────▼────────┐
│  Prisma ORM      │ │   Redis     │ │  External APIs │
│  (Type-safe DB)  │ │   (Upstash) │ │  • Copernicus  │
│                  │ │             │ │  • Sentinel Hub│
└────────┬─────────┘ └─────────────┘ │  • Galileo GNSS│
         │                            │  • FAO SEPAL   │
┌────────▼──────────────────────────┐ └────────────────┘
│  PostgreSQL + PostGIS             │
│  (Supabase/Neon)                  │
│  • destinations, users, itineraries│
│  • observations, satellite_data   │
└───────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│        Background Processing (Separate Service)    │
│  Python Microservice for Satellite Data           │
│  • GDAL, Rasterio, Sentinelsat                    │
│  • Triggered via BullMQ or API webhooks           │
│  • Stores processed images in S3/Vercel Blob      │
└───────────────────────────────────────────────────┘
```

### 6.4 Next.js App Router Structure

```
pacific-explorer/
├── app/
│   ├── (marketing)/           # Route group for public pages
│   │   ├── page.tsx           # Home/Discovery page (SSR)
│   │   ├── about/page.tsx
│   │   └── layout.tsx
│   ├── (app)/                 # Route group for authenticated app
│   │   ├── dashboard/page.tsx # User dashboard
│   │   ├── destinations/
│   │   │   ├── page.tsx       # List view (ISR)
│   │   │   └── [id]/page.tsx  # Detail page (SSG/ISR)
│   │   ├── itineraries/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── observations/
│   │   │   ├── page.tsx
│   │   │   └── new/page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/route.ts  # NextAuth config
│   │   ├── destinations/
│   │   │   ├── route.ts       # GET, POST /api/destinations
│   │   │   └── [id]/route.ts  # GET, PATCH, DELETE
│   │   ├── satellite/
│   │   │   └── imagery/route.ts  # Fetch Sentinel data
│   │   ├── observations/
│   │   │   └── route.ts
│   │   ├── itineraries/
│   │   │   └── route.ts
│   │   └── cron/
│   │       └── update-satellite/route.ts  # Scheduled updates
│   ├── layout.tsx             # Root layout
│   ├── globals.css            # Tailwind styles
│   └── providers.tsx          # Context providers
├── components/
│   ├── map/
│   │   ├── interactive-map.tsx    # MapLibre component
│   │   ├── destination-marker.tsx
│   │   └── satellite-layer.tsx
│   ├── destinations/
│   │   ├── destination-card.tsx
│   │   ├── destination-filters.tsx
│   │   └── destination-search.tsx
│   ├── itinerary/
│   │   └── itinerary-builder.tsx
│   ├── ui/                    # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ... (other UI primitives)
│   └── layout/
│       ├── header.tsx
│       ├── footer.tsx
│       └── sidebar.tsx
├── lib/
│   ├── prisma.ts              # Prisma client singleton
│   ├── redis.ts               # Redis client
│   ├── auth.ts                # NextAuth config
│   ├── satellite/
│   │   ├── copernicus.ts      # API wrapper for Copernicus
│   │   └── sentinel-hub.ts
│   ├── utils.ts               # Helper functions
│   └── validations/
│       └── schemas.ts         # Zod schemas
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/
│   └── seed.ts                # Initial data seeding
├── public/
│   ├── images/
│   ├── icons/
│   ├── manifest.json          # PWA manifest
│   └── sw.js                  # Service worker
├── types/
│   └── index.ts               # TypeScript type definitions
├── middleware.ts              # Edge middleware (auth, etc.)
├── next.config.js             # Next.js config + PWA
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

### 6.5 Next.js Implementation Examples

#### Example 1: Destination Detail Page (SSG with ISR)

```typescript
// app/destinations/[id]/page.tsx
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import DestinationMap from '@/components/map/destination-map'
import ImageGallery from '@/components/destinations/image-gallery'

// Generate static params for all destinations
export async function generateStaticParams() {
  const destinations = await prisma.destination.findMany({
    select: { id: true }
  })
  return destinations.map((d) => ({ id: d.id }))
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const destination = await prisma.destination.findUnique({
    where: { id: params.id }
  })
  
  return {
    title: `${destination.name} | Pacific Explorer`,
    description: destination.description,
    openGraph: {
      images: [destination.images[0]],
    },
  }
}

// Page component with ISR (revalidate every hour)
export const revalidate = 3600

export default async function DestinationPage({ params }: Props) {
  const destination = await prisma.destination.findUnique({
    where: { id: params.id },
    include: {
      observations: { orderBy: { createdAt: 'desc' }, take: 5 },
      satelliteData: { orderBy: { dateCaptured: 'desc' }, take: 1 }
    }
  })

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-4">{destination.name}</h1>
      
      {/* Satellite imagery map */}
      <DestinationMap 
        coordinates={[destination.longitude, destination.latitude]}
        satelliteImagery={destination.satelliteData[0]?.fileUrl}
      />
      
      {/* Image gallery */}
      <ImageGallery images={destination.images} />
      
      {/* Environmental status */}
      <EnvironmentalStatus data={destination.environmentalStatus} />
      
      {/* Recent observations */}
      <RecentObservations observations={destination.observations} />
    </div>
  )
}
```

#### Example 2: API Route for Creating Observations

```typescript
// app/api/observations/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'

// Validation schema
const observationSchema = z.object({
  destinationId: z.string(),
  observationType: z.enum(['erosion', 'coral_bleaching', 'new_site']),
  description: z.string().min(10),
  photos: z.array(z.string().url()),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number()
  })
})

export async function POST(request: NextRequest) {
  // Check authentication
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Parse and validate request body
    const body = await request.json()
    const data = observationSchema.parse(body)

    // Create observation
    const observation = await prisma.observation.create({
      data: {
        ...data,
        userId: session.user.id,
        verified: false
      }
    })

    // Trigger background job for admin notification
    await queue.add('notify-admins', { observationId: observation.id })

    return NextResponse.json(observation, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

#### Example 3: Server Action for Saving Favorites

```typescript
// app/actions/favorites.ts
'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function toggleFavorite(destinationId: string) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    throw new Error('Not authenticated')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { favorites: true }
  })

  const isFavorited = user.favorites.some(fav => fav.id === destinationId)

  if (isFavorited) {
    // Remove from favorites
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        favorites: {
          disconnect: { id: destinationId }
        }
      }
    })
  } else {
    // Add to favorites
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        favorites: {
          connect: { id: destinationId }
        }
      }
    })
  }

  // Revalidate user's profile page
  revalidatePath('/dashboard')
  
  return { success: true, isFavorited: !isFavorited }
}
```

#### Example 4: Middleware for Auth & Rate Limiting

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Create rate limiter
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export async function middleware(request: NextRequest) {
  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const ip = request.ip ?? '127.0.0.1'
    const { success } = await ratelimit.limit(ip)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }
  }

  // Protected routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const token = await getToken({ req: request })
    
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*']
}
```

#### Example 5: Prisma Schema

```prisma
// prisma/schema.prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [postgis]
}

model User {
  id            String       @id @default(cuid())
  email         String       @unique
  name          String?
  image         String?
  role          Role         @default(TOURIST)
  favorites     Destination[] @relation("Favorites")
  itineraries   Itinerary[]
  observations  Observation[]
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}

model Destination {
  id                    String    @id @default(cuid())
  name                  String
  description           String
  category              Category
  province              String
  district              String?
  latitude              Float
  longitude             Float
  // PostGIS geometry column
  location              Unsupported("geometry(Point, 4326)")
  images                String[]
  satelliteImageUrl     String?
  environmentalStatus   Json?
  features              Json?
  favoritedBy           User[]    @relation("Favorites")
  observations          Observation[]
  satelliteData         SatelliteData[]
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  
  @@index([category, province])
  @@index([location], type: Gist)
}

model Observation {
  id               String   @id @default(cuid())
  user             User     @relation(fields: [userId], references: [id])
  userId           String
  destination      Destination @relation(fields: [destinationId], references: [id])
  destinationId    String
  observationType  ObservationType
  description      String
  photos           String[]
  latitude         Float
  longitude        Float
  verified         Boolean  @default(false)
  verifiedBy       String?
  createdAt        DateTime @default(now())
  
  @@index([destinationId, verified])
}

model SatelliteData {
  id              String      @id @default(cuid())
  destination     Destination @relation(fields: [destinationId], references: [id])
  destinationId   String
  imageryType     String      // Sentinel-2, Sentinel-3
  dateCaptured    DateTime
  cloudCover      Float?
  resolution      String
  fileUrl         String
  thumbnailUrl    String?
  metadata        Json
  createdAt       DateTime    @default(now())
  
  @@index([destinationId, dateCaptured])
}

enum Category {
  COASTAL
  INLAND
  GEOTHERMAL
  CULTURAL
}

enum ObservationType {
  EROSION
  CORAL_BLEACHING
  NEW_SITE
  OTHER
}

enum Role {
  TOURIST
  OPERATOR
  ADMIN
}
```

---

## 7. User Interface Design

### 7.1 Key Screens

#### Home/Discovery Screen
- Interactive map (full screen)
- Category filter chips (Coastal, Inland, Geothermal, Cultural)
- Province selector dropdown
- Search bar at top
- Bottom sheet with featured destinations

#### Destination Detail Screen
- Image carousel (satellite + user photos)
- Title, description, category tags
- Environmental indicators (coral health, erosion status)
- "Get Directions" CTA button
- "Save to Itinerary" button
- User reviews and ratings
- Recent observations feed

#### Itinerary Builder Screen
- List of saved destinations with drag-to-reorder
- Map view showing route
- Duration calculator
- Share itinerary button
- Add notes for each day

#### Profile & Settings Screen
- User info and preferences
- Saved destinations
- Created itineraries
- Observation history
- Settings (language, offline maps, notifications)

#### Community Observation Form
- Photo upload (with EXIF GPS data)
- Observation type selector
- Description text area
- Location map picker
- Submit for verification

### 7.2 Design Principles
- **Mobile-first:** Optimize for smartphone screens
- **Visual storytelling:** Use satellite imagery prominently
- **Clear CTAs:** Obvious next actions at every step
- **Progressive disclosure:** Show details on demand
- **Offline-friendly:** Clear indicators for offline/online status

---

## 8. Data Sources & APIs

### 8.1 Copernicus Services

#### Sentinel-2 (Optical Imagery)
- **Purpose:** High-resolution destination visuals
- **Resolution:** 10m-20m bands
- **Frequency:** Every 5 days
- **API:** Copernicus Open Access Hub, Sentinel Hub
- **Processing:** Cloud masking, color correction, compositing

#### Sentinel-3 (Ocean Monitoring)
- **Purpose:** Coral reef health, water quality
- **Bands:** Ocean color (chlorophyll-a)
- **Resolution:** 300m
- **Processing:** Chlorophyll concentration algorithms

### 8.2 Galileo GNSS
- **Purpose:** Precise positioning and navigation
- **Accuracy:** Sub-meter with correction services
- **Integration:** Native device GPS with Galileo constellation

### 8.3 IRIS² (Future)
- **Purpose:** Connectivity in remote islands
- **Use Case:** Data sync, emergency alerts
- **Status:** Planned integration when available

### 8.4 FAO SEPAL & Collect Earth
- **Purpose:** Community-driven satellite analysis
- **Integration:** Export validated observations to platform
- **Workflow:** Users validate erosion/coral data in Collect Earth

---

## 9. Implementation Roadmap

### Phase 1: MVP (Months 1-3)
**Goal:** Core discovery and mapping functionality

**Features:**
- Interactive map with PNG provinces
- Manual input of 50+ key attractions (10 per province)
- Basic Sentinel-2 imagery integration
- Category filtering (coastal, inland, geothermal)
- Destination detail pages with descriptions
- Simple search functionality
- Mobile-responsive web app with PWA support

**Tech Stack:**
- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Mapping:** MapLibre GL JS + react-map-gl
- **Database:** PostgreSQL + PostGIS (Supabase free tier)
- **ORM:** Prisma
- **Deployment:** Vercel (free tier)
- **Storage:** Vercel Blob (satellite imagery cache)

**Project Setup:**
```bash
# Initialize Next.js project
npx create-next-app@latest pacific-explorer --typescript --tailwind --app
cd pacific-explorer

# Install dependencies
npm install @prisma/client @supabase/supabase-js
npm install maplibre-gl react-map-gl
npm install @radix-ui/react-* class-variance-authority clsx tailwind-merge
npm install zod react-hook-form @hookform/resolvers
npm install next-pwa

# Install dev dependencies
npm install -D prisma @types/maplibre-gl

# Initialize Prisma
npx prisma init

# Set up database schema (see section 6.2)
# Run migrations
npx prisma migrate dev --name init
npx prisma generate

# Seed initial data (PNG provinces, sample attractions)
npx prisma db seed
```

**Key Development Tasks:**
1. Set up Next.js project with TypeScript + Tailwind
2. Configure Prisma with PostGIS schema
3. Create MapLibre map component with PNG basemap
4. Build destination CRUD API routes
5. Implement category filtering system
6. Design destination card and detail page components
7. Add search functionality with fuzzy matching
8. Integrate basic Sentinel-2 imagery via Sentinel Hub API
9. Configure PWA with offline map tiles caching
10. Deploy to Vercel with environment variables

**Success Criteria:**
- 50+ destinations seeded in database
- Map loads in <2s on 4G
- 100+ beta testers recruited
- Core user journey functional (discover → view → save)

### Phase 2: Personalization & Navigation (Months 4-6)
**Goal:** Add trip planning and navigation features

**Features:**
- User accounts and authentication (NextAuth.js)
- Itinerary builder and trip planner
- Galileo GNSS navigation integration
- Save/favorite destinations (user profiles)
- Offline map downloads (PWA enhancements)
- Basic AI recommendation engine

**Next.js Enhancements:**
- Implement NextAuth.js with OAuth providers (Google, Facebook)
- Add Server Actions for mutations (save favorites, create itineraries)
- Use Incremental Static Regeneration (ISR) for destination pages
- Implement optimistic UI updates with React transitions
- Add real-time features with Pusher or WebSockets
- Set up Redis caching for frequently accessed data

**New API Routes:**
```typescript
// app/api/itineraries/route.ts
// app/api/users/favorites/route.ts
// app/api/recommendations/route.ts
// app/api/navigation/route/route.ts
```

**Key Development Tasks:**
1. Configure NextAuth.js with credentials + OAuth
2. Build itinerary builder with drag-and-drop (dnd-kit)
3. Implement user profile system with Prisma relations
4. Add GPS navigation with browser Geolocation API
5. Create recommendation algorithm (collaborative filtering)
6. Expand database to 200+ destinations
7. Add user reviews and ratings system
8. Implement Redis caching layer
9. Optimize images with Next.js Image component
10. Add offline map region downloads

**Success Criteria:**
- 1,000+ registered users
- 100+ itineraries created
- 70% user retention after 1 week
- <500ms API response times (cached)

### Phase 3: Community & Monitoring (Months 7-9)
**Goal:** Enable community contributions and environmental tracking

**Features:**
- Community observation submission
- Photo upload with geo-tagging (Cloudinary integration)
- Coastal erosion monitoring dashboard
- Coral bleaching detection
- Time-series satellite analysis
- Admin moderation tools
- Integration with FAO SEPAL/Collect Earth

**Next.js Architecture Updates:**
- Add server-side image processing with Sharp
- Implement file uploads with Next.js API routes + Cloudinary
- Create admin dashboard with role-based access (NextAuth.js roles)
- Build Python microservice for satellite processing
- Set up BullMQ for background job processing
- Add WebSocket support for real-time notifications
- Implement Server-Sent Events (SSE) for live updates

**Background Processing:**
```typescript
// lib/queue/satellite-processor.ts (BullMQ)
// Triggers Python microservice for heavy satellite analysis
// Processes imagery, detects changes, stores results
```

**New Features:**
- Native mobile apps (Capacitor.js wrapping Next.js PWA)
- Push notifications (Firebase Cloud Messaging)
- Advanced geospatial filters (PostGIS queries)
- Time-series comparison tool (before/after satellite imagery)

**Key Development Tasks:**
1. Build observation submission form with photo upload
2. Integrate Cloudinary for image management + CDN
3. Create admin dashboard for moderation
4. Deploy Python satellite processing microservice
5. Implement BullMQ job queue for async tasks
6. Add coral bleaching detection algorithm
7. Build coastal erosion tracking visualization
8. Create report generation system (PDF export)
9. Set up real-time notifications
10. Package as Capacitor app for app stores

**Success Criteria:**
- 100+ community observations submitted
- 10+ validated coastal monitoring reports
- 5,000+ active users
- Admin dashboard fully functional

### Phase 4: Scale & Sustainability (Months 10-12)
**Goal:** Regional expansion and monetization

**Features:**
- Expand to other Pacific Island countries (Fiji, Vanuatu, Solomon Islands)
- Tourism operator dashboard
- Premium features (ad-free, advanced analytics)
- IRIS² connectivity integration
- Multi-language support (i18n)
- Public API for third-party integrations

**Next.js Scale Optimizations:**
- Implement Edge Runtime for global performance
- Add CDN caching strategies (Vercel Edge, Cloudflare)
- Use Next.js Middleware for geolocation-based routing
- Implement database connection pooling (PgBouncer)
- Add rate limiting with Upstash Redis
- Set up multi-region database replicas
- Implement subscription payments (Stripe integration)

**Internationalization:**
```typescript
// next-intl or next-i18next
// Languages: English, Tok Pisin, Hiri Motu, Fijian, Bislama
```

**API Platform:**
```typescript
// app/api/v1/public/* - Public REST API
// Rate-limited, API key authentication
// Documentation with OpenAPI/Swagger
```

**Key Development Tasks:**
1. Add multi-region support (database + hosting)
2. Build operator onboarding flow
3. Implement Stripe subscriptions for premium tier
4. Create public API with documentation
5. Add internationalization support
6. Build analytics dashboard (user insights)
7. Integrate IRIS² satellite connectivity
8. Create partner/operator portal
9. Add revenue tracking and reporting
10. Implement A/B testing framework

**Partnerships:**
- Tourism PNG
- Provincial tourism boards
- Conservation organizations (WWF, TNC)
- Travel agencies and booking platforms

**Success Criteria:**
- 10,000+ users across Pacific region
- 50+ tourism operators onboarded
- Sustainable revenue model ($5k+ MRR)
- 99.9% uptime with global CDN

---

## 10. Open Source Strategy

### 10.1 Licensing
- **Code:** MIT or Apache 2.0 License
- **Data:** CC BY 4.0 (Creative Commons)
- **Documentation:** CC BY-SA 4.0

### 10.2 Repository Structure
```
pacific-explorer/
├── app/                       # Next.js App Router
│   ├── (marketing)/           # Public pages
│   ├── (app)/                 # Authenticated pages
│   ├── api/                   # API routes
│   ├── layout.tsx
│   └── page.tsx
├── components/                # React components
│   ├── map/
│   ├── destinations/
│   ├── itinerary/
│   ├── ui/                    # shadcn/ui
│   └── layout/
├── lib/                       # Utility functions
│   ├── prisma.ts
│   ├── redis.ts
│   ├── auth.ts
│   ├── satellite/
│   └── validations/
├── prisma/                    # Database schema
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/                    # Static assets
│   ├── images/
│   ├── icons/
│   └── manifest.json
├── types/                     # TypeScript types
├── data-processing/           # Python microservice
│   ├── satellite/             # GDAL, Rasterio scripts
│   ├── ml/                    # Detection models
│   └── requirements.txt
├── docs/                      # Documentation
│   ├── setup.md
│   ├── api.md
│   └── contributing.md
├── scripts/                   # Automation scripts
│   ├── seed-destinations.ts
│   └── migrate-images.ts
├── tests/                     # Test suites
│   ├── e2e/                   # Playwright tests
│   └── unit/                  # Jest/Vitest tests
├── .github/
│   └── workflows/             # CI/CD
│       ├── deploy.yml
│       └── test.yml
├── next.config.js             # Next.js config
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

### 10.3 Community Governance
- **GitHub:** Open issues, pull requests, discussions
- **Communication:** Discord or Slack for contributors
- **Documentation:** Wiki with setup guides, API docs
- **Code of Conduct:** Contributor Covenant
- **Contribution Guide:** Clear PR guidelines

### 10.4 Sustainability
- **Hosting:** Vercel free tier (generous limits) + Supabase free tier
- **Data:** Free Copernicus data via Open Access Hub
- **Volunteers:** Open source contributors via GitHub
- **Grants:** Apply for conservation/tourism tech grants (AWS Activate, Stripe Climate)
- **Future Revenue:**
  - Freemium model: Basic free, premium features for operators ($29/mo)
  - API access tiers for travel platforms
  - Sponsored destinations from tourism boards
  - Enterprise plans for conservation organizations

**Cost Optimization with Next.js:**
- **Edge Runtime:** Reduce server costs with edge functions
- **ISR/SSG:** Cache pages to minimize database queries
- **Image Optimization:** Next.js automatic image optimization reduces bandwidth
- **Vercel Analytics:** Built-in performance monitoring (free tier)
- **Upstash Redis:** Serverless Redis with generous free tier

---

## 11. Risk Assessment & Mitigation

### Risk 1: Limited Satellite Data Coverage
**Risk Level:** Medium
**Impact:** Cloud cover may obscure destinations in tropical regions
**Mitigation:**
- Use multi-date composites to create cloud-free imagery
- Combine Sentinel-1 (radar) with Sentinel-2 (optical)
- Set expectations with users about data limitations

### Risk 2: Low User Adoption
**Risk Level:** High
**Impact:** Platform unused, no community contributions
**Mitigation:**
- Partner with Tourism PNG for promotion
- Engage local tourism operators early
- Run social media campaigns showcasing hidden gems
- Gamify with badges for contributions

### Risk 3: Data Quality & Accuracy
**Risk Level:** Medium
**Impact:** Incorrect coordinates, outdated information
**Mitigation:**
- Implement community validation workflow
- Partner with local guides for ground truth
- Regular satellite data updates
- User reporting of errors

### Risk 4: Technical Complexity
**Risk Level:** Medium
**Impact:** Satellite processing, PostGIS setup challenging
**Mitigation:**
- Start with pre-processed imagery (Sentinel Hub)
- Use managed database services
- Leverage FAO SEPAL for heavy processing
- Strong documentation and tutorials

### Risk 5: Connectivity in Remote Areas
**Risk Level:** High
**Impact:** App unusable in areas with poor internet
**Mitigation:**
- Offline-first architecture with service workers
- Downloadable map regions
- Lightweight data formats (vector tiles)
- IRIS² integration when available

### Risk 6: Funding & Sustainability
**Risk Level:** High
**Impact:** Unable to maintain platform long-term
**Mitigation:**
- Apply for Cassini Hackathon prizes
- Seek grants from conservation organizations
- Partnerships with tourism boards
- Freemium model for operators
- Open source to reduce costs

---

## 12. Success Metrics & KPIs

### User Engagement
- Daily Active Users (DAU) / Monthly Active Users (MAU)
- Average session duration
- Destinations viewed per session
- Itineraries created per user
- Return rate (7-day, 30-day)

### Content Metrics
- Total destinations in database
- Coverage per province (% with 10+ attractions)
- Community observations submitted
- Photo uploads by users
- User ratings/reviews count

### Technical Performance
- Page load time (p50, p95)
- API response time
- Error rate
- Uptime percentage
- Offline success rate

### Impact Metrics
- Users reporting increased environmental awareness
- Tourism operators using platform
- Coastal monitoring reports generated
- Verified coral bleaching detections
- Partnership agreements signed

---

## 13. Compliance & Legal

### Data Privacy
- GDPR-ready architecture (consent, data portability)
- User data deletion on request
- Clear privacy policy
- Minimal data collection

### Intellectual Property
- Open source licensing for code
- User-generated content rights (CC BY)
- Proper attribution for Copernicus data

### Terms of Service
- User conduct guidelines
- Disclaimer for navigation accuracy
- Environmental data accuracy limitations

---

## 14. Support & Maintenance

### Documentation
- User guide (how to use app)
- Operator guide (how to add attractions)
- Developer guide (setup, contribution)
- API documentation

### Support Channels
- FAQ page
- GitHub issues for bugs
- Email support for operators
- Community Discord/Slack

### Maintenance Plan
- Weekly satellite data updates
- Monthly feature releases
- Quarterly security audits
- Continuous monitoring and alerting

---

## 15. Conclusion

Pacific Explorer addresses the "Beyond Horizons" challenge by creating an innovative, satellite-powered tourism platform tailored for Papua New Guinea and the Pacific region. By leveraging Copernicus imagery, Galileo navigation, and community contributions, the platform will:

✅ Enable discovery of hidden, authentic destinations
✅ Promote sustainable, eco-conscious travel
✅ Support local communities and tourism operators
✅ Provide environmental monitoring for coastal areas
✅ Create personalized, immersive travel experiences

The phased roadmap ensures a viable MVP while building toward a comprehensive, sustainable platform. The open-source approach keeps costs low while fostering community engagement and transparency.

**Next Steps:**
1. Validate PRD with team and stakeholders
2. Finalize tech stack and architecture decisions
3. Set up development environment and repositories
4. Begin Phase 1 MVP development
5. Recruit beta testers from tourism community

---

## Appendix

### A. Glossary
- **Copernicus:** EU Earth observation program
- **Sentinel-2:** Optical satellite for land monitoring
- **Sentinel-3:** Ocean and climate monitoring satellite
- **Galileo:** EU global navigation satellite system
- **IRIS²:** EU secure connectivity satellite constellation (future)
- **PostGIS:** Spatial database extension for PostgreSQL
- **PWA:** Progressive Web App
- **SEPAL:** FAO's satellite analysis platform
- **Collect Earth:** Community-based satellite validation tool

### B. References
- Cassini Hackathon Challenge Brief
- Copernicus Open Access Hub: https://scihub.copernicus.eu/
- Sentinel Hub: https://www.sentinel-hub.com/
- FAO SEPAL: https://sepal.io/
- MapLibre: https://maplibre.org/
- Tourism PNG: https://www.papuanewguinea.travel/

### C. Team Context
Based on team ideas from Rua Puka (coastal monitoring expertise), Den Einstein (tourism app concept), and Camilla Y (provincial attraction categorization).

---

**Document Status:** Draft v1.0
**Last Updated:** October 22, 2025
**Owner:** Pacific Explorer Team
**Reviewers:** [To be assigned]
