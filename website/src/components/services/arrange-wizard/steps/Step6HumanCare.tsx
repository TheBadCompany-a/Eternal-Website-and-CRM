import React from 'react';
import { ArrowRight, MessageCircle, PhoneCall, Pencil } from 'lucide-react';
import { secondaryBtnCls, stepEyebrowCls, stepSubtitleCls, stepTitleCls, primaryBtnCls } from '../styles';

const PHONE_DISPLAY = '+91 84486 61338';
const PHONE_TEL = 'tel:+918448661338';
const WHATSAPP_URL =
  'https://wa.me/918448661338?text=Hello%20Eternal%20Team%2C%20I%20am%20mid-way%20through%20arranging%20a%20service%20on%20your%20website%20and%20would%20like%20some%20help.';

export const Step6HumanCare: React.FC<{ onBack: () => void; onNext: () => void }> = ({ onBack, onNext }) => {
  return (
    <div>
      <span className={stepEyebrowCls}>Step 6 · Human Assistance</span>
      <h3 className={stepTitleCls}>Let us take it from here</h3>
      <p className={stepSubtitleCls}>
        Reachable at any point in the flow — the system should never feel like the only option.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <a
          href={PHONE_TEL}
          className="text-left p-5 bg-white border border-gold/25 rounded-xs hover:border-gold transition-colors"
        >
          <PhoneCall className="w-6 h-6 text-gold mb-3" aria-hidden="true" />
          <h4 className="font-serif text-base text-deep-brown mb-1">Call Coordinator</h4>
          <p className="text-xs text-charcoal/60 font-light">{PHONE_DISPLAY}</p>
        </a>

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-left p-5 bg-white border border-gold/25 rounded-xs hover:border-gold transition-colors"
        >
          <MessageCircle className="w-6 h-6 text-gold mb-3" aria-hidden="true" />
          <h4 className="font-serif text-base text-deep-brown mb-1">WhatsApp Us</h4>
          <p className="text-xs text-charcoal/60 font-light">Message directly with our team</p>
        </a>

        <button
          type="button"
          onClick={onNext}
          className="text-left p-5 bg-white border border-gold/25 rounded-xs hover:border-gold transition-colors cursor-pointer"
        >
          <Pencil className="w-6 h-6 text-gold mb-3" aria-hidden="true" />
          <h4 className="font-serif text-base text-deep-brown mb-1">Continue Independently</h4>
          <p className="text-xs text-charcoal/60 font-light">Carry on with the online form</p>
        </button>
      </div>

      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack} className={secondaryBtnCls}>
          ← Back to Plan
        </button>
        <button type="button" onClick={onNext} className={primaryBtnCls}>
          <span>Proceed to Details</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
