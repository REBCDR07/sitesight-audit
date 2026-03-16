import { motion } from 'framer-motion';
import { Smartphone, Monitor } from 'lucide-react';
import { ScoreRing } from './ScoreRing';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';

interface Scores {
  performance: number;
  seo: number;
  accessibility: number;
  bestPractices: number;
}

interface Metrics {
  ttfb: number;
  fcp: number;
  lcp: number;
  tbt: number;
  cls: number;
  si: number;
  tti: number;
}

interface MobileDesktopComparisonProps {
  mobileScores: Scores;
  desktopScores: Scores;
  mobileMetrics: Metrics;
  desktopMetrics: Metrics;
}

const getColor = (s: number) =>
  s >= 90 ? 'hsl(105, 100%, 55%)' : s >= 70 ? 'hsl(45, 100%, 50%)' : s >= 50 ? 'hsl(20, 100%, 60%)' : 'hsl(0, 100%, 62%)';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-sm px-3 py-2 font-mono text-xs">
      <p className="text-foreground font-medium">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.fill || p.color }} className="mt-1">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export const MobileDesktopComparison = ({ mobileScores, desktopScores, mobileMetrics, desktopMetrics }: MobileDesktopComparisonProps) => {
  const scoreCategories = [
    { key: 'performance', label: 'Performance' },
    { key: 'seo', label: 'SEO' },
    { key: 'accessibility', label: 'Accessibility' },
    { key: 'bestPractices', label: 'Best Practices' },
  ];

  const comparisonData = scoreCategories.map(c => ({
    name: c.label,
    Mobile: mobileScores[c.key as keyof Scores],
    Desktop: desktopScores[c.key as keyof Scores],
  }));

  const metricLabels: Record<string, { label: string; unit: string }> = {
    ttfb: { label: 'TTFB', unit: 'ms' },
    fcp: { label: 'FCP', unit: 's' },
    lcp: { label: 'LCP', unit: 's' },
    tbt: { label: 'TBT', unit: 'ms' },
    cls: { label: 'CLS', unit: '' },
    si: { label: 'Speed Index', unit: 's' },
    tti: { label: 'TTI', unit: 's' },
  };

  const mobileOverall = Math.round(
    (mobileScores.performance + mobileScores.seo + mobileScores.accessibility + mobileScores.bestPractices) / 4
  );
  const desktopOverall = Math.round(
    (desktopScores.performance + desktopScores.seo + desktopScores.accessibility + desktopScores.bestPractices) / 4
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Overall scores side by side */}
      <div className="grid grid-cols-2 gap-4">
        <div className="tech-card flex flex-col items-center py-6">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="w-5 h-5 text-primary" />
            <span className="font-display text-sm font-700 text-foreground">MOBILE</span>
          </div>
          <ScoreRing score={mobileOverall} size={140} label="MOBILE SCORE" />
        </div>
        <div className="tech-card flex flex-col items-center py-6">
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="w-5 h-5 text-primary" />
            <span className="font-display text-sm font-700 text-foreground">DESKTOP</span>
          </div>
          <ScoreRing score={desktopOverall} size={140} label="DESKTOP SCORE" />
        </div>
      </div>

      {/* Category comparison bar chart */}
      <div className="tech-card">
        <h3 className="tech-label mb-4">CATEGORY COMPARISON</h3>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 25%, 14%)" />
              <XAxis
                dataKey="name"
                tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: 'hsl(222, 25%, 14%)' }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: 'hsl(222, 25%, 14%)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: 10 }}
              />
              <Bar dataKey="Mobile" fill="hsl(190, 100%, 50%)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Desktop" fill="hsl(105, 100%, 55%)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Metrics comparison table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="tech-card">
          <div className="flex items-center gap-2 mb-3">
            <Smartphone className="w-4 h-4 text-primary" />
            <h3 className="tech-label">MOBILE METRICS</h3>
          </div>
          {Object.entries(metricLabels).map(([key, { label, unit }]) => {
            const val = mobileMetrics[key as keyof Metrics];
            return (
              <div key={key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="font-mono text-xs text-muted-foreground">{label}</span>
                <span className="font-mono text-sm tabular" style={{ color: getColor(key === 'cls' ? (val <= 0.1 ? 90 : val <= 0.25 ? 60 : 30) : (val <= 2 ? 90 : val <= 4 ? 60 : 30)) }}>
                  {val}{unit}
                </span>
              </div>
            );
          })}
        </div>
        <div className="tech-card">
          <div className="flex items-center gap-2 mb-3">
            <Monitor className="w-4 h-4 text-primary" />
            <h3 className="tech-label">DESKTOP METRICS</h3>
          </div>
          {Object.entries(metricLabels).map(([key, { label, unit }]) => {
            const val = desktopMetrics[key as keyof Metrics];
            return (
              <div key={key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="font-mono text-xs text-muted-foreground">{label}</span>
                <span className="font-mono text-sm tabular" style={{ color: getColor(key === 'cls' ? (val <= 0.1 ? 90 : val <= 0.25 ? 60 : 30) : (val <= 2 ? 90 : val <= 4 ? 60 : 30)) }}>
                  {val}{unit}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Score detail cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {scoreCategories.map(c => {
          const mScore = mobileScores[c.key as keyof Scores];
          const dScore = desktopScores[c.key as keyof Scores];
          const diff = dScore - mScore;
          return (
            <div key={c.key} className="tech-card text-center">
              <span className="tech-label">{c.label}</span>
              <div className="flex items-center justify-center gap-3 mt-2">
                <div>
                  <Smartphone className="w-3 h-3 mx-auto text-muted-foreground mb-1" />
                  <span className="font-display text-lg tabular" style={{ color: getColor(mScore) }}>{mScore}</span>
                </div>
                <span className="text-muted-foreground font-mono text-xs">vs</span>
                <div>
                  <Monitor className="w-3 h-3 mx-auto text-muted-foreground mb-1" />
                  <span className="font-display text-lg tabular" style={{ color: getColor(dScore) }}>{dScore}</span>
                </div>
              </div>
              <span className={`font-mono text-[10px] mt-1 block ${diff > 0 ? 'text-success' : diff < 0 ? 'text-critical' : 'text-muted-foreground'}`}>
                {diff > 0 ? `Desktop +${diff}` : diff < 0 ? `Mobile +${Math.abs(diff)}` : 'Equal'}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
