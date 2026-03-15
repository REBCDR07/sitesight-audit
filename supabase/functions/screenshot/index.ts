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

    const apiKey = Deno.env.get('SCREENSHOTONE_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'SCREENSHOTONE_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build ScreenshotOne URLs for mobile and desktop
    const baseUrl = 'https://api.screenshotone.com/take';
    const common = `access_key=${apiKey}&url=${encodeURIComponent(url)}&format=jpg&image_quality=80&block_ads=true&delay=3`;

    const desktopUrl = `${baseUrl}?${common}&viewport_width=1440&viewport_height=900&full_page=false`;
    const mobileUrl = `${baseUrl}?${common}&viewport_width=375&viewport_height=812&full_page=false&device_scale_factor=2`;

    // Fetch both screenshots in parallel
    const [desktopRes, mobileRes] = await Promise.all([
      fetch(desktopUrl),
      fetch(mobileUrl),
    ]);

    if (!desktopRes.ok || !mobileRes.ok) {
      const errText = !desktopRes.ok ? await desktopRes.text() : await mobileRes.text();
      return new Response(JSON.stringify({ error: `Screenshot API error: ${errText}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const [desktopBlob, mobileBlob] = await Promise.all([
      desktopRes.arrayBuffer(),
      mobileRes.arrayBuffer(),
    ]);

    // Convert to base64
    const toBase64 = (buf: ArrayBuffer) => {
      const bytes = new Uint8Array(buf);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    };

    return new Response(JSON.stringify({
      desktop: `data:image/jpeg;base64,${toBase64(desktopBlob)}`,
      mobile: `data:image/jpeg;base64,${toBase64(mobileBlob)}`,
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
