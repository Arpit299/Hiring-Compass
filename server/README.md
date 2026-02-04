# Hiring Compass Server

Express backend for resume analysis with OpenAI integration.

## Setup

```bash
cd server
npm install
```

## Configuration

Create `.env` file in server directory:

```
OPENAI_API_KEY=sk-your-openai-api-key
PORT=3001
```

## Running

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

## API Endpoints

### POST /api/analyze
Analyze a resume against a job role and company.

**Request:**
```json
{
  "resumeText": "Full resume text...",
  "jobRole": "Senior Frontend Engineer",
  "company": "TechCorp Inc"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overallScore": 78,
    "confidence": 0.85,
    "marketFit": "strong",
    "breakdown": [...],
    "keyStrengths": [...],
    "keyGaps": [...],
    "recommendedActions": [...],
    "timestamp": "2026-02-01T00:00:00Z"
  }
}
```

### GET /health
Health check endpoint.
