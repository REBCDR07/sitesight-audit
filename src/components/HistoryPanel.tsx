import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

interface HistoryEntry {
  id: string;
  url: string;
  created_at: string;
  global_score: number;
  mobile_scores: any;
  desktop_scores: any;
  dimensions: any;
}

interface HistoryPanelProps {
  currentUrl: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-sm px-3 py-2 font-mono text-xs">
      <p className="text-foreground font-medium mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.stroke }} className="mt-0.5">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export const HistoryPanel = ({ currentUrl }: HistoryPanelProps) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      // Normalize URL for matching
      const normalized = currentUrl.replace(/\/$/, '').toLowerCase();
      
      const { data, error } = await supabase
        .from('audit_history')
        .select('id, url, created_at, global_score, mobile_scores, desktop_scores, dimensions')
        .or(`url.ilike.%${new URL(normalized).hostname}%`)
        .order('created_at', { ascending: true })
        .limit(50);

      if (!error && data) {
        setHistory(data as HistoryEntry[]);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [currentUrl]);

  if (loading) {
    return (
      <div className="tech-card flex items-center justify-center py-12">
        <span className="tech-label animate-pulse">LOADING HISTORY...</span>
      </div>
    );
  }

  if (history.length < 2) {
    return (
      <div className="tech-card flex flex-col items-center justify-center py-12">
        <Clock className="w-8 h-8 text-muted-foreground mb-3" />
        <span className="tech-label mb-1">INSUFFICIENT HISTORY DATA</span>
        <p className="font-mono text-xs text-muted-foreground text-center max-w-md">
          Run at least 2 audits on this domain to see trends. Each audit is automatically saved.
        </p>
      </div>
    );
  }

  // Build trend data
  const trendData = history.map(h => ({
    date: new Date(h.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    'Score Global': h.global_score,
    'Perf Mobile': h.mobile_scores?.performance ?? 0,
    'Perf Desktop': h.desktop_scores?.performance ?? 0,
    'SEO': h.mobile_scores?.seo ?? 0,
  }));

  // Calculate trend
  const latest = history[history.length - 1];
  const previous = history[history.length - 2];
  const scoreDiff = latest.global_score - previous.global_score;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Trend summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="tech-card text-center">
          <span className="tech-label">AUDITS COUNT</span>
          <p className="font-display text-2xl text-foreground mt-1 tabular">{history.length}</p>
        </div>
        <div className="tech-card text-center">
          <span className="tech-label">LATEST SCORE</span>
          <p className="font-display text-2xl tabular mt-1" style={{
            color: latest.global_score >= 90 ? 'hsl(105, 100%, 55%)' : latest.global_score >= 70 ? 'hsl(45, 100%, 50%)' : 'hsl(0, 100%, 62%)'
          }}>
            {latest.global_score}
          </p>
        </div>
        <div className="tech-card text-center">
          <span className="tech-label">TREND</span>
          <div className="flex items-center justify-center gap-1 mt-1">
            {scoreDiff > 0 ? (
              <TrendingUp className="w-5 h-5 text-success" />
            ) : scoreDiff < 0 ? (
              <TrendingDown className="w-5 h-5 text-critical" />
            ) : (
              <Minus className="w-5 h-5 text-muted-foreground" />
            )}
            <span className={`font-display text-2xl tabular ${scoreDiff > 0 ? 'text-success' : scoreDiff < 0 ? 'text-critical' : 'text-muted-foreground'}`}>
              {scoreDiff > 0 ? '+' : ''}{scoreDiff}
            </span>
          </div>
        </div>
      </div>

      {/* Score evolution chart */}
      <div className="tech-card">
        <h3 className="tech-label mb-4">SCORE EVOLUTION</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 25%, 14%)" />
              <XAxis
                dataKey="date"
                tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: 'hsl(222, 25%, 14%)' }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: 'hsl(222, 25%, 14%)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: 10 }} />
              <Line type="monotone" dataKey="Score Global" stroke="hsl(190, 100%, 50%)" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Perf Mobile" stroke="hsl(45, 100%, 50%)" strokeWidth={1.5} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="Perf Desktop" stroke="hsl(105, 100%, 55%)" strokeWidth={1.5} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="SEO" stroke="hsl(280, 80%, 60%)" strokeWidth={1.5} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* History table */}
      <div className="tech-card">
        <h3 className="tech-label mb-3">AUDIT LOG</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="tech-label text-left py-2 pr-4">DATE</th>
                <th className="tech-label text-right py-2 px-2">SCORE</th>
                <th className="tech-label text-right py-2 px-2">PERF M</th>
                <th className="tech-label text-right py-2 px-2">PERF D</th>
                <th className="tech-label text-right py-2 px-2">SEO</th>
                <th className="tech-label text-right py-2 pl-2">DELTA</th>
              </tr>
            </thead>
            <tbody>
              {[...history].reverse().map((h, i) => {
                const prevEntry = history[history.indexOf(h) - 1];
                const delta = prevEntry ? h.global_score - prevEntry.global_score : 0;
                return (
                  <tr key={h.id} className="border-b border-border last:border-0">
                    <td className="font-mono text-xs text-muted-foreground py-2 pr-4">
                      {new Date(h.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="font-mono text-sm tabular text-right py-2 px-2" style={{
                      color: h.global_score >= 90 ? 'hsl(105, 100%, 55%)' : h.global_score >= 70 ? 'hsl(45, 100%, 50%)' : 'hsl(0, 100%, 62%)'
                    }}>
                      {h.global_score}
                    </td>
                    <td className="font-mono text-xs tabular text-right py-2 px-2 text-muted-foreground">
                      {h.mobile_scores?.performance ?? '-'}
                    </td>
                    <td className="font-mono text-xs tabular text-right py-2 px-2 text-muted-foreground">
                      {h.desktop_scores?.performance ?? '-'}
                    </td>
                    <td className="font-mono text-xs tabular text-right py-2 px-2 text-muted-foreground">
                      {h.mobile_scores?.seo ?? '-'}
                    </td>
                    <td className={`font-mono text-xs tabular text-right py-2 pl-2 ${delta > 0 ? 'text-success' : delta < 0 ? 'text-critical' : 'text-muted-foreground'}`}>
                      {i < history.length - 1 ? (delta > 0 ? `+${delta}` : `${delta}`) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
