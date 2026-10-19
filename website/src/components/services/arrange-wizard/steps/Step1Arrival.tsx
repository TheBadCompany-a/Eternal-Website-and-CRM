import React from 'react';
import { FileText, PhoneCall, ArrowRight } from 'lucide-react';
import { stepEyebrowCls, stepSubtitleCls, stepTitleCls } from '../styles';

export const Step1Arrival: React.FC<{ onNext: () => void; onSkipToHelp: () => void }> = ({ onNext, onSkipToHelp }) => {
  return (
    <div>
      <span className={stepEyebrowCls}>Step 1 · Welcome</span>
      <h3 className={stepTitleCls}>We're here to help, whenever you need us.</h3>
      <p className={stepSubtitleCls}>A calm starting point — no forms up front, just a compassionate way in.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={onNext}
          className="text-left p-6 bg-deep-brown text-ivory rounded-xs hover:bg-charcoal transition-colors cursor-pointer group"
        >
          <FileText className="w-7 h-7 text-gold mb-4" aria-hidden="true" />
          <h4 className="font-serif text-lg mb-2">Arrange a Service</h4>
          <p className="text-sm text-ivory/70 font-light leading-relaxed mb-4">
            Explore hearse transport, cremation, burial, florals, and complete arrangements.
          </p>
          <span className="text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 text-gold">
            Arrange a Service
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </button>

        <button
          type="button"
          onClick={onSkipToHelp}
          className="text-left p-6 bg-white border border-gold/25 rounded-xs hover:border-gold transition-colors cursor-pointer group"
        >
          <PhoneCall className="w-7 h-7 text-gold mb-4" aria-hidden="true" />
          <h4 className="font-serif text-lg text-deep-brown mb-2">Speak to Someone</h4>
          <p className="text-sm text-charcoal/70 font-light leading-relaxed mb-4">
            Direct line to an Eternal Repos bereavement coordinator ready to guide you.
          </p>
          <span className="text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 text-deep-brown">
            Speak to Someone
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </button>
      </div>
    </div>
  );
};
