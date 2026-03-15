import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, Filter } from 'lucide-react';
import { ScoreRing } from '@/components/ScoreRing';
import { DimensionGauge } from '@/components/DimensionGauge';
import { FindingCard } from '@/components/FindingCard';
import { StrengthCard } from '@/components/StrengthCard';
import { ActionCard } from '@/components/ActionCard';
import { TerminalLoader } from '@/components/TerminalLoader';
import { PerformancePanel } from '@/components/PerformancePanel';
import { PerformanceCharts } from '@/components/PerformanceCharts';
import { DevicePreview } from '@/components/DevicePreview';
import { generateMockAudit } from '@/lib/mock-audit';
import { supabase } from '@/integrations/supabase/client';
import type { AuditReport, Severity } from '@/lib/audit-types';

type AppState = 'idle' | 'loading' | 'report';
type ReportTab = 'performance' | 'charts' | 'findings' | 'strengths' | 'actions' | 'preview';
type FindingFilter = 'all' | 'critical' | 'easy';

const tabs: { key: ReportTab; label: string }[] = [
  { key: 'performance', label: 'PERFORMANCE' },
  { key: 'charts', label: 'CHARTS' },
  { key: 'findings', label: 'FINDINGS' },
  { key: 'strengths', label: 'STRENGTHS' },
  { key: 'actions', label: 'ACTIONS' },
  { key: 'preview', label: 'DEVICE PREVIEW' },
];

const filterButtons: { key: FindingFilter; label: string }[] = [
  { key: 'all', label: 'ALL' },
  { key: 'critical', label: 'CRITICAL ONLY' },
  { key: 'easy', label: 'EASY WINS' },
];

const severityOrder: Record<Severity, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

