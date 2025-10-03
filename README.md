# AI Portfolio Analyzer

Full-stack project that connects Zerodha Kite Connect with an AI-inspired analytics dashboard.

## Structure

- `backend/` – FastAPI + SQLAlchemy + PostgreSQL service integrating Kite Connect.
- `frontend/` – React (Vite + TailwindCSS + Recharts) dashboard that consumes the backend APIs.

Each folder contains its own README with setup instructions and environment variable templates.

## Quick start

1. Configure and start the backend (FastAPI) as described in `backend/README.md`.
2. Configure and run the frontend (React) following `frontend/README.md`.
3. Ensure the backend `FRONTEND_URL` matches the URL where the frontend is served, and the frontend `VITE_API_URL` points to the backend origin.

## Key features

- Zerodha Kite Connect OAuth flow using official `kiteconnect` SDK.
- Live portfolio synchronization persisted to PostgreSQL.
- AI-inspired analytics including PnL summaries, concentration metrics, and sector allocation visualization.
- Responsive, dark-themed dashboard with loading and error states.
