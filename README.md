# i3d Construction Estimator v4.0

**i3d Studio, Coimbatore** — Construction Estimator Platform

A comprehensive construction project management tool built for architectural practice, covering the full lifecycle from agreement to payment tracking.

## Features

- **Agreement & Specs** — Standard contract template with 19 clauses, fillable fields, material price limits, projected cost calculator
- **Detailed Estimate** — Stage-wise BOQ with auto-fill from library, escalation clause, library reference tracking
- **Abstract Estimate** — Quick material calculator using per-SFT ratios across 4 building types, editable material rates
- **Payment Schedule** — Editable stages with amounts, weeks, status tracking, cumulative %, and Smart Lock for overdue payments
- **Project Schedule** — Editable Gantt chart with groups/tasks, duration, predecessors, auto-scaling bars
- **Library & Reference** — 53+ work items with editable rates, SNGC Gateway reference BOQ, 16 trade specifications

## Tech Stack

- React 18 + Vite
- Single-file component (no external CSS)
- Deployed via GitHub Pages

## Setup

```bash
npm install
npm run dev       # Local development at localhost:5173
npm run build     # Production build to /dist
npm run deploy    # Deploy to GitHub Pages
```

## Deployment

1. Push to GitHub
2. Run `npm run deploy` — this builds and publishes to `gh-pages` branch
3. In GitHub repo Settings → Pages → Source: select `gh-pages` branch

Your app will be live at `https://<username>.github.io/i3d-estimator/`

---

*Inspirational Architect — i3d Studio, Coimbatore*
