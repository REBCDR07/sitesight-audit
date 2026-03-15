import { motion } from 'framer-motion';
import type { Strength } from '@/lib/audit-types';
import { CheckCircle2 } from 'lucide-react';

interface StrengthCardProps {
  strength: Strength;
  index: number;
}

export const StrengthCard = ({ strength, index }: StrengthCardProps) => (
  <motion.div
    className="tech-card flex items-start gap-3"
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05, duration: 0.2 }}
  >
    <CheckCircle2 className="w-4 h-4 shrink-0 text-success mt-0.5" />
    <div>
      <h3 className="font-display text-sm font-700 text-foreground">{strength.title}</h3>
      <p className="text-xs text-muted-foreground mt-1">{strength.description}</p>
    </div>
  </motion.div>
);
