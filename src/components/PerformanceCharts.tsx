import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell,
} from 'recharts';
import type { PerformanceMetrics, DimensionScore } from '@/lib/audit-types';

interface PerformanceChartsProps {
  metrics: PerformanceMetrics;
  dimensions: DimensionScore[];
}

const METRIC_THRESHOLDS: Record<string, { good: number; label: string; unit: string }> = {
  ttfb: { good: 500, label: 'TTFB', unit: 'ms' },
  fcp: { good: 1.8, label: 'FCP', unit: 's' },
  lcp: { good: 2.5, label: 'LCP', unit: 's' },
  tbt: { good: 200, label: 'TBT', unit: 'ms' },
  cls: { good: 0.1, label: 'CLS', unit: '' },
};

const getMetricColor = (key: string, value: number) => {
  const t = METRIC_THRESHOLDS[key];
  if (!t) return 'hsl(190, 100%, 50%)';
  if (value <= t.good) return 'hsl(105, 100%, 55%)';
  if (value <= t.good * 2) return 'hsl(45, 100%, 50%)';
  return 'hsl(0, 100%, 62%)';
};

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

export const PerformanceCharts = ({ metrics, dimensions }: PerformanceChartsProps) => {
  // Bar chart data for Core Web Vitals
  const barData = Object.entries(METRIC_THRESHOLDS).map(([key, t]) => ({
    name: t.label,
    value: metrics[key as keyof PerformanceMetrics] as number,
    fill: getMetricColor(key, metrics[key as keyof PerformanceMetrics] as number),
    unit: t.unit,
    threshold: t.good,
  }));

  // Radar chart data for dimension scores
  const radarData = dimensions.map(d => ({
    dimension: d.label,
    score: d.score,
    fullMark: 100,
  }));

  // Pie chart for score distribution
  const pieData = dimensions.map(d => ({
    name: d.label,
    value: d.weight,
    score: d.score,
    fill: d.color,
  }));

  return (
    <motion.div
      className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Core Web Vitals Bar Chart */}
      <div className="tech-card">
        <h3 className="tech-label mb-4">CORE WEB VITALS BREAKDOWN</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 25%, 14%)" />
              <XAxis
                dataKey="name"
                tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: 'hsl(222, 25%, 14%)' }}
              />
              <YAxis
                tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: 'hsl(222, 25%, 14%)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dimension Radar Chart */}
      <div className="tech-card">
        <h3 className="tech-label mb-4">DIMENSION RADAR</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(222, 25%, 14%)" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 9, fontFamily: 'JetBrains Mono' }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 9 }}
                axisLine={false}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="hsl(190, 100%, 50%)"
                fill="hsl(190, 100%, 50%)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Score Distribution Pie */}
      <div className="tech-card">
        <h3 className="tech-label mb-4">SCORE WEIGHT DISTRIBUTION</h3>
        <div className="h-[250px] flex items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                paddingAngle={3}
                strokeWidth={0}
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-surface border border-border rounded-sm px-3 py-2 font-mono text-xs">
                    <p className="text-foreground font-medium">{d.name}</p>
                    <p className="text-muted-foreground">Weight: {d.value}%</p>
                    <p style={{ color: d.fill }}>Score: {d.score}/100</p>
                  </div>
                );
              }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 pr-4">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.fill }} />
                <span className="font-mono text-[9px] text-muted-foreground whitespace-nowrap">
                  {d.name} ({d.value}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Threshold Comparison */}
      <div className="tech-card">
        <h3 className="tech-label mb-4">VS. GOOD THRESHOLDS</h3>
        <div className="space-y-3">
          {barData.map(d => {
            const pct = Math.min((d.value / (d.threshold * 3)) * 100, 100);
            const thresholdPct = (d.threshold / (d.threshold * 3)) * 100;
            return (
              <div key={d.name}>
                <div className="flex justify-between mb-1">
                  <span className="font-mono text-[10px] text-muted-foreground">{d.name}</span>
                  <span className="font-mono text-[10px]" style={{ color: d.fill }}>
                    {d.value}{d.unit}
                  </span>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="absolute h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: d.fill }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-px bg-success"
                    style={{ left: `${thresholdPct}%` }}
                    title={`Good: ≤${d.threshold}${d.unit}`}
                  />
                </div>
              </div>
            );
          })}
          <div className="flex items-center gap-2 mt-2">
            <div className="w-px h-3 bg-success" />
            <span className="font-mono text-[9px] text-muted-foreground">= "Good" threshold</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
