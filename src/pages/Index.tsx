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
import { generateMockAudit } from '@/lib/mock-audit';
import type { AuditReport, Severity } from '@/lib/audit-types';

type AppState = 'idle' | 'loading' | 'report';
type ReportTab = 'performance' | 'findings' | 'strengths' | 'actions';
type FindingFilter = 'all' | 'critical' | 'easy';

const tabs: { key: ReportTab; label: string }[] = [
  { key: 'performance', label: 'PERFORMANCE' },
  { key: 'findings', label: 'FINDINGS' },
  { key: 'strengths', label: 'STRENGTHS' },
  { key: 'actions', label: 'ACTIONS' },
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

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setState('loading');
  }, [url]);

  const handleLoaderComplete = useCallback(() => {
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
                  </p>
                </div>
                <button
                  onClick={() => { setState('idle'); setReport(null); setUrl(''); }}
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
                <div className="flex">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`relative px-4 py-3 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors duration-150 ${activeTab === tab.key ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
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
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
