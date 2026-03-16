import { motion } from 'framer-motion';
import { Shield, Globe, Server, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface DnsInfo {
  hostname: string;
  resolved: boolean;
  isVercel: boolean;
  isNetlify: boolean;
  isGithubPages: boolean;
  isCloudflare: boolean;
  sslValid: boolean;
  httpStatus: number;
  compression: string;
  cacheControl: string;
  cdnDetected: string | null;
  securityHeaders: Record<string, boolean>;
}

interface DnsInfoPanelProps {
  dnsInfo: DnsInfo;
}

const StatusIcon = ({ ok }: { ok: boolean }) =>
  ok ? <CheckCircle className="w-3.5 h-3.5 text-success" /> : <XCircle className="w-3.5 h-3.5 text-critical" />;

export const DnsInfoPanel = ({ dnsInfo }: DnsInfoPanelProps) => {
  const platform = dnsInfo.isVercel ? 'Vercel' :
    dnsInfo.isNetlify ? 'Netlify' :
    dnsInfo.isGithubPages ? 'GitHub Pages' :
    dnsInfo.isCloudflare ? 'Cloudflare' : 'Standard';

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* DNS & Hosting */}
      <div className="tech-card">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-primary" />
          <h3 className="tech-label">DNS & HOSTING</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-1.5 border-b border-border">
            <span className="font-mono text-xs text-muted-foreground">Hostname</span>
            <span className="font-mono text-xs text-foreground">{dnsInfo.hostname}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-border">
            <span className="font-mono text-xs text-muted-foreground">DNS Resolved</span>
            <StatusIcon ok={dnsInfo.resolved} />
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-border">
            <span className="font-mono text-xs text-muted-foreground">Platform</span>
            <span className="font-mono text-xs text-primary">{platform}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-border">
            <span className="font-mono text-xs text-muted-foreground">CDN</span>
            <span className="font-mono text-xs text-foreground">{dnsInfo.cdnDetected || 'None'}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-border">
            <span className="font-mono text-xs text-muted-foreground">HTTP Status</span>
            <span className={`font-mono text-xs ${dnsInfo.httpStatus === 200 ? 'text-success' : 'text-critical'}`}>{dnsInfo.httpStatus}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-border">
            <span className="font-mono text-xs text-muted-foreground">Compression</span>
            <span className="font-mono text-xs text-foreground">{dnsInfo.compression}</span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="font-mono text-xs text-muted-foreground">Cache-Control</span>
            <span className="font-mono text-xs text-foreground truncate max-w-[200px]">{dnsInfo.cacheControl}</span>
          </div>
        </div>
      </div>

      {/* SSL & Security */}
      <div className="tech-card">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-primary" />
          <h3 className="tech-label">SSL & SECURITY HEADERS</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-1.5 border-b border-border">
            <span className="font-mono text-xs text-muted-foreground">SSL Valid</span>
            <StatusIcon ok={dnsInfo.sslValid} />
          </div>
          {Object.entries(dnsInfo.securityHeaders || {}).map(([header, present]) => (
            <div key={header} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
              <span className="font-mono text-[10px] text-muted-foreground uppercase">{header}</span>
              <StatusIcon ok={present} />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
