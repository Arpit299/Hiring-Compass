import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import { analyzeResumeLocal, analyzeResumeLocalWithMarketPulse } from './localAnalysis.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PROD = NODE_ENV === 'production';
const ENFORCE_HTTPS = process.env.ENFORCE_HTTPS === 'true';
const API_AUTH_TOKEN = process.env.API_AUTH_TOKEN || '';
const MAX_RESUME_TEXT_CHARS = Number(process.env.MAX_RESUME_TEXT_CHARS || 50000);
const ANALYZE_TIMEOUT_MS = Number(process.env.ANALYZE_TIMEOUT_MS || 25000);
const ALLOWED_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable('x-powered-by');
app.set('trust proxy', process.env.TRUST_PROXY === 'true');

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

if (ENFORCE_HTTPS) {
  app.use((req, res, next) => {
    const proto = req.headers['x-forwarded-proto'];
    if (IS_PROD && proto !== 'https') {
      return res.status(403).json({ success: false, error: 'HTTPS is required' });
    }
    next();
  });
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.length === 0) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      return callback(new Error('Origin not allowed by CORS policy'));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-API-Token', 'X-Request-Id'],
    credentials: false,
    maxAge: 600,
  })
);

app.use(express.json({ limit: '1mb', strict: true }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.GLOBAL_RATE_LIMIT_MAX || 300),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
});

const analyzeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.ANALYZE_RATE_LIMIT_MAX || 40),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Rate limit exceeded for analysis endpoint.' },
});

app.use(globalLimiter);

// Multer (memory) for file uploads with error handling
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5 MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const allowedExtensions = ['.pdf', '.docx'];
    
    const ext = file.originalname.toLowerCase().slice(-5);
    const isMimeValid = allowedMimes.includes(file.mimetype) || allowedExtensions.some(e => file.originalname.toLowerCase().endsWith(e));
    
    if (!isMimeValid) {
      return cb(new Error(`Invalid file type: ${file.mimetype || file.originalname}. Only PDF and DOCX files are allowed.`));
    }
    cb(null, true);
  }
});

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  const originalResEnd = res.end;
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  req.requestId = String(requestId);
  res.setHeader('X-Request-Id', String(requestId));
  
  res.end = function() {
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] [${req.requestId}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    originalResEnd.apply(res, arguments);
  };
  
  next();
});

function secureCompare(a, b) {
  try {
    const aBuf = Buffer.from(String(a || ''), 'utf8');
    const bBuf = Buffer.from(String(b || ''), 'utf8');
    if (aBuf.length !== bBuf.length) return false;
    return crypto.timingSafeEqual(aBuf, bBuf);
  } catch {
    return false;
  }
}

function requireApiToken(req, res, next) {
  if (!API_AUTH_TOKEN) return next();

  const provided = req.headers['x-api-token'];
  if (!provided || typeof provided !== 'string') {
    return res.status(401).json({ success: false, error: 'Missing API token', requestId: req.requestId });
  }

  if (!secureCompare(provided, API_AUTH_TOKEN)) {
    return res.status(403).json({ success: false, error: 'Invalid API token', requestId: req.requestId });
  }

  return next();
}

