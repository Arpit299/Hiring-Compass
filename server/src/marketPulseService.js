/**
 * Market Pulse Service
 * Fetches real-time hiring trends and market demand data via Google Search / SerpAPI
 * Used for market insights only (NOT resume/ATS scoring)
 * Runs async and fails gracefully without blocking main analysis
 *
 * Design decisions:
 * - Non-blocking: wrapped in Promise.allSettled() in caller
 * - Conservative: only include high-confidence signals
 * - Fallback: returns null on API error, not thrown
 * - Recruiter-realistic: trends parsed conservatively, no wild extrapolation
 */

const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;
const ENABLE_MARKET_PULSE = process.env.ENABLE_MARKET_PULSE === 'true';

/**
 * Fetch market demand data via SerpAPI (or fallback if unavailable)
 * Returns MarketPulse object or null on error
 */
export async function fetchMarketPulse(jobRole, company) {
  if (!ENABLE_MARKET_PULSE) {
    console.log('[marketPulse] Disabled via ENABLE_MARKET_PULSE env var');
    return null;
  }

  try {
    // If SerpAPI key is not configured, skip
    if (!SERPAPI_API_KEY) {
      console.warn('[marketPulse] SerpAPI key not configured; skipping market data fetch');
      return null;
    }

    // Fetch job postings for this role
    const jobMarketData = await fetchJobMarketData(jobRole, company);

    // Fetch salary data
    const salaryData = await fetchSalaryData(jobRole);

    // Fetch trending skills
    const trendingSkills = await fetchTrendingSkills(jobRole);

    // Combine into marketPulse object
    const marketPulse = {
      demandLevel: assessDemandLevel(jobMarketData),
      trendingSkills: trendingSkills.slice(0, 5), // Top 5
      marketSalaryRange: salaryData,
      hiringOutlook: generateOutlook(jobMarketData, jobRole),
      topCompanies: jobMarketData.topCompanies || [],
      lastUpdated: new Date().toISOString(),
    };

    return marketPulse;
  } catch (error) {
    console.error('[marketPulse] Error fetching market data:', error.message);
    return null; // Fail gracefully
  }
}

/**
 * Fetch job market data (posting volume, trending skills) via SerpAPI Google Jobs
 */
async function fetchJobMarketData(jobRole, company) {
  const fetchStartTime = Date.now();
  try {
    const searchQuery = `${jobRole} jobs ${company || ''}`.trim();
    const url = new URL('https://serpapi.com/search');
    url.searchParams.append('q', searchQuery);
    url.searchParams.append('api_key', SERPAPI_API_KEY);
    url.searchParams.append('engine', 'google');
    url.searchParams.append('location', 'United States');

    console.log(`[marketPulse] Fetching job market data for: "${searchQuery}"`);
    const response = await fetch(url.toString(), { timeout: 8000 });

    if (!response.ok) {
      console.warn(`[marketPulse] SerpAPI job request returned status ${response.status}`);
      return { postingVolume: 0, topCompanies: [] };
    }

    const data = await response.json();

    // Parse results conservatively
    const results = data.organic_results || [];
    const postingCount = results.filter((r) =>
      r.snippet?.toLowerCase().includes('job') ||
      r.snippet?.toLowerCase().includes('hire') ||
      r.snippet?.toLowerCase().includes('apply')
    ).length;

    // Extract company names from results (conservative)
    const companies = new Set();
    results.slice(0, 5).forEach((r) => {
      if (r.title && r.title.includes('-')) {
        const parts = r.title.split('-').map((p) => p.trim());
        if (parts.length > 1) companies.add(parts[parts.length - 1]);
      }
    });

    const duration = Date.now() - fetchStartTime;
    console.log(`[marketPulse] Job market data retrieved (${duration}ms) - ${postingCount} job postings found`);
    
    return {
      postingVolume: postingCount,
      topCompanies: Array.from(companies).slice(0, 3),
    };
  } catch (error) {
    const duration = Date.now() - fetchStartTime;
    console.warn(`[marketPulse] Error fetching job market data (${duration}ms): ${error.message}`);
    if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
      console.warn('[marketPulse] Request timed out - SerpAPI may be slow or unavailable');
    }
    return { postingVolume: 0, topCompanies: [] };
  }
}

/**
 * Fetch salary data for the role via SerpAPI
 */
