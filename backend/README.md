# AI Portfolio Analyzer Backend

This FastAPI backend integrates with the Zerodha Kite Connect API to fetch live holdings, store them in PostgreSQL via SQLAlchemy, and generate AI-inspired insights for a portfolio dashboard.

## Prerequisites

- Python 3.11+
- Docker & Docker Compose (for running PostgreSQL locally)
- Zerodha Kite Connect developer account with an approved app

## 1. Configure environment variables

Copy `.env.example` to `.env` and update the values with your environment:

```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `FRONTEND_URL` | The URL of the frontend allowed to access the API (used for CORS). |
| `KITE_API_KEY` / `KITE_API_SECRET` | Credentials from your Kite Connect app. |
| `KITE_REDIRECT_URL` | Redirect URL registered with Kite Connect that points to `/auth/kite/callback`. |
| `DB_*` | PostgreSQL connection parameters. |
| `JWT_SECRET` | Reserved for future token signing use. |

## 2. Run PostgreSQL with Docker

```bash
docker run \
  --name portfolio-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=portfolio \
  -p 5432:5432 \
  -d postgres:16
```

Alternatively, use Docker Compose:

```yaml
services:
  db:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: portfolio
    ports:
      - "5432:5432"
```

## 3. Install dependencies

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 4. Start the FastAPI server

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`. Swagger docs are available at `/docs` once the server is running.

## 5. Configure your Kite Connect app

1. Visit [Kite Developer Console](https://developers.kite.trade/apps) and create a new app.
2. Set the redirect URL to match `KITE_REDIRECT_URL` from your `.env` file.
3. Note the API key and secret, then update `.env` accordingly.
4. After approving the app, use the frontend to start the login flow. Zerodha will redirect back to `/auth/kite/callback` with a `request_token`.

## 6. Authentication flow

1. `GET /auth/kite/login` — returns the Kite login URL.
2. User completes Zerodha login → redirected to backend callback.
3. `GET /auth/kite/callback` — backend exchanges the `request_token` for an access token, stores it against the user email, and returns success.
4. Subsequent API calls must include the `X-User-Email` header to identify the authenticated user.

## 7. Portfolio and analysis APIs

- `GET /portfolio` — fetches live holdings from Kite, persists them, and returns totals.
- `GET /analysis` — calculates portfolio insights (concentration, sector mix, AI-style recommendations) and caches them in the database.

Make sure the PostgreSQL instance is running and your Kite credentials are valid before invoking these endpoints.
