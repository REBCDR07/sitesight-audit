export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type FindingCategory = 'performance' | 'seo' | 'mobile' | 'security';

export interface Finding {
  id: string;
  title: string;
  category: FindingCategory;
  severity: Severity;
  impact: string;
  description: string;
  codeSnippet?: string;
}

export interface Strength {
  id: string;
  title: string;
  category: FindingCategory;
  description: string;
}

export interface CorrectiveAction {
  id: string;
  title: string;
  severity: Severity;
  difficulty: Difficulty;
  expectedGain: string;
  description: string;
  category: FindingCategory;
}

export interface PerformanceMetrics {
  ttfb: number;
  fcp: number;
  lcp: number;
  tbt: number;
  cls: number;
  totalLoadTime: number;
  requestCount: number;
  transferSize: string;
}

export interface TechnicalInfo {
  httpStatus: number;
  sslValid: boolean;
  sslExpiry: string;
  cdnDetected: string | null;
  redirects: number;
  compression: string;
  cacheControl: string;
  securityHeaders: Record<string, boolean>;
}

export interface DimensionScore {
  label: string;
  score: number;
  weight: number;
  color: string;
}

export interface AuditReport {
  url: string;
  timestamp: string;
  globalScore: number;
  dimensions: DimensionScore[];
  performance: PerformanceMetrics;
  technical: TechnicalInfo;
  findings: Finding[];
  strengths: Strength[];
  actions: CorrectiveAction[];
}
