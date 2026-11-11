# BinBuzz (Bin Buzz) — AI Facility Hygiene & Cleanliness Intelligence OS
> **Cogno Valley Labs × Christ University Internships**  
> **Track E: Facility Hygiene and Cleanliness**

---

## 🌟 Executive Overview
**Bin Buzz** is a modern, high-density operations center and computer vision intelligence platform designed to eliminate overflowing waste bins and unattended litter across large-scale facilities (campuses, food courts, transit hubs, and commercial complexes).

### Core Features & Track E Deliverables
1. **Real-Time Vision Stream HUD**:
   - Live bounding boxes for `overflowing_bin`, `litter_debris`, and `staged_waste_bag`.
   - Real-time confidence scores and dwell persistence timers.
   - Configurable maintenance trigger threshold (30s – 300s).
2. **Facility Cleanliness Index (FCI)**:
   - Dynamic 0–100% cleanliness score calculated from litter density and dwell duration:
     $$\text{Cleanliness Index} = 100 - (\rho \cdot \tau)$$
   - Color-coded telemetry: Optimal (>85% Emerald), Warning (70–84% Amber), Critical (<70% Crimson).
3. **Zone Scorecards & Floorplan Telemetry**:
   - Real-time health metrics across zones (Food Court, Main Atrium, Restroom Corridor, Academic Quad).
   - Instant camera routing and telemetry status.
4. **Interactive Visual Verification (Before/After Diff Slider)**:
   - Draggable dual-image comparison comparing incident detection frame with post-cleanup verification.
   - Automated index score recovery audit.
5. **Housekeeping Dispatch Tracker**:
   - Automated ticket lifecycle: `OPEN` $\rightarrow$ `ASSIGNED` $\rightarrow$ `CLEANED`.
   - Real-time SLA countdown timers and 1-click staff dispatch workflow.
6. **Technical Review Panel Demo Mode**:
   - 1-Click automated walkthrough designed specifically for the Cogno Valley evaluation panel:
     *Litter detected $\rightarrow$ dwell timer breaches threshold $\rightarrow$ ticket opens $\rightarrow$ staff dispatched $\rightarrow$ before/after comparison verifies resolution $\rightarrow$ cleanliness index rebounds.*

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v26)
- npm or pnpm

### Running Locally
```bash
# Clone the repository
git clone https://github.com/yashcoder2305/cognovalley.git
cd cognovalley

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 🛠 Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Tactical Dark Command Center Theme)
- **Icons**: Lucide React
- **Animations**: Framer Motion & CSS Scanlines

