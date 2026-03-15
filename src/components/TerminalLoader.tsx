import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TerminalLoaderProps {
  onComplete: () => void;
}

const steps = [
  { label: '[SYSTEM] Fetching headers and SSL status...', duration: 1200 },
  { label: '[SYSTEM] Parsing DOM structure and semantic tags...', duration: 1500 },
  { label: '[SYSTEM] Calculating performance scores...', duration: 1000 },
];

export const TerminalLoader = ({ onComplete }: TerminalLoaderProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);

  const advanceStep = useCallback(() => {
    if (currentStep < steps.length) {
      setCompleted(prev => [...prev, currentStep]);
      if (currentStep + 1 < steps.length) {
        setCurrentStep(prev => prev + 1);
      } else {
        setTimeout(onComplete, 400);
      }
    }
  }, [currentStep, onComplete]);

  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(advanceStep, steps[currentStep].duration);
      return () => clearTimeout(timer);
    }
  }, [currentStep, advanceStep]);

  return (
    <motion.div
      className="tech-card max-w-xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-critical" />
        <div className="w-2 h-2 rounded-full bg-alert" />
        <div className="w-2 h-2 rounded-full bg-success" />
        <span className="tech-label ml-2">SITESCOPE TERMINAL</span>
      </div>
      <div className="space-y-2">
        <AnimatePresence>
          {steps.map((step, i) => (
            i <= currentStep && (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2"
              >
                <span className={`font-mono text-xs ${completed.includes(i) ? 'text-success' : 'text-primary'}`}>
                  {completed.includes(i) ? '✓' : '›'}
                </span>
                <span className="font-mono text-xs text-muted-foreground">{step.label}</span>
                {!completed.includes(i) && (
                  <span className="font-mono text-xs text-primary animate-terminal-blink">_</span>
                )}
              </motion.div>
            )
          ))}
        </AnimatePresence>
      </div>
      <div className="mt-4 h-1 bg-border rounded-sm overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${((completed.length) / steps.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
};
