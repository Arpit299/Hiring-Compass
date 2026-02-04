# Troubleshooting Guide

## Common Issues & Solutions

### 1. White Screen on Load

**Symptoms:**
- Browser shows blank/white page
- No console errors visible

**Causes & Fixes:**
1. **ErrorBoundary Catching Error**
   - Check browser console (F12) for red error card
   - Look at "Error Details" in the card
   - Check VS Code output panel for startup logs

2. **Server Not Running**
   - Verify backend: `curl http://localhost:3001/health`
   - Verify frontend: Open http://localhost:5173
   - Check both terminal windows are showing ✓ ready

3. **CSS Not Loading**
   - Hard refresh browser (Ctrl+Shift+R)
   - Clear browser cache
   - Check that index.css is in src/ folder

### 2. Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Fix:**
```powershell
# Kill Node processes
Get-Process -Name node | Stop-Process -Force

# Or use different port
$env:PORT=3002
npm run dev
```

### 3. TypeScript Compilation Errors

**Error:**
```
Unexpected any. Specify a different type.
```

**Status:** ✅ FIXED (All types updated to `MotionValue<number>`)

**If you see this again:**
1. Check `src/hooks/useScrollProgress.ts` line 13+
2. Ensure all parameters use `MotionValue<number>` not `any`
3. Rebuild: `npm run build`

### 4. React Fast Refresh Not Working

**Symptoms:**
- Changes to files don't appear in browser
- Need manual refresh every time
- Webpack errors about components

**Status:** ✅ FIXED (Utilities moved to separate file)

**If you see this again:**
1. Don't export hooks from component files
2. Move utility functions to `src/hooks/` folder
3. Import them in components instead

### 5. File Upload Fails

**Error:**
```json
{
  "success": false,
  "error": "Invalid file type: text/plain. Only PDF and DOCX files are allowed."
}
```

**Fix:**
- Only upload PDF or DOCX files
- Check file extension and MIME type
- File must be < 5MB

### 6. Analysis Takes Too Long / Times Out

**Error:**
```
Analysis took too long. Please try again.
```

**Causes:**
1. Large resume (> 10 pages) - parsing slow
2. SerpAPI timeout (market pulse disabled)
3. Server overloaded

**Fix:**
1. Try with smaller resume
2. Check `ENABLE_MARKET_PULSE=false` in `.env`
3. Wait a moment and try again

### 7. Resume Content Too Short

**Error:**
```json
{
  "error": "Resume content must be at least 50 characters"
}
```

**Fix:**
- Paste or upload full resume (not just summary)
- Minimum 50 characters of content required

### 8. Market Pulse Not Working

**Symptoms:**
- No salary, skills, or market data in results
- Other analysis works fine

**Note:** Market Pulse failures are graceful - main analysis still works

**Causes:**
1. SerpAPI key not configured (normal, feature is optional)
2. SerpAPI rate limit reached
3. Network timeout

**Status:** ✅ DESIGNED TO FAIL GRACEFULLY (doesn't break app)

### 9. Hot Module Reload (HMR) Issues

**Symptoms:**
- WebSocket connection fails
- Changes don't reflect

**Fix:**
1. Check vite.config.ts has HMR settings
2. Restart dev server: `npm run dev`
3. Clear browser cache: Ctrl+Shift+Delete

### 10. Build Fails

**Error:**
```
ERR! code ENOENT
```

**Fix:**
```bash
# Reinstall dependencies
rm -r node_modules package-lock.json
npm install

# Then rebuild
npm run build
```

## Checking Server Health

### Backend Health Check
```bash
# Simple health check
curl http://localhost:3001/health

# Response:
# {"status":"ok","timestamp":"2026-02-02T15:23:41.917Z"}
```

### Frontend Check
```bash
# Open in browser
http://localhost:5173

# Should load Hiring Compass homepage
```

### Process Verification
```powershell
# Check Node processes
Get-Process -Name node

# Should see two processes:
# - Backend (watching src/index.js)
# - Frontend (Vite dev server)
```

## Console Logging

### What You Should See

**Backend Startup:**
```
✓ Hiring Compass API running on http://localhost:3001
✓ Server started at 2026-02-02T15:23:41.917Z

Available endpoints:
  GET  /health          - Health check
  POST /api/analyze     - Resume analysis
```

**Frontend Startup:**
```
VITE v7.3.1  ready in 534 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Request Logs (Backend):**
```
[2026-02-02T15:23:45.123Z] POST /api/analyze - 200 (1245ms)
[request-id-abc123] Processing file: resume.pdf (245678 bytes)
[request-id-abc123] Starting analysis for Senior Engineer at TechCorp
[marketPulse] Fetching job market data for: "Senior Engineer jobs"
[marketPulse] Job market data retrieved (234ms) - 47 job postings found
[request-id-abc123] Analysis complete (3456ms)
```

## Debug Mode

### Enable Verbose Logging
```bash
# Backend
DEBUG=* npm run dev

# Frontend
npm run dev -- --debug
```

### Check Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Upload resume
4. Watch /api/analyze request
5. Check Response tab for error details

### TypeScript Errors
```bash
# Check TypeScript compilation
npm run build

# Shows all TypeScript errors
# Fix any "Unexpected any" errors
```

## Recovery Steps

If app is stuck or broken:

```bash
# 1. Kill all Node processes
Get-Process -Name node | Stop-Process -Force

# 2. Clean install
rm -r node_modules package-lock.json
npm install

# 3. Clear build artifacts
rm -r dist/ .vite/

# 4. Restart both servers
# Terminal 1:
cd server && npm run dev

# Terminal 2:
npm run dev

# 5. Open browser
http://localhost:5173
```

## Getting Help

### Check Logs In This Order
1. **Browser Console** (F12) - Frontend errors
2. **Backend Terminal** - API errors and requests
3. **Frontend Terminal** - Build errors
4. **VS Code Problems** - TypeScript issues

### Request ID Tracking
- Every API request gets unique ID
- Errors include request ID
- Use it to find matching log entries:
  ```
  [request-id-abc123] Processing...
  [request-id-abc123] Error: ...
  ```

### Key Files for Debugging
- `src/main.tsx` - React startup + ErrorBoundary
- `src/components/ErrorBoundary.tsx` - Error display
- `server/src/index.js` - API error handling
- `vite.config.ts` - Dev server config
- `tsconfig.json` - TypeScript settings

---

**Last Updated:** February 2, 2026  
**Status:** All systems operational ✅
