# ChengLang Homepage

This repository contains a static academic homepage plus a lightweight Node server that records visitor geolocation events and exposes a private analytics dashboard.

## What changed

- `index.html`: homepage UI plus a new `Visitors` analytics section
- `assets/visitor-analytics.js`: client-side logging and dashboard rendering
- `server.js`: static file server, visit logger, geolocation lookup, SQLite storage, analytics API

## Local run

```powershell
cd <your-repo-directory>
node server.js
```

Open `http://localhost:3000`.

## Environment variables

Copy `.env.example` and set values in your hosting platform:

- `ANALYTICS_ADMIN_TOKEN`: protects the analytics dashboard outside localhost
- `VISITOR_DEDUPE_MINUTES`: dedupe repeated visits from the same browser/IP pair
- `GEO_LOOKUP_TIMEOUT_MS`: per-provider timeout for IP geolocation lookups
- `PORT`: HTTP port
- `HOST`: bind host, use `0.0.0.0` in containers
- `DATA_DIR`: folder where `visitor-analytics.db` is stored

## GitHub deployment

This project is ready to deploy from GitHub, but not to GitHub Pages.

GitHub Pages only serves static files, while this analytics feature requires:

- a backend endpoint to receive visit events
- a database to persist visit history
- protected admin access for analytics data

## Recommended deployment: Render

The repo includes `render.yaml` and `Dockerfile`, so you can deploy directly from GitHub:

1. Push this repository to GitHub.
2. In Render, create a new Blueprint or Web Service from that GitHub repo.
3. Render will read `render.yaml`, build the Docker image, attach a persistent disk at `/data`, and generate `ANALYTICS_ADMIN_TOKEN`.
4. After deploy, open your site URL and enter the generated analytics token in the dashboard's token box.

Important:

- Visitor history is stored in SQLite under `DATA_DIR`.
- On Render, persistence depends on the attached disk defined in `render.yaml`.
- If you deploy to another platform, mount a persistent volume and point `DATA_DIR` to it.

## Docker deployment

```bash
docker build -t chenglang-homepage .
docker run -p 3000:3000 \
  -e ANALYTICS_ADMIN_TOKEN=your-token \
  -e DATA_DIR=/data \
  -v homepage-data:/data \
  chenglang-homepage
```

## API endpoints

- `POST /api/visitor-events`: log a visitor event
- `GET /api/visitor-analytics?range=7d|30d|90d|all`: fetch dashboard data
- `GET /api/health`: health check for deployment platforms