function sanitizeText(input, maxLength = 200) {
  if (typeof input !== 'string') return '';
  return input.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function isValidEntityName(value, min, max) {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) return false;
  return /^[\p{L}\p{N} .,'()&\-_/+]+$/u.test(trimmed);
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Helper: parse uploaded resume buffer to text
async function parseResumeBuffer(file) {
  const { originalname, mimetype, buffer } = file;

  if (!buffer || buffer.length === 0) {
    throw new Error('Empty file uploaded. Please provide a valid resume file.');
  }

  const lower = originalname.toLowerCase();
  try {
    if (mimetype === 'application/pdf' || lower.endsWith('.pdf')) {
      const data = await pdfParse(buffer);
      const text = data.text || '';
      if (!text || text.trim().length === 0) {
        throw new Error('PDF file appears to be empty or unreadable');
      }
      return text;
    }

    // DOCX
    if (
      mimetype ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      lower.endsWith('.docx')
    ) {
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value || '';
      if (!text || text.trim().length === 0) {
        throw new Error('DOCX file appears to be empty or unreadable');
      }
      return text;
    }

    // unsupported
    throw new Error(`Unsupported file type: ${originalname}. Please upload a PDF or DOCX file.`);
  } catch (err) {
    const message = err.message || String(err);
    throw new Error(`Failed to parse resume: ${message}`);
  }
}

// Main analysis endpoint - accepts either multipart/form-data with `resumeFile` or JSON with `resumeText`
app.post('/api/analyze', analyzeLimiter, requireApiToken, upload.single('resumeFile'), async (req, res) => {
  const startTime = Date.now();
  const requestId = req.requestId || `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  
  try {
    const rawJobRole = req.body?.jobRole;
    const rawCompany = req.body?.company;
    const jobRole = sanitizeText(rawJobRole, 120);
    const company = sanitizeText(rawCompany, 120);

    // Validate jobRole
    if (!isValidEntityName(jobRole, 3, 120)) {
      console.warn(`[${requestId}] Invalid jobRole: ${jobRole}`);
      return res.status(400).json({ 
        success: false, 
        error: 'Job role is required (minimum 3 characters)',
        requestId
      });
    }

    // Validate company
    if (!isValidEntityName(company, 2, 120)) {
      console.warn(`[${requestId}] Invalid company: ${company}`);
      return res.status(400).json({ 
        success: false, 
        error: 'Company name is required (minimum 2 characters)',
        requestId
      });
    }

    let resumeText = '';

    if (req.file) {
      // Parse uploaded file
      console.log(`[${requestId}] Processing file: ${req.file.originalname} (${req.file.size} bytes)`);
      try {
        resumeText = (await parseResumeBuffer(req.file)).trim();
      } catch (parseErr) {
        console.error(`[${requestId}] File parsing error: ${parseErr.message}`);
        return res.status(415).json({ 
          success: false, 
          error: parseErr.message,
          requestId
        });
      }
      
      if (!resumeText || resumeText.length < 50) {
        console.warn(`[${requestId}] Parsed resume too short: ${resumeText.length} chars`);
        return res.status(400).json({ 
          success: false, 
          error: 'Resume content is too short. Please provide at least 50 characters.',
          requestId
        });
      }
    } else if (req.body.resumeText && typeof req.body.resumeText === 'string') {
      resumeText = sanitizeText(req.body.resumeText, MAX_RESUME_TEXT_CHARS);
      if (resumeText.length < 50) {
        console.warn(`[${requestId}] Resume text too short: ${resumeText.length} chars`);
        return res.status(400).json({ 
          success: false, 
          error: 'Resume content must be at least 50 characters',
          requestId
        });
      }
    } else {
      console.warn(`[${requestId}] No resume provided`);
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide a resume (PDF/DOCX file or pasted text)',
        requestId
      });
    }

    if (resumeText.length > MAX_RESUME_TEXT_CHARS) {
      return res.status(413).json({
        success: false,
        error: `Resume content exceeds maximum allowed length (${MAX_RESUME_TEXT_CHARS} chars).`,
        requestId,
      });
    }

    // Perform analysis
    console.log(`[${requestId}] Starting analysis for ${jobRole} at ${company}`);
    const analysisResult = await Promise.race([
      analyzeResumeLocalWithMarketPulse(resumeText, jobRole, company),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Analysis timeout exceeded')), ANALYZE_TIMEOUT_MS)
      ),
    ]);
    
    const duration = Date.now() - startTime;
    console.log(`[${requestId}] Analysis complete (${duration}ms)`);

    res.json({ 
      success: true, 
      data: analysisResult,
      metadata: {
        requestId,
        processingTimeMs: duration,
        timestamp: new Date().toISOString()
      }
    });

    if (req.file?.buffer) {
      req.file.buffer.fill(0);
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    const message = error && error.message ? error.message : 'Failed to analyze resume';
    console.error(`[${requestId}] Analysis error after ${duration}ms: ${message}`);
    if (!IS_PROD && error?.stack) {
      console.error(error.stack);
    }
    
    let statusCode = 500;
    let errorMsg = message;
    
    if (message.toLowerCase().includes('unsupported')) {
      statusCode = 415;
    } else if (message.toLowerCase().includes('timeout')) {
      statusCode = 408;
      errorMsg = 'Analysis took too long. Please try again.';
    } else if (message.toLowerCase().includes('memory')) {
      statusCode = 429;
      errorMsg = 'Server is busy. Please try again later.';
    }
    
    res.status(statusCode).json({ 
      success: false, 
      error: IS_PROD && statusCode >= 500 ? 'Internal server error' : errorMsg,
      requestId,
      processingTimeMs: duration
    });
  }
});

// Multer error handler (must be before general error handler)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    let statusCode = 400;
    let message = err.message;
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File is too large. Maximum file size is 5 MB.';
      statusCode = 413;
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files. Only one file is allowed.';
      statusCode = 400;
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file field.';
      statusCode = 400;
    }
    
    console.error(`[MULTER] ${err.code}: ${message}`);
    return res.status(statusCode).json({ 
      success: false, 
      error: message
    });
  } else if (err && err.message && err.message.includes('Invalid file type')) {
    console.error(`[FILE_VALIDATION] ${err.message}`);
    return res.status(415).json({ 
      success: false, 
      error: err.message
    });
  }
  
  // Pass to next error handler if not multer error
  next(err);
});

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  console.error(`[ERROR] ${new Date().toISOString()} - Status: ${statusCode} - ${message}`);
  if (!IS_PROD && err?.stack) {
    console.error(err.stack);
  }
  
  res.status(statusCode).json({ 
    success: false, 
    error: IS_PROD && statusCode >= 500 ? 'Internal server error' : message,
    timestamp: new Date().toISOString(),
    path: req.path,
    requestId: req.requestId
  });
});

// 404 handler
app.use((req, res) => {
  console.warn(`[404] ${new Date().toISOString()} - ${req.method} ${req.path}`);
  res.status(404).json({ 
    success: false, 
    error: 'Endpoint not found',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Server startup with error handling
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✓ Hiring Compass API running on http://localhost:${PORT}`);
  console.log(`✓ Server started at ${new Date().toISOString()}`);
  console.log('\nAvailable endpoints:');
  console.log('  GET  /health          - Health check');
  console.log('  POST /api/analyze     - Resume analysis\n');
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n✗ ERROR: Port ${PORT} is already in use!`);
    console.error(`  Please close the application using port ${PORT} or use a different port.`);
    console.error(`  Set PORT environment variable to use a different port.\n`);
    process.exit(1);
  } else if (err.code === 'EACCES') {
    console.error(`\n✗ ERROR: Permission denied to use port ${PORT}`);
    console.error(`  Ports below 1024 require admin/root privileges.`);
    console.error(`  Set PORT environment variable to a port above 1024.\n`);
    process.exit(1);
  } else {
    console.error(`\n✗ Server Error: ${err.message}`);
    process.exit(1);
  }
});

// Graceful shutdown handlers
process.on('SIGINT', () => {
  console.log('\n\nShutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown');
    process.exit(1);
  }, 10000);
});

process.on('SIGTERM', () => {
  console.log('\n\nTermination signal received, shutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Catch uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`\n✗ UNCAUGHT EXCEPTION: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});

// Catch unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error(`\n✗ UNHANDLED REJECTION at ${promise}:`);
  console.error(reason);
  console.warn('Server continuing despite unhandled rejection');
});
