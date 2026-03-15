import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Fetch both mobile and desktop strategies in parallel
    const [mobileRes, desktopRes] = await Promise.all([
      fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=MOBILE&key=${apiKey}&category=PERFORMANCE&category=SEO&category=ACCESSIBILITY&category=BEST_PRACTICES`),
      fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=DESKTOP&key=${apiKey}&category=PERFORMANCE&category=SEO&category=ACCESSIBILITY&category=BEST_PRACTICES`),
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

    // Extract metrics from Lighthouse results
    const extract = (data: any) => {
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
        opportunities: Object.values(audits)
          .filter((a: any) => a.details?.type === 'opportunity' && a.score !== null && a.score < 1)
          .map((a: any) => ({
            id: a.id,
            title: a.title,
            description: a.description,
            savings: a.details?.overallSavingsMs ? `${Math.round(a.details.overallSavingsMs)}ms` : null,
          }))
          .slice(0, 10),
        diagnostics: Object.values(audits)
          .filter((a: any) => a.details?.type === 'table' && a.score !== null && a.score < 1)
          .map((a: any) => ({
            id: a.id,
            title: a.title,
            description: a.description,
            displayValue: a.displayValue || null,
          }))
          .slice(0, 10),
      };
    };

    const mobile = extract(mobileData);
    const desktop = extract(desktopData);

    return new Response(JSON.stringify({ mobile, desktop, url }), {
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