async function fetchSalaryData(jobRole) {
  const fetchStartTime = Date.now();
  try {
    const searchQuery = `${jobRole} salary 2024 2025`;
    const url = new URL('https://serpapi.com/search');
    url.searchParams.append('q', searchQuery);
    url.searchParams.append('api_key', SERPAPI_API_KEY);
    url.searchParams.append('engine', 'google');

    console.log(`[marketPulse] Fetching salary data for: "${searchQuery}"`);
    const response = await fetch(url.toString(), { timeout: 8000 });
    
    if (!response.ok) {
      console.warn(`[marketPulse] Salary data fetch returned status ${response.status}`);
      return null;
    }

    const data = await response.json();
    const results = data.organic_results || [];

    // Extract salary ranges conservatively from snippets
    let minSalary = null;
    let maxSalary = null;

    results.slice(0, 3).forEach((r) => {
      const snippet = r.snippet || '';
      const matches = snippet.match(/\$?(\d{2,3})k?\s*-\s*\$?(\d{2,3})k?/i);
      if (matches) {
        const min = parseInt(matches[1]) * 1000;
        const max = parseInt(matches[2]) * 1000;
        if (!minSalary || min < minSalary) minSalary = min;
        if (!maxSalary || max > maxSalary) maxSalary = max;
      }
    });

    const duration = Date.now() - fetchStartTime;
    if (minSalary && maxSalary && maxSalary > minSalary) {
      console.log(`[marketPulse] Salary data retrieved (${duration}ms) - $${minSalary/1000}k-$${maxSalary/1000}k`);
      return { min: minSalary, max: maxSalary, currency: 'USD' };
    }
    console.log(`[marketPulse] No salary data found (${duration}ms)`);
    return null;
  } catch (error) {
    const duration = Date.now() - fetchStartTime;
    console.warn(`[marketPulse] Error fetching salary data (${duration}ms): ${error.message}`);
    return null;
  }
}

/**
 * Fetch trending skills for the role
 */
async function fetchTrendingSkills(jobRole) {
  const fetchStartTime = Date.now();
  try {
    const searchQuery = `${jobRole} required skills 2024 trending`;
    const url = new URL('https://serpapi.com/search');
    url.searchParams.append('q', searchQuery);
    url.searchParams.append('api_key', SERPAPI_API_KEY);
    url.searchParams.append('engine', 'google');

    console.log(`[marketPulse] Fetching trending skills for: "${searchQuery}"`);
    const response = await fetch(url.toString(), { timeout: 8000 });
    
    if (!response.ok) {
      console.warn(`[marketPulse] Trending skills fetch returned status ${response.status}`);
      return [];
    }

    const data = await response.json();
    const results = data.organic_results || [];

    const skills = new Set();

    // Parse common skill keywords from top results
    const skillKeywords = [
      'python', 'javascript', 'typescript', 'java', 'c++', 'golang', 'rust',
      'react', 'angular', 'vue', 'nodejs', 'aws', 'azure', 'gcp', 'kubernetes',
      'docker', 'sql', 'mongodb', 'machine learning', 'ai', 'leadership',
      'communication', 'agile', 'scrum', 'git', 'rest api', 'graphql'
    ];

    results.slice(0, 5).forEach((r) => {
      const text = `${r.title} ${r.snippet}`.toLowerCase();
      skillKeywords.forEach((skill) => {
        if (text.includes(skill)) skills.add(skill);
      });
    });

    const duration = Date.now() - fetchStartTime;
    console.log(`[marketPulse] Trending skills retrieved (${duration}ms) - ${skills.size} skills found`);
    
    return Array.from(skills);
  } catch (error) {
    const duration = Date.now() - fetchStartTime;
    console.warn(`[marketPulse] Error fetching trending skills (${duration}ms): ${error.message}`);
    return [];
  }
}

/**
 * Assess demand level based on posting volume (conservative)
 */
function assessDemandLevel(jobMarketData) {
  const volume = jobMarketData.postingVolume || 0;
  if (volume >= 20) return 'high';
  if (volume >= 10) return 'moderate';
  return 'low';
}

/**
 * Generate recruiter-realistic hiring outlook summary
 */
function generateOutlook(jobMarketData, jobRole) {
  const volume = jobMarketData.postingVolume || 0;
  const companies = jobMarketData.topCompanies?.length || 0;

  let outlook = `${jobRole} market shows `;

  if (volume >= 20) {
    outlook += 'strong hiring activity with high competition. ';
  } else if (volume >= 10) {
    outlook += 'moderate hiring activity. ';
  } else {
    outlook += 'limited hiring activity. ';
  }

  if (companies > 0) {
    outlook += `Top companies hiring: ${jobMarketData.topCompanies.join(', ')}. `;
  }

  outlook += 'Focus on highlighted trending skills and tailor your application for each role.';

  return outlook;
}

/**
 * Main entry point: called from localAnalysis in non-blocking manner
 */
export async function getMarketPulseNonBlocking(jobRole, company) {
  try {
    return await Promise.race([
      fetchMarketPulse(jobRole, company),
      new Promise((resolve) => setTimeout(() => resolve(null), 8000)), // 8s timeout
    ]);
  } catch (error) {
    console.error('[marketPulse] Unexpected error:', error);
    return null;
  }
}
