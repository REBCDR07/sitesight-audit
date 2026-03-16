import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// DNS verification
async function verifyDns(url: string) {
  const hostname = new URL(url).hostname;
  const info: Record<string, any> = {
    hostname,
    resolved: false,
    isVercel: false,
    isNetlify: false,
    isGithubPages: false,
    isCloudflare: false,
    sslValid: false,
    sslExpiry: null,
    httpStatus: 0,
    redirects: [],
    compression: null,
    cdnDetected: null,
    securityHeaders: {},
  };

  try {
    // Check DNS resolution via a HEAD request with redirect tracking
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'SiteScope-Audit/1.0' },
    });
    clearTimeout(timeout);

    info.resolved = true;
    info.httpStatus = res.status;

    // Detect hosting platform from headers
    const server = res.headers.get('server') || '';
    const via = res.headers.get('via') || '';
    const xPoweredBy = res.headers.get('x-powered-by') || '';
    const xVercelId = res.headers.get('x-vercel-id');
    const xNetlify = res.headers.get('x-nf-request-id');

    if (xVercelId || server.toLowerCase().includes('vercel')) info.isVercel = true;
    if (xNetlify || server.toLowerCase().includes('netlify')) info.isNetlify = true;
    if (hostname.endsWith('.github.io') || server.toLowerCase().includes('github')) info.isGithubPages = true;
    if (server.toLowerCase().includes('cloudflare') || res.headers.get('cf-ray')) {
      info.isCloudflare = true;
      info.cdnDetected = 'Cloudflare';
    }
    if (via.includes('varnish') || res.headers.get('x-cache')) info.cdnDetected = info.cdnDetected || 'CDN Detected';
    if (xVercelId) info.cdnDetected = info.cdnDetected || 'Vercel Edge';
    if (xNetlify) info.cdnDetected = info.cdnDetected || 'Netlify CDN';

    // Compression
    info.compression = res.headers.get('content-encoding') || 'none';

    // Cache
    info.cacheControl = res.headers.get('cache-control') || 'not set';

    // SSL check (if url starts with https)
    info.sslValid = url.startsWith('https://') && res.ok;

    // Security headers
    const secHeaders = [
      'strict-transport-security',
      'content-security-policy',
      'x-frame-options',
      'x-content-type-options',
      'referrer-policy',
      'permissions-policy',
    ];
    for (const h of secHeaders) {
      info.securityHeaders[h] = !!res.headers.get(h);
    }
  } catch (e) {
    info.error = e instanceof Error ? e.message : 'DNS resolution failed';
  }

  return info;
}

// Map severity from lighthouse score
function scoreSeverity(score: number | null): string {
  if (score === null || score === undefined) return 'MEDIUM';
  if (score <= 0.25) return 'CRITICAL';
  if (score <= 0.5) return 'HIGH';
  if (score <= 0.75) return 'MEDIUM';
  return 'LOW';
}

