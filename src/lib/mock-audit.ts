import type { AuditReport } from './audit-types';

export function generateMockAudit(url: string): AuditReport {
  const perfScore = 72;
  const seoScore = 85;
  const mobileScore = 68;
  const securityScore = 91;
  const globalScore = Math.round(
    perfScore * 0.4 + seoScore * 0.25 + mobileScore * 0.2 + securityScore * 0.15
  );

  return {
    url,
    timestamp: new Date().toISOString(),
    globalScore,
    dimensions: [
      { label: 'Performance', score: perfScore, weight: 40, color: 'hsl(20, 100%, 60%)' },
      { label: 'SEO Structure', score: seoScore, weight: 25, color: 'hsl(190, 100%, 50%)' },
      { label: 'Mobile', score: mobileScore, weight: 20, color: 'hsl(45, 100%, 50%)' },
      { label: 'Security', score: securityScore, weight: 15, color: 'hsl(105, 100%, 55%)' },
    ],
    performance: {
      ttfb: 320,
      fcp: 1.4,
      lcp: 2.8,
      tbt: 420,
      cls: 0.12,
      totalLoadTime: 3.2,
      requestCount: 47,
      transferSize: '2.4 MB',
    },
    technical: {
      httpStatus: 200,
      sslValid: true,
      sslExpiry: '2026-08-15',
      cdnDetected: 'Cloudflare',
      redirects: 1,
      compression: 'gzip',
      cacheControl: 'max-age=3600',
      securityHeaders: {
        'Strict-Transport-Security': true,
        'Content-Security-Policy': false,
        'X-Frame-Options': true,
        'X-Content-Type-Options': true,
        'Referrer-Policy': false,
        'Permissions-Policy': false,
      },
    },
    findings: [
      {
        id: 'f1',
        title: 'Largest Contentful Paint exceeds threshold',
        category: 'performance',
        severity: 'CRITICAL',
        impact: 'LCP of 2.8s exceeds the 2.5s "good" threshold, degrading perceived load speed.',
        description: 'The largest visible element takes too long to render. Consider optimizing images, preloading critical resources, or using a CDN.',
        codeSnippet: '<img src="/hero-banner.jpg" width="1920" height="1080" loading="lazy">',
      },
      {
        id: 'f2',
        title: 'Total Blocking Time is degraded',
        category: 'performance',
        severity: 'HIGH',
        impact: 'TBT of 420ms blocks main thread, causing input delay.',
        description: 'Long tasks on the main thread block user interaction. Split JavaScript bundles and defer non-critical scripts.',
      },
      {
        id: 'f3',
        title: 'Cumulative Layout Shift above threshold',
        category: 'performance',
        severity: 'HIGH',
        impact: 'CLS of 0.12 causes visual instability during page load.',
        description: 'Elements shift after initial render. Set explicit dimensions on images and embeds.',
        codeSnippet: '<img src="/ad-banner.jpg"> <!-- missing width/height -->',
      },
      {
        id: 'f4',
        title: 'Missing Content-Security-Policy header',
        category: 'security',
        severity: 'HIGH',
        impact: 'No CSP allows XSS and data injection attacks.',
        description: 'Add a Content-Security-Policy header to restrict resource loading origins.',
      },
      {
        id: 'f5',
        title: 'Missing Referrer-Policy header',
        category: 'security',
        severity: 'MEDIUM',
        impact: 'URL information may leak to third-party sites.',
        description: 'Set Referrer-Policy to "strict-origin-when-cross-origin" or stricter.',
      },
      {
        id: 'f6',
        title: 'Touch targets too small on mobile',
        category: 'mobile',
        severity: 'HIGH',
        impact: '12 interactive elements are smaller than 48x48px minimum.',
        description: 'Small touch targets lead to accidental taps. Increase padding on buttons and links.',
        codeSnippet: '.nav-link { padding: 4px 8px; } /* Too small */',
      },
      {
        id: 'f7',
        title: 'Heading hierarchy skips H2',
        category: 'seo',
        severity: 'MEDIUM',
        impact: 'Skipped heading levels hurt document outline and accessibility.',
        description: 'Page goes from H1 directly to H3. Ensure sequential heading hierarchy.',
        codeSnippet: '<h1>Title</h1>\n<h3>Subtitle</h3> <!-- Missing h2 -->',
      },
      {
        id: 'f8',
        title: 'Missing Open Graph meta tags',
        category: 'seo',
        severity: 'LOW',
        impact: 'Social sharing previews will show generic content.',
        description: 'Add og:title, og:description, og:image meta tags for rich social previews.',
      },
      {
        id: 'f9',
        title: 'HTTP redirect detected',
        category: 'performance',
        severity: 'LOW',
        impact: '1 redirect adds ~100ms to initial connection.',
        description: 'Redirect from http:// to https://. Update all internal links to use HTTPS directly.',
      },
      {
        id: 'f10',
        title: 'Missing Permissions-Policy header',
        category: 'security',
        severity: 'MEDIUM',
        impact: 'Browser features like camera, microphone are not restricted.',
        description: 'Set Permissions-Policy to disable unused browser features.',
      },
    ],
    strengths: [
      { id: 's1', title: 'Valid SSL Certificate', category: 'security', description: 'SSL certificate is valid and expires 2026-08-15.' },
      { id: 's2', title: 'GZIP Compression Enabled', category: 'performance', description: 'Server compresses responses, reducing transfer size.' },
      { id: 's3', title: 'CDN Detected (Cloudflare)', category: 'performance', description: 'Content is served via CDN for global performance.' },
      { id: 's4', title: 'HSTS Header Present', category: 'security', description: 'Strict-Transport-Security enforces HTTPS connections.' },
      { id: 's5', title: 'X-Frame-Options Set', category: 'security', description: 'Prevents clickjacking by restricting iframe embedding.' },
      { id: 's6', title: 'Good TTFB (320ms)', category: 'performance', description: 'Server response time is within optimal range.' },
      { id: 's7', title: 'Proper Cache-Control', category: 'performance', description: 'Assets are cached for 1 hour reducing repeat load times.' },
    ],
    actions: [
      { id: 'a1', title: 'Optimize hero image with next-gen format', severity: 'CRITICAL', difficulty: 'Easy', expectedGain: '+8 pts', description: 'Convert hero-banner.jpg to WebP/AVIF and add width/height attributes.', category: 'performance' },
      { id: 'a2', title: 'Code-split JavaScript bundles', severity: 'HIGH', difficulty: 'Medium', expectedGain: '+5 pts', description: 'Use dynamic imports to split vendor and route-specific code.', category: 'performance' },
      { id: 'a3', title: 'Set explicit image dimensions', severity: 'HIGH', difficulty: 'Easy', expectedGain: '+4 pts', description: 'Add width and height attributes to all img tags to prevent layout shift.', category: 'performance' },
      { id: 'a4', title: 'Add Content-Security-Policy header', severity: 'HIGH', difficulty: 'Medium', expectedGain: '+6 pts', description: 'Configure CSP to whitelist only trusted resource origins.', category: 'security' },
      { id: 'a5', title: 'Increase mobile touch target sizes', severity: 'HIGH', difficulty: 'Easy', expectedGain: '+5 pts', description: 'Set minimum 48x48px on all interactive elements.', category: 'mobile' },
      { id: 'a6', title: 'Fix heading hierarchy', severity: 'MEDIUM', difficulty: 'Easy', expectedGain: '+2 pts', description: 'Add missing H2 between H1 and H3 elements.', category: 'seo' },
      { id: 'a7', title: 'Add Open Graph meta tags', severity: 'LOW', difficulty: 'Easy', expectedGain: '+1 pt', description: 'Add og:title, og:description, og:image for social sharing.', category: 'seo' },
      { id: 'a8', title: 'Add Referrer-Policy and Permissions-Policy', severity: 'MEDIUM', difficulty: 'Easy', expectedGain: '+3 pts', description: 'Set appropriate security headers to restrict browser features.', category: 'security' },
    ],
  };
}
