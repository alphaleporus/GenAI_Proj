# ChainReaction 🚀

**Autonomous Supply Chain Financial Agent**

Enterprise SaaS platform that detects delays, calculates penalties, and proposes financial arbitrage solutions in
real-time using **real road routing** and **dark mode optimized maps**.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Pages

- **`/`** - Landing page with features and 24h auto-updating metrics
- **`/dashboard`** - Live map with trucks, real-time events, and arbitrage alerts

## Tech Stack

- **Next.js 14** (App Router with dynamic imports)
- **Tailwind CSS 4** (Dark mode optimized)
- **Framer Motion 12** (Smooth animations + confetti)
- **React-Leaflet 5.0** + OpenStreetMap (Inverted dark tiles)
- **OSRM API** - Real road routing (No API key required!)
- **Lucide Icons** + **canvas-confetti**
- **TypeScript 5** (Fully typed)

## Features

### Core Functionality

✨ **Real-time supply chain visibility** - Track 3 trucks across India  
💰 **Financial arbitrage detection** - $1,700 savings opportunity  
🗺️ **Live map with OSRM routing** - Real road routes, not straight lines  
🤖 **Autonomous agent actions** - 12-second scripted demo scenario

### Map Features

🌙 **Dark mode map tiles** - Inverted OSM tiles with hue-rotate for cohesive dark theme  
🎯 **Centering button** - Integrated control to recenter map on all trucks  
📍 **Smart zoom bounds** - Prevents excessive zoom-out and multiple world copies  
🚛 **4 truck statuses** - On-time (🟢), Delayed (🟡), Critical (🔴), Resolved (💜)  
🗺️ **Auto-zoom/center** - Dynamically fits all trucks and routes in view

### UI/UX Features

🎊 **Confetti animation** - 2-second celebration on arbitrage execution  
📊 **Side-by-side layout** - Map and Agent Stream embedded (not floating)  
🔄 **Rounded edges** - Professional glassmorphism throughout  
⚡ **Smooth animations** - Spring physics on all transitions  
🌿 **Carbon credit tracking** - Eco-route toggle with dashed lines

## Architecture

### Real-Time Simulation (12 seconds)

```
T+0s:  🚀 Agent initialized, 3 trucks loaded with OSRM routes
T+2s:  📡 GPS sensors operational
T+5s:  🟡 TRK-402 velocity drops to 0 km/h (Delayed)
T+8s:  🔴 TRK-402 status → CRITICAL (SLA threshold exceeded)
T+12s: 💎 Arbitrage modal appears ($1,700 net savings!)
       User clicks "Execute Fix" → 🎉 Confetti → 💜 Resolved
```

### OSRM Integration

**3 Real Routes Fetched:**

- **TRK-402**: Pune (73.86, 18.52) → Mumbai (72.88, 19.08) | Driver: Priya Sharma
- **TRK-301**: Bangalore (77.59, 12.97) → Delhi (77.21, 28.61) | Driver: Rajesh Kumar
- **TRK-205**: Mumbai (72.88, 19.08) → Kolkata (88.36, 22.57) | Driver: Anita Desai

Routes load asynchronously on mount with **automatic fallback** if OSRM is unavailable.

### Dark Mode Map Implementation

```css
/* Tiles inverted for dark theme */
.leaflet-tile-pane {
  filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
}

/* Markers counter-inverted to keep original colors */
.leaflet-marker-pane {
  filter: invert(100%) hue-rotate(180deg);
}
```

Result: Dark navy map with colorful truck markers (🟢🟡🔴💜)

### Component Structure

```
app/
├── page.tsx                    # Landing page (glassmorphism cards)
├── dashboard/page.tsx          # Main dashboard (side-by-side layout)
│
components/
├── SupplyChainMap.tsx          # Leaflet map (dark mode, OSRM routes, centering button)
├── landing/FeatureCards.tsx    # Auto-updating 24h metrics
├── dashboard/
│   ├── AgentOverlay.tsx        # Right sidebar (permanently visible)
│   └── FinancialModal.tsx      # Arbitrage card (with confetti)
│
lib/
├── hooks/useSupplyChainStream.ts  # Simulation engine + OSRM integration
├── utils/routing.ts               # OSRM API wrapper
└── types/index.ts                 # TypeScript definitions (4 truck statuses)
```

## Map Controls

### Zoom Bounds

- **Min Zoom**: 3 (prevents excessive zoom-out)
- **Max Zoom**: 18 (street-level detail)
- **Max Bounds**: [-85, -180] to [85, 180] (world coordinates)
- **Viscosity**: 1.0 (rigid boundaries)
- **No Wrap**: Single world copy, no horizontal repetition

### Centering Button (⊕)

- Integrated below zoom controls (+/-)
- Recenters map to fit all trucks and routes
- 0.5s smooth animation
- Falls back to India center if no trucks

## Status Lifecycle

```
🟢 ON-TIME   → Normal operations, 65+ km/h
🟡 DELAYED   → Velocity drops, minor issue
🔴 CRITICAL  → SLA breach, penalty incoming
💜 RESOLVED  → Solution executed, relief dispatched
```

## Confetti Effect

Triggered on "Execute 1-Click Fix":

- **Duration**: 2 seconds
- **Particles**: 50 per burst (decreasing)
- **Launch**: Two sides (left + right)
- **Z-index**: 10002 (above modal)

## Performance

- **Route caching**: OSRM responses stored in state
- **Rate limiting**: 300ms delay between truck route requests
- **Lazy loading**: Map loaded with `dynamic(() => import(), { ssr: false })`
- **GPU acceleration**: `will-change: transform` on tiles

## No API Keys Required

- **OpenStreetMap**: Free tile service
- **OSRM**: Public routing API (router.project-osrm.org)
- **No auth**: Fully functional demo without credentials

## Deployment

```bash
# Production build
npm run build
npm start

# Vercel (recommended)
vercel deploy

# Docker
docker build -t chainreaction .
docker run -p 3000:3000 chainreaction
```

## Browser Support

✅ Chrome/Edge (Recommended)  
✅ Firefox  
✅ Safari  
⚠️ Mobile (Works but optimized for desktop)

## Demo Flow

1. Visit `/dashboard`
2. Watch 3 trucks load with real OSRM routes (~2 seconds)
3. Observe TRK-402 progress: Green → Yellow → Red (12 seconds)
4. Modal appears with $1,700 savings opportunity
5. Click "Execute Fix" → Confetti explosion 🎉
6. Truck turns purple, problem resolved!

---

**Built for hackathons. Production-ready architecture. No API keys required.** 🚀

**Contributors**: Built with ❤️ using Next.js 14, TypeScript, and OpenStreetMap

