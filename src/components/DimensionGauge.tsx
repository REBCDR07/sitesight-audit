import { motion } from 'framer-motion';
import type { DimensionScore } from '@/lib/audit-types';

interface DimensionGaugeProps {
  dimension: DimensionScore;
  index: number;
}

export const DimensionGauge = ({ dimension, index }: DimensionGaugeProps) => {
  const { label, score, weight, color } = dimension;

  return (
    <motion.div
      className="tech-card flex flex-col gap-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
    >
      <div className="flex items-baseline justify-between">
        <span className="tech-label">{label}</span>
        <span className="tech-label">{weight}%</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-2xl tabular" style={{ color }}>{score}</span>
        <span className="font-mono text-xs text-muted-foreground">/ 100</span>
      </div>
      <div className="h-1 w-full rounded-sm bg-border overflow-hidden">
        <motion.div
          className="h-full rounded-sm"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 + index * 0.1 }}
        />
      </div>
    </motion.div>
  );
};
