import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Smartphone, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DevicePreviewProps {
  url: string;
}

export const DevicePreview = ({ url }: DevicePreviewProps) => {
  const [screenshots, setScreenshots] = useState<{ desktop: string; mobile: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScreenshots = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fnError } = await supabase.functions.invoke('screenshot', {
          body: { url },
        });
        if (fnError) throw fnError;
        if (data?.error) throw new Error(data.error);
        setScreenshots(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load screenshots');
      } finally {
        setLoading(false);
      }
    };
    fetchScreenshots();
  }, [url]);

  if (loading) {
    return (
      <div className="tech-card flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-primary animate-spin mr-3" />
        <span className="tech-label">CAPTURING SCREENSHOTS...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tech-card py-8 text-center">
        <p className="font-mono text-xs text-critical">{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Desktop Preview */}
      <div className="tech-card">
        <div className="flex items-center gap-2 mb-3">
          <Monitor className="w-4 h-4 text-primary" />
          <span className="tech-label">DESKTOP — 1440×900</span>
        </div>
        <div className="relative rounded-sm overflow-hidden border border-border bg-background">
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-surface-alt">
            <div className="w-2 h-2 rounded-full bg-critical/60" />
            <div className="w-2 h-2 rounded-full bg-alert/60" />
            <div className="w-2 h-2 rounded-full bg-success/60" />
            <span className="ml-2 font-mono text-[9px] text-muted-foreground truncate">{url}</span>
          </div>
          {screenshots?.desktop && (
            <img
              src={screenshots.desktop}
              alt="Desktop view"
              className="w-full h-auto"
              loading="lazy"
            />
          )}
        </div>
      </div>

      {/* Mobile Preview */}
      <div className="tech-card flex flex-col items-center">
        <div className="flex items-center gap-2 mb-3 self-start">
          <Smartphone className="w-4 h-4 text-primary" />
          <span className="tech-label">MOBILE — 375×812</span>
        </div>
        <div className="relative w-[220px] rounded-[20px] border-[3px] border-border bg-background p-1 shadow-lg">
          <div className="w-12 h-1 bg-border rounded-full mx-auto mb-1" />
          <div className="rounded-[16px] overflow-hidden">
            {screenshots?.mobile && (
              <img
                src={screenshots.mobile}
                alt="Mobile view"
                className="w-full h-auto"
                loading="lazy"
              />
            )}
          </div>
          <div className="w-8 h-1 bg-border rounded-full mx-auto mt-1" />
        </div>
      </div>
    </motion.div>
  );
};
