import React, { useEffect, useRef, useState } from 'react';
import { stepEyebrowCls, stepSubtitleCls, stepTitleCls } from '../styles';

const SYNTHESIS_STEPS = [
  'Understanding your requirements',
  'Checking service options',
  'Preparing your plan',
  'Preparing it for coordinator review',
];

export const Step4PlanSynthesis: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [progress, setProgress] = useState(10);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 25;
        if (next >= 115) {
          clearInterval(interval);
          setTimeout(() => onDoneRef.current(), 500);
        }
        return next;
      });
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const itemClass = (idx: number) => {
    const doneThreshold = [35, 65, 90, Infinity][idx];
    const activeThreshold = idx === 0 ? -Infinity : [35, 65, 90][idx - 1];
    if (progress >= doneThreshold) return 'done';
    if (progress >= activeThreshold) return 'active';
    return '';
  };

  return (
    <div>
      <span className={stepEyebrowCls}>Step 4 · Generating the Plan</span>
      <h3 className={stepTitleCls}>Preparing your indicative arrangement</h3>
      <p className={stepSubtitleCls}>A short, visible wait — the system is working, not stalling.</p>

      <div className="max-w-md mx-auto py-6">
        <div className="h-1.5 bg-gold/15 rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-gold rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        <div className="space-y-4">
          {SYNTHESIS_STEPS.map((label, idx) => {
            const cls = itemClass(idx);
            return (
              <div key={label} className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
                    cls === 'done'
                      ? 'bg-gold text-ivory'
                      : cls === 'active'
                        ? 'bg-deep-brown text-ivory'
                        : 'bg-charcoal/10 text-charcoal/40'
                  }`}
                >
                  {cls === 'done' ? '✓' : idx + 1}
                </span>
                <span className={`text-sm ${cls ? 'text-deep-brown font-medium' : 'text-charcoal/40'}`}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
