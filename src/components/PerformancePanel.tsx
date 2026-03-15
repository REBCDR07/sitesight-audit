import type { PerformanceMetrics, TechnicalInfo } from '@/lib/audit-types';
import { motion } from 'framer-motion';

interface MetricRowProps {
  label: string;
  value: string;
  status?: 'good' | 'degraded' | 'poor';
}

const statusColors = {
  good: 'text-success',
  degraded: 'text-alert',
  poor: 'text-critical',
};

const MetricRow = ({ label, value, status = 'good' }: MetricRowProps) => (
  <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
    <span className="font-mono text-xs text-muted-foreground">{label}</span>
    <span className={`font-mono text-sm tabular ${statusColors[status]}`}>{value}</span>
  </div>
);

interface PerformancePanelProps {
  metrics: PerformanceMetrics;
  technical: TechnicalInfo;
}

function getMetricStatus(metric: string, value: number): 'good' | 'degraded' | 'poor' {
  const thresholds: Record<string, [number, number]> = {
    ttfb: [500, 1500],
    fcp: [1.8, 3],
    lcp: [2.5, 4],
    tbt: [200, 600],
    cls: [0.1, 0.25],
    totalLoadTime: [3, 5],
  };
  const t = thresholds[metric];
  if (!t) return 'good';
  if (value <= t[0]) return 'good';
  if (value <= t[1]) return 'degraded';
  return 'poor';
}

export const PerformancePanel = ({ metrics, technical }: PerformancePanelProps) => (
  <motion.div
    className="grid grid-cols-1 md:grid-cols-2 gap-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div className="tech-card">
      <h3 className="tech-label mb-3">CORE WEB VITALS</h3>
      <MetricRow label="TTFB" value={`${metrics.ttfb}ms`} status={getMetricStatus('ttfb', metrics.ttfb)} />
      <MetricRow label="FCP" value={`${metrics.fcp}s`} status={getMetricStatus('fcp', metrics.fcp)} />
      <MetricRow label="LCP" value={`${metrics.lcp}s`} status={getMetricStatus('lcp', metrics.lcp)} />
      <MetricRow label="TBT" value={`${metrics.tbt}ms`} status={getMetricStatus('tbt', metrics.tbt)} />
      <MetricRow label="CLS" value={`${metrics.cls}`} status={getMetricStatus('cls', metrics.cls)} />
    </div>
    <div className="tech-card">
      <h3 className="tech-label mb-3">TRANSFER METRICS</h3>
      <MetricRow label="Total Load Time" value={`${metrics.totalLoadTime}s`} status={getMetricStatus('totalLoadTime', metrics.totalLoadTime)} />
      <MetricRow label="Requests" value={`${metrics.requestCount}`} />
      <MetricRow label="Transfer Size" value={metrics.transferSize} />
    </div>
    <div className="tech-card">
      <h3 className="tech-label mb-3">SERVER & TRANSPORT</h3>
      <MetricRow label="HTTP Status" value={`${technical.httpStatus}`} status={technical.httpStatus === 200 ? 'good' : 'poor'} />
      <MetricRow label="SSL" value={technical.sslValid ? `Valid (${technical.sslExpiry})` : 'Invalid'} status={technical.sslValid ? 'good' : 'poor'} />
      <MetricRow label="CDN" value={technical.cdnDetected || 'None'} status={technical.cdnDetected ? 'good' : 'degraded'} />
      <MetricRow label="Redirects" value={`${technical.redirects}`} status={technical.redirects === 0 ? 'good' : 'degraded'} />
      <MetricRow label="Compression" value={technical.compression} />
      <MetricRow label="Cache-Control" value={technical.cacheControl} />
    </div>
    <div className="tech-card">
      <h3 className="tech-label mb-3">SECURITY HEADERS</h3>
      {Object.entries(technical.securityHeaders).map(([header, present]) => (
        <MetricRow key={header} label={header} value={present ? 'SET' : 'MISSING'} status={present ? 'good' : 'poor'} />
      ))}
    </div>
  </motion.div>
);
