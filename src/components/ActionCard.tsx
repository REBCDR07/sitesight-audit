import { motion } from 'framer-motion';
import type { CorrectiveAction } from '@/lib/audit-types';
import { Wrench } from 'lucide-react';

const difficultyColor: Record<string, string> = {
  Easy: 'text-success',
  Medium: 'text-alert',
  Hard: 'text-critical',
};

interface ActionCardProps {
  action: CorrectiveAction;
  index: number;
}

export const ActionCard = ({ action, index }: ActionCardProps) => (
  <motion.div
    className="tech-card"
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05, duration: 0.2 }}
  >
    <div className="flex items-start justify-between gap-3 mb-2">
      <div className="flex items-center gap-2">
        <Wrench className="w-4 h-4 shrink-0 text-primary" />
        <h3 className="font-display text-sm font-700 text-foreground">{action.title}</h3>
      </div>
      <span className="font-mono text-xs text-success tabular shrink-0">{action.expectedGain}</span>
    </div>
    <p className="text-xs text-muted-foreground mb-3">{action.description}</p>
    <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.15em]">
      <span className="text-muted-foreground">Difficulty: <span className={difficultyColor[action.difficulty]}>{action.difficulty}</span></span>
      <span className="text-muted-foreground">Priority: <span className="text-foreground">{action.severity}</span></span>
    </div>
  </motion.div>
);
