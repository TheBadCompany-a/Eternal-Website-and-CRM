import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import type { BookingDraft } from '../../../../utils/crmBooking';
import { calculatePricing } from '../pricing';
import { primaryBtnCls, secondaryBtnCls, stepEyebrowCls, stepSubtitleCls, stepTitleCls } from '../styles';

interface Props {
  draft: BookingDraft;
  onBack: () => void;
  onTalkToSomeone: () => void;
  onNext: () => void;
}

export const Step5ThePlan: React.FC<Props> = ({ draft, onBack, onTalkToSomeone, onNext }) => {
  const { baseMin, baseMax } = calculatePricing(draft);

  return (
    <div>
      <span className={stepEyebrowCls}>Step 5 · The Plan</span>
      <h3 className={stepTitleCls}>Your Indicative Arrangement</h3>
      <p className={stepSubtitleCls}>Clearly marked as indicative — pricing and availability still need a person.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <div className="bg-ivory border border-gold/20 rounded-xs p-5 space-y-3">
          <div className="flex justify-between text-sm border-b border-gold/10 pb-2">
            <span className="text-charcoal/60">Service</span>
            <span className="font-semibold text-deep-brown text-right">{draft.needCategory}</span>
          </div>
          <div className="flex justify-between text-sm border-b border-gold/10 pb-2">
            <span className="text-charcoal/60">Pickup</span>
            <span className="font-semibold text-deep-brown text-right">{draft.pickupLocation || 'To be confirmed'}</span>
          </div>
          <div className="flex justify-between text-sm border-b border-gold/10 pb-2">
            <span className="text-charcoal/60">Destination</span>
            <span className="font-semibold text-deep-brown text-right">{draft.destinationLocation || 'To be confirmed'}</span>
          </div>
          {draft.services.length > 0 && (
            <div className="pt-1">
              <span className="text-charcoal/60 text-sm block mb-2">Additional Services</span>
              <div className="flex flex-wrap gap-1.5">
                {draft.services.map((s) => (
                  <span key={s} className="text-[11px] px-2.5 py-1 bg-gold/15 text-deep-brown rounded-full font-medium">
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-deep-brown text-ivory rounded-xs p-5 flex flex-col justify-center">
          <span className="text-[11px] uppercase tracking-wider text-gold font-semibold mb-2">Estimated Range</span>
          <div className="font-serif text-3xl font-semibold mb-2">
            ₹{baseMin.toLocaleString('en-IN')} – ₹{baseMax.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-ivory/60 font-light leading-relaxed">
            Final availability and pricing will be confirmed by an Eternal Repos coordinator.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-ivory/50 mt-4 pt-3 border-t border-ivory/15">
            <ShieldCheck className="w-3.5 h-3.5 text-gold shrink-0" />
            Indicative Plan · Verified by lead coordinator before confirmation
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={onBack} className={secondaryBtnCls}>
          ← Adjust Requirements
        </button>
        <div className="flex gap-3">
          <button type="button" onClick={onTalkToSomeone} className={secondaryBtnCls}>
            Talk to a Coordinator
          </button>
          <button type="button" onClick={onNext} className={primaryBtnCls}>
            <span>Continue Booking</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
