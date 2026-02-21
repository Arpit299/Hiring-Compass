# Hiring Compass

Hiring Compass is a full-stack resume analysis platform that scores resume fit against target roles and companies, then surfaces strengths, gaps, and actionable recommendations.

## Tech Stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts
- Backend: Node.js, Express, Helmet, CORS, rate limiting, file upload parsing (PDF/DOCX)

## Project Structure

- `src/` — React application
- `server/` — Express API server
- `.github/workflows/` — security and CI workflows

## Quick Start

### 1) Install dependencies

```bash
npm install
cd server
npm install
cd ..
```

### 2) Run backend API

```bash
cd server
npm run dev
```

Default backend URL: `http://localhost:3001`

### 3) Run frontend

```bash
npm run dev
```

Default frontend URL: `http://localhost:5173`

## Environment Variables

### Frontend (`.env.local`)

```env
VITE_API_ENDPOINT=http://localhost:3001
VITE_SERVER_API_TOKEN=your-token-if-server-requires-it
```

### Backend (`server/.env`)

```env
PORT=3001
NODE_ENV=development
API_AUTH_TOKEN=optional-token
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

## Security Highlights

- Request hardening with Helmet headers
- Endpoint and global rate limiting
- Optional API token authentication (`X-API-Token`)
- Input sanitization and validation
- Dependency audit scripts and CI checks

## Useful Scripts

From project root:

```bash
npm run dev
npm run build
npm run lint
npm run audit
npm run audit:all
```

From `server/`:

```bash
npm run dev
npm start
npm run audit
```

## Additional Documentation

- `README_HIRING_COMPASS.md`
- `DEPLOYMENT_GUIDE.md`
- `TROUBLESHOOTING.md`
- `DELIVERY_SUMMARY.md`