const Index = () => {
  const [state, setState] = useState<AppState>('idle');
  const [url, setUrl] = useState('');
  const [report, setReport] = useState<AuditReport | null>(null);
  const [activeTab, setActiveTab] = useState<ReportTab>('performance');
  const [filter, setFilter] = useState<FindingFilter>('all');
  const [apiData, setApiData] = useState<any>(null);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setState('loading');
  }, [url]);

  const handleLoaderComplete = useCallback(async () => {
    // Try real API first, fall back to mock
    try {
      const { data, error } = await supabase.functions.invoke('pagespeed-audit', {
        body: { url },
      });

      if (!error && data && !data.error) {
        setApiData(data);
        // Build report from real data, using desktop scores for primary
        const d = data.desktop;
        const m = data.mobile;

        // Blend mobile (60%) + desktop (40%) for performance
        const perfScore = Math.round(m.scores.performance * 0.6 + d.scores.performance * 0.4);
        const seoScore = Math.round((m.scores.seo + d.scores.seo) / 2);
        const mobileScore = m.scores.performance;
        const securityScore = Math.round((m.scores.bestPractices + d.scores.bestPractices) / 2);

        const globalScore = Math.round(
          perfScore * 0.4 + seoScore * 0.25 + mobileScore * 0.2 + securityScore * 0.15
        );

        const getColor = (s: number) =>
          s >= 90 ? 'hsl(105, 100%, 55%)' : s >= 70 ? 'hsl(45, 100%, 50%)' : s >= 50 ? 'hsl(20, 100%, 60%)' : 'hsl(0, 100%, 62%)';

        // Use mock for findings/strengths/actions structure, but real metrics
        const mockReport = generateMockAudit(url);

        const realReport: AuditReport = {
          ...mockReport,
          url,
          timestamp: new Date().toISOString(),
          globalScore,
          dimensions: [
            { label: 'Performance', score: perfScore, weight: 40, color: getColor(perfScore) },
            { label: 'SEO Structure', score: seoScore, weight: 25, color: getColor(seoScore) },
            { label: 'Mobile', score: mobileScore, weight: 20, color: getColor(mobileScore) },
            { label: 'Security', score: securityScore, weight: 15, color: getColor(securityScore) },
          ],
          performance: {
            ttfb: d.metrics.ttfb,
            fcp: d.metrics.fcp,
            lcp: d.metrics.lcp,
            tbt: d.metrics.tbt,
            cls: d.metrics.cls,
            totalLoadTime: d.metrics.tti,
            requestCount: mockReport.performance.requestCount,
            transferSize: mockReport.performance.transferSize,
          },
        };

        setReport(realReport);
        setState('report');
        return;
      }
    } catch {
      // Fall through to mock
    }

    const audit = generateMockAudit(url);
    setReport(audit);
    setState('report');
  }, [url]);

  const getFilteredFindings = useCallback(() => {
    if (!report) return [];
    let items = [...report.findings].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    if (filter === 'critical') items = items.filter(f => f.severity === 'CRITICAL' || f.severity === 'HIGH');
    if (filter === 'easy') {
      const easyActionIds = report.actions.filter(a => a.difficulty === 'Easy').map(a => a.category);
      items = items.filter(f => easyActionIds.includes(f.category));
    }
    return items;
  }, [report, filter]);

  const getFilteredActions = useCallback(() => {
    if (!report) return [];
    let items = [...report.actions].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    if (filter === 'critical') items = items.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH');
    if (filter === 'easy') items = items.filter(a => a.difficulty === 'Easy');
    return items;
  }, [report, filter]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary led-active" />
            <h1 className="font-display text-lg font-800 tracking-wide text-foreground">SITESCOPE</h1>
          </div>
          {state === 'report' && (
            <button className="tech-button flex items-center gap-2 text-[10px]">
              <Download className="w-3 h-3" />
              EXPORT PDF
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {/* IDLE: URL Input Hero */}
          {state === 'idle' && (
            <motion.div
              key="idle"
              className="flex flex-col items-center justify-center min-h-[60vh]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="text-center mb-10"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="font-display text-4xl font-800 text-foreground mb-2">
                  SYSTEM STATUS: <span className="text-primary">READY</span>
                </h2>
                <p className="font-mono text-sm text-muted-foreground">
                  Enter a URL to begin full-spectrum technical audit
                </p>
              </motion.div>

              <motion.form
                onSubmit={handleSubmit}
                className="flex w-full max-w-2xl gap-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="tech-input w-full pl-11"
                    required
                  />
                </div>
                <button type="submit" className="tech-button">
                  ANALYZE
                </button>
              </motion.form>

              <motion.div
                className="flex gap-6 mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {['Performance', 'SEO', 'Mobile', 'Security'].map((dim) => (
                  <span key={dim} className="tech-label">{dim}</span>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* LOADING: Terminal Sequence */}
          {state === 'loading' && (
            <motion.div
              key="loading"
              className="flex flex-col items-center justify-center min-h-[60vh]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-4">
                <span className="tech-label">ANALYZING: <span className="text-primary">{url}</span></span>
              </div>
              <TerminalLoader onComplete={handleLoaderComplete} />
            </motion.div>
          )}

          {/* REPORT: Dashboard */}
          {state === 'report' && report && (
            <motion.div
              key="report"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {/* Report Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-xl font-800 text-foreground">
                    SYSTEM STATUS: <span className="text-success">ANALYSIS COMPLETE</span>
                  </h2>
                  <p className="font-mono text-xs text-muted-foreground mt-1">
                    {report.url} — {new Date(report.timestamp).toLocaleString()}
                    {apiData && <span className="text-primary ml-2">● LIVE DATA</span>}
                  </p>
                </div>
                <button
                  onClick={() => { setState('idle'); setReport(null); setUrl(''); setApiData(null); }}
                  className="font-mono text-xs text-primary hover:underline"
                >
                  NEW SCAN
                </button>
              </div>

              {/* Score + Dimensions Row */}
              <div className="grid grid-cols-12 gap-6 mb-6">
                <div className="col-span-12 lg:col-span-4 tech-card flex items-center justify-center">
                  <ScoreRing score={report.globalScore} />
                </div>
                <div className="col-span-12 lg:col-span-8 grid grid-cols-2 gap-4">
                  {report.dimensions.map((dim, i) => (
                    <DimensionGauge key={dim.label} dimension={dim} index={i} />
                  ))}
                </div>
              </div>

              {/* Tabs + Filter */}
              <div className="flex items-center justify-between mb-4 border-b border-border">
                <div className="flex overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`relative px-4 py-3 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors duration-150 whitespace-nowrap ${activeTab === tab.key ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {tab.label}
                      {activeTab === tab.key && (
                        <motion.div
                          layoutId="tab-underline"
                          className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                          style={{ boxShadow: '0 0 8px hsl(190 100% 50% / 0.5)' }}
                        />
                      )}
                    </button>
                  ))}
                </div>
                {(activeTab === 'findings' || activeTab === 'actions') && (
                  <div className="flex items-center gap-1">
                    <Filter className="w-3 h-3 text-muted-foreground mr-1" />
                    {filterButtons.map((fb) => (
                      <button
                        key={fb.key}
                        onClick={() => setFilter(fb.key)}
                        className={`font-mono text-[10px] px-3 py-1.5 rounded-sm border transition-all duration-150 ${filter === fb.key ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground hover:text-foreground'}`}
                      >
                        {fb.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === 'performance' && (
                  <motion.div key="perf" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <PerformancePanel metrics={report.performance} technical={report.technical} />
                  </motion.div>
                )}
                {activeTab === 'charts' && (
                  <motion.div key="charts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <PerformanceCharts metrics={report.performance} dimensions={report.dimensions} />
                  </motion.div>
                )}
                {activeTab === 'findings' && (
                  <motion.div key="findings" className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {getFilteredFindings().map((f, i) => (
                      <FindingCard key={f.id} finding={f} index={i} />
                    ))}
                    {getFilteredFindings().length === 0 && (
                      <p className="tech-label text-center py-8">No findings match the current filter</p>
                    )}
                  </motion.div>
                )}
                {activeTab === 'strengths' && (
                  <motion.div key="strengths" className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {report.strengths.map((s, i) => (
                      <StrengthCard key={s.id} strength={s} index={i} />
                    ))}
                  </motion.div>
                )}
                {activeTab === 'actions' && (
                  <motion.div key="actions" className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {getFilteredActions().map((a, i) => (
                      <ActionCard key={a.id} action={a} index={i} />
                    ))}
                    {getFilteredActions().length === 0 && (
                      <p className="tech-label text-center py-8">No actions match the current filter</p>
                    )}
                  </motion.div>
                )}
                {activeTab === 'preview' && (
                  <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <DevicePreview url={report.url} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
