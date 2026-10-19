import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { BookingDraft, NeedCategory } from '../../../../utils/crmBooking';
import { primaryBtnCls, secondaryBtnCls, stepEyebrowCls, stepSubtitleCls, stepTitleCls } from '../styles';

const NEED_OPTIONS: { category: NeedCategory; title: string; desc: string }[] = [
  {
    category: 'Immediate Arrangement',
    title: 'Immediate Arrangement',
    desc: 'Passing has just occurred. Urgent hearse transport, hospital clearance, and cremation slots.',
  },
  {
    category: 'Planned Arrangement',
    title: 'Planned Arrangement',
    desc: 'Services scheduled for later today, tomorrow, or upcoming days with family ceremonies.',
  },
  {
    category: 'Transfer / Transportation',
    title: 'Transfer / Transportation',
    desc: 'Inter-city ambulance hearse, domestic flight cargo transfer, or mortuary freezer transit.',
  },
  {
    category: 'Not Sure — Guide Me',
    title: 'Not Sure — Guide Me',
    desc: 'Let our coordinator explain the essential steps and help you choose the right options.',
  },
];

interface Props {
  draft: BookingDraft;
  updateDraft: (patch: Partial<BookingDraft>) => void;
  onBack: () => void;
  onNext: () => void;
}

export const Step2ChooseNeed: React.FC<Props> = ({ draft, updateDraft, onBack, onNext }) => {
  return (
    <div>
      <span className={stepEyebrowCls}>Step 2 · Choose What You Need</span>
      <h3 className={stepTitleCls}>How can we help you today?</h3>
      <p className={stepSubtitleCls}>One question, four honest paths — nothing assumes urgency or calm.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {NEED_OPTIONS.map((opt) => {
          const selected = draft.needCategory === opt.category;
          return (
            <button
              type="button"
              key={opt.category}
              onClick={() => updateDraft({ needCategory: opt.category })}
              className={`text-left p-4 rounded-xs border transition-colors cursor-pointer ${
                selected ? 'border-gold bg-gold/10' : 'border-gold/20 bg-white hover:border-gold/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 w-4 h-4 rounded-full border shrink-0 ${
                    selected ? 'border-gold bg-gold' : 'border-charcoal/30'
                  }`}
                />
                <div>
                  <h4 className="font-semibold text-sm text-deep-brown mb-1">{opt.title}</h4>
                  <p className="text-xs text-charcoal/65 font-light leading-relaxed">{opt.desc}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack} className={secondaryBtnCls}>
          ← Back
        </button>
        <button type="button" onClick={onNext} className={primaryBtnCls}>
          <span>Continue to Requirements</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
