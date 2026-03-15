import { motion } from 'framer-motion';
import type { Finding } from '@/lib/audit-types';
import { AlertTriangle, AlertCircle, Info, XCircle } from 'lucide-react';

const severityConfig = {
  CRITICAL: { icon: XCircle, className: 'severity-critical', tagBg: 'bg-critical', tagText: 'text-critical-foreground' },
  HIGH: { icon: AlertTriangle, className: 'severity-high', tagBg: 'bg-alert', tagText: 'text-alert-foreground' },
  MEDIUM: { icon: AlertCircle, className: 'severity-medium', tagBg: 'bg-[hsl(45,100%,50%)]', tagText: 'text-background' },
  LOW: { icon: Info, className: 'severity-low', tagBg: 'bg-primary', tagText: 'text-primary-foreground' },
};

interface FindingCardProps {
  finding: Finding;
  index: number;
}

export const FindingCard = ({ finding, index }: FindingCardProps) => {
  const config = severityConfig[finding.severity];
  const Icon = config.icon;

  return (
    <motion.div
      className={`tech-card ${config.className}`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 shrink-0" style={{ color: finding.severity === 'CRITICAL' ? 'hsl(0, 100%, 62%)' : finding.severity === 'HIGH' ? 'hsl(20, 100%, 60%)' : finding.severity === 'MEDIUM' ? 'hsl(45, 100%, 50%)' : 'hsl(190, 100%, 50%)' }} />
          <h3 className="font-display text-sm font-700 text-foreground">{finding.title}</h3>
        </div>
        <span className={`${config.tagBg} ${config.tagText} font-mono text-[10px] px-2 py-0.5 rounded-sm shrink-0 uppercase tracking-wider`}>
          {finding.severity}
        </span>
      </div>
      <p className="font-mono text-xs text-muted-foreground mb-2">{finding.impact}</p>
      <p className="text-xs text-muted-foreground mb-2">{finding.description}</p>
      {finding.codeSnippet && (
        <pre className="bg-background border border-border rounded-sm p-3 font-mono text-[11px] text-primary overflow-x-auto">
          {finding.codeSnippet}
        </pre>
      )}
    </motion.div>
  );
};
