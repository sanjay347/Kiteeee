# AI Portfolio Analyzer Frontend

A dark-themed React dashboard (Vite + TailwindCSS) that connects to the FastAPI backend to authenticate via Zerodha Kite, sync holdings, and show AI-generated insights.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure the backend URL:

   ```bash
   cp .env.example .env
   # Edit .env and set VITE_API_URL to your backend origin (e.g. https://ai-portfolio-backend.onrender.com)
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

   The app runs on [http://localhost:5173](http://localhost:5173) by default.

## Login flow

- Use the **Login with Kite** button to retrieve the Zerodha authorization URL from the backend.
- Complete the login in the new tab. The backend callback will display your registered email.
- Paste that email into the dashboard controls to sync holdings (`/portfolio`) and generate analysis (`/analysis`).

## Deployment notes

- Set `VITE_API_URL` to the publicly accessible backend URL (for example, a Render deployment).
- Ensure the backend allows the deployed frontend origin through CORS (`FRONTEND_URL`).
- Build for production using `npm run build` and deploy the `dist/` directory to your preferred static hosting provider.
