# i3d Construction Management System v3.0

**i3d Studio, Coimbatore** — Inspirational Architect

A 17-module construction management platform built from 25+ years of architectural practice.

## Modules

### Tier 1 — Estimation & Agreement
- **Dashboard** — New/Open project, project list with auto-IDs (I3D-2026-001)
- **Project Overview** — Area, floors, type, live cost calculations
- **Soil & Foundation** — Soil type, SBC, foundation design parameters
- **Foundation / Superstructure / Finishing BOQ** — Stage-wise estimation with library autocomplete
- **Material Consumption** — Auto-calculated with editable rates and thumb-rule warnings
- **Cost Summary** — Labour + Contractor Profit + Lead & Lift = Total, Cost per SFT
- **Agreement Generator** — Full contract with 19 clauses, parties, schedule, financial terms
- **Payment Schedule** — Editable stages with Smart Lock for overdue payments

### Tier 2 — Monitoring & Quality
- **Construction Monitoring** — 14 stages from Excavation to Handover
- **Cube Test Register** — 7d/14d/21d compressive strength tracking
- **Architect Checklist** — 12 verification items before estimate finalization
- **AI Review** — Project analysis with consumption, cost, and compliance checks

### Tier 3 — Scheduling & Procurement
- **Schedule / CPM** — Critical Path Method with forward/backward pass, Gantt chart
- **Procurement Tracker** — Ordered vs received vs consumed, over-purchase detection
- **Rate Revision Database** — Material rate change history with % impact
- **Photo Records** — Stage-wise photo log with GPS and architect approval

## Setup

```bash
npm install
npm run dev       # localhost:5173
npm run build     # Production build
npm run deploy    # Deploy to GitHub Pages
```

## Tech

React 18 + Vite. Single-file architecture. No external CSS. Export PDF via HTML download.

---

*i3d Studio — Interactive 3 Dimensions — Coimbatore*
