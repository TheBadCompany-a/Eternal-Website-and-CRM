import React from 'react';

const STEP_NAMES = [
  { num: 1, name: 'Arrival' },
  { num: 2, name: 'Choose Need' },
  { num: 3, name: 'Requirements' },
  { num: 4, name: 'Plan Synthesis' },
  { num: 5, name: 'The Plan' },
  { num: 6, name: 'Human Care' },
  { num: 7, name: 'Details' },
  { num: 8, name: 'Review' },
  { num: 9, name: 'Confirmation' },
];

export const StepRail: React.FC<{ currentStep: number; onGoToStep: (n: number) => void }> = ({
  currentStep,
  onGoToStep,
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto px-4 sm:px-6 py-3.5 bg-ivory border-b border-gold/20 custom-scrollbar">
      {STEP_NAMES.map((s) => {
        const isActive = s.num === currentStep;
        const isDone = s.num < currentStep;
        return (
          <button
            key={s.num}
            type="button"
            onClick={() => isDone && onGoToStep(s.num)}
            disabled={!isDone}
            className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wide transition-colors ${
              isActive
                ? 'bg-deep-brown text-ivory'
                : isDone
                  ? 'bg-gold/15 text-deep-brown cursor-pointer hover:bg-gold/25'
                  : 'bg-transparent text-charcoal/35 cursor-default'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                isActive ? 'bg-gold text-ivory' : isDone ? 'bg-gold/40 text-deep-brown' : 'bg-charcoal/10 text-charcoal/40'
              }`}
            >
              {isDone ? '✓' : s.num}
            </span>
            <span className="hidden sm:inline">{s.name}</span>
          </button>
        );
      })}
    </div>
  );
};
