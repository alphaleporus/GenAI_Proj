Ideal Project Output Description

1. Landing Page (localhost:3000/)

Visual: Deep Navy (#020617). Glowing teal accents.

Hero: Large typography. "Launch Platform" button acts as the entry point.

Bento Grid:

Card 1: "System Update: 14h 20m" (Countdown).

Card 2: "Money Saved: $12,450" (Green).

2. Authentication Flow

User Action: Click "Launch Platform".

Screen: Redirects to /login.

Interaction: User clicks "Sign In".

Result: Smooth transition to /dashboard.

3. The Dashboard (Command Center)

Map: Full-screen OpenStreetMap with Inverted Dark Tiles and OSRM routing.

Markers:

3 Green Trucks (Moving smoothly with real routes from OSRM API).

1 Red Truck (Stopped).

Sidebar:

Log: [14:02:05] ALERT: Truck-402 Critical Delay.

The Modal (The "Win"):

Trigger: Opens automatically when Truck-402 turns Red.

Content:

"Contract Penalty: $2,500"

"Spot Market Rate: $800"

"Net Savings: $1,700"

Button: "Auto-Book Relief Truck".

After Click: Truck turns Purple. Confetti/Glow effect with a 2-second particle burst.

4. Customer Tracking (/track/ORD-402)

Purpose: Public view for a single client.

Visual: Simplified Map centered ONLY on Truck-402.

Timeline: "Order Placed" -> "In Transit" -> "Delayed" -> "Relief Truck Booked".

5. Performance Requirements

Latency: Map updates <500ms.

Responsiveness: Sidebar collapses on mobile. Map remains full screen.

Theme: No white text on white backgrounds. Strict Dark Mode enforcement with dark map tiles.