// Extract real findings from lighthouse audits
function extractFindings(data: any, strategy: string) {
  const audits = data.lighthouseResult?.audits || {};
  const findings: any[] = [];
  const strengths: any[] = [];
  const actions: any[] = [];

  // Key audits to check for real findings
  const auditKeys = [
    // Accessibility
    'image-alt', 'button-name', 'link-name', 'color-contrast', 'label',
    'html-has-lang', 'meta-viewport', 'heading-order', 'document-title',
    'aria-roles', 'tabindex', 'valid-lang',
    // SEO
    'meta-description', 'canonical', 'robots-txt', 'hreflang',
    'font-size', 'tap-targets', 'is-crawlable', 'structured-data',
    'http-status-code',
    // Performance
    'render-blocking-resources', 'unused-css-rules', 'unused-javascript',
    'uses-optimized-images', 'uses-webp-images', 'uses-responsive-images',
    'offscreen-images', 'unminified-css', 'unminified-javascript',
    'uses-text-compression', 'uses-long-cache-ttl', 'dom-size',
    'critical-request-chains', 'total-byte-weight', 'mainthread-work-breakdown',
    'bootup-time', 'font-display', 'third-party-summary',
    'largest-contentful-paint-element', 'layout-shift-elements',
    'long-tasks', 'no-document-write', 'uses-passive-event-listeners',
    // Best Practices / Security
    'is-on-https', 'geolocation-on-start', 'notification-on-start',
    'no-vulnerable-libraries', 'csp-xss', 'errors-in-console',
    'deprecations', 'inspector-issues',
  ];

  const categoryMap: Record<string, string> = {
    'image-alt': 'seo', 'button-name': 'mobile', 'link-name': 'seo',
    'color-contrast': 'mobile', 'label': 'mobile',
    'html-has-lang': 'seo', 'meta-viewport': 'mobile', 'heading-order': 'seo',
    'document-title': 'seo', 'aria-roles': 'mobile', 'tabindex': 'mobile',
    'meta-description': 'seo', 'canonical': 'seo', 'robots-txt': 'seo',
    'font-size': 'mobile', 'tap-targets': 'mobile', 'is-crawlable': 'seo',
    'render-blocking-resources': 'performance', 'unused-css-rules': 'performance',
    'unused-javascript': 'performance', 'uses-optimized-images': 'performance',
    'uses-webp-images': 'performance', 'uses-responsive-images': 'performance',
    'offscreen-images': 'performance', 'unminified-css': 'performance',
    'unminified-javascript': 'performance', 'uses-text-compression': 'performance',
    'uses-long-cache-ttl': 'performance', 'dom-size': 'performance',
    'total-byte-weight': 'performance', 'mainthread-work-breakdown': 'performance',
    'bootup-time': 'performance', 'font-display': 'performance',
    'largest-contentful-paint-element': 'performance', 'layout-shift-elements': 'performance',
    'long-tasks': 'performance',
    'is-on-https': 'security', 'no-vulnerable-libraries': 'security',
    'csp-xss': 'security', 'errors-in-console': 'security',
    'deprecations': 'security',
  };

  let findingIdx = 0;
  let strengthIdx = 0;
  let actionIdx = 0;

  for (const key of auditKeys) {
    const audit = audits[key];
    if (!audit) continue;

    const category = categoryMap[key] || 'performance';
    const score = audit.score;

    if (score === 1 || score === null) {
      // It's a strength if score is perfect
      if (score === 1) {
        strengths.push({
          id: `s-${strategy}-${strengthIdx++}`,
          title: audit.title,
          category,
          description: audit.description?.replace(/\[.*?\]\(.*?\)/g, '').substring(0, 300) || '',
        });
      }
      continue;
    }

    // It's a finding (failed audit)
    const severity = scoreSeverity(score);

    // Extract details for code snippets
    let codeSnippet: string | undefined;
    let itemDetails = '';

    if (audit.details?.items?.length) {
      const items = audit.details.items.slice(0, 5);
      const snippets: string[] = [];

      for (const item of items) {
        if (item.node?.snippet) {
          snippets.push(item.node.snippet);
        } else if (item.url) {
          snippets.push(item.url);
        } else if (item.source?.snippet) {
          snippets.push(item.source.snippet);
        }
      }

      if (snippets.length) {
        codeSnippet = snippets.join('\n');
      }

      // Count items for impact description
      const totalItems = audit.details.items.length;
      if (totalItems > 0) {
        itemDetails = ` (${totalItems} element${totalItems > 1 ? 's' : ''} affected)`;
      }
    }

    const impact = (audit.displayValue || '') + itemDetails;

    findings.push({
      id: `f-${strategy}-${findingIdx++}`,
      title: audit.title,
      category,
      severity,
      impact: impact || `Score: ${Math.round((score || 0) * 100)}/100`,
      description: audit.description?.replace(/\[.*?\]\(.*?\)/g, '').substring(0, 400) || '',
      codeSnippet,
    });

    // Generate corrective action
    const difficulty = score <= 0.25 ? 'Hard' : score <= 0.5 ? 'Medium' : 'Easy';
    const expectedGain = severity === 'CRITICAL' ? '+8 pts' : severity === 'HIGH' ? '+5 pts' : severity === 'MEDIUM' ? '+3 pts' : '+1 pt';

    actions.push({
      id: `a-${strategy}-${actionIdx++}`,
      title: `Fix: ${audit.title}`,
      severity,
      difficulty,
      expectedGain,
      description: audit.description?.replace(/\[.*?\]\(.*?\)/g, '').substring(0, 300) || '',
      category,
    });
  }

  return { findings, strengths, actions };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('GOOGLE_PAGESPEED_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'GOOGLE_PAGESPEED_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DNS verification first
    const dnsInfo = await verifyDns(url);
    if (!dnsInfo.resolved) {
      return new Response(JSON.stringify({
        error: `DNS verification failed for ${url}: ${dnsInfo.error || 'Could not resolve host'}`,
        dnsInfo,
      }), {
        status: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch both mobile and desktop strategies in parallel
    const categories = 'category=PERFORMANCE&category=SEO&category=ACCESSIBILITY&category=BEST_PRACTICES';
    const [mobileRes, desktopRes] = await Promise.all([
      fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=MOBILE&key=${apiKey}&${categories}`),
      fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=DESKTOP&key=${apiKey}&${categories}`),
    ]);

    if (!mobileRes.ok) {
      const err = await mobileRes.text();
      return new Response(JSON.stringify({ error: `PageSpeed API error: ${err}` }), {
        status: mobileRes.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const [mobileData, desktopData] = await Promise.all([
      mobileRes.json(),
      desktopRes.json(),
    ]);

    // Extract scores and metrics
    const extractMetrics = (data: any) => {
      const audits = data.lighthouseResult?.audits || {};
      const categories = data.lighthouseResult?.categories || {};
      return {
        scores: {
          performance: Math.round((categories.performance?.score || 0) * 100),
          seo: Math.round((categories.seo?.score || 0) * 100),
          accessibility: Math.round((categories.accessibility?.score || 0) * 100),
          bestPractices: Math.round((categories['best-practices']?.score || 0) * 100),
        },
        metrics: {
          ttfb: Math.round(audits['server-response-time']?.numericValue || 0),
          fcp: parseFloat(((audits['first-contentful-paint']?.numericValue || 0) / 1000).toFixed(1)),
          lcp: parseFloat(((audits['largest-contentful-paint']?.numericValue || 0) / 1000).toFixed(1)),
          tbt: Math.round(audits['total-blocking-time']?.numericValue || 0),
          cls: parseFloat((audits['cumulative-layout-shift']?.numericValue || 0).toFixed(2)),
          si: parseFloat(((audits['speed-index']?.numericValue || 0) / 1000).toFixed(1)),
          tti: parseFloat(((audits['interactive']?.numericValue || 0) / 1000).toFixed(1)),
        },
      };
    };

    const mobile = extractMetrics(mobileData);
    const desktop = extractMetrics(desktopData);

    // Extract REAL findings from both strategies
    const mobileFindings = extractFindings(mobileData, 'mobile');
    const desktopFindings = extractFindings(desktopData, 'desktop');

    // Merge and deduplicate findings (prefer mobile version for duplicates)
    const seenTitles = new Set<string>();
    const allFindings: any[] = [];
    const allStrengths: any[] = [];
    const allActions: any[] = [];

    for (const f of [...mobileFindings.findings, ...desktopFindings.findings]) {
      if (!seenTitles.has(f.title)) {
        seenTitles.add(f.title);
        allFindings.push(f);
      }
    }

    const seenStrengths = new Set<string>();
    for (const s of [...mobileFindings.strengths, ...desktopFindings.strengths]) {
      if (!seenStrengths.has(s.title)) {
        seenStrengths.add(s.title);
        allStrengths.push(s);
      }
    }

    const seenActions = new Set<string>();
    for (const a of [...mobileFindings.actions, ...desktopFindings.actions]) {
      if (!seenActions.has(a.title)) {
        seenActions.add(a.title);
        allActions.push(a);
      }
    }

    return new Response(JSON.stringify({
      mobile,
      desktop,
      url,
      dnsInfo,
      findings: allFindings,
      strengths: allStrengths,
      actions: allActions,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
