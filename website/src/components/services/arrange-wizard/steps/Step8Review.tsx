import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { BookingDraft, BookingReference } from '../../../../utils/crmBooking';
import { submitCrmBooking, saveBookingRef, saveBookingSummary } from '../../../../utils/crmBooking';
import { primaryBtnCls, secondaryBtnCls, stepEyebrowCls, stepSubtitleCls, stepTitleCls } from '../styles';

const PHONE_TEL = 'tel:+918448661338';

interface Props {
  draft: BookingDraft;
  onBack: () => void;
  onSubmitted: (ref: BookingReference) => void;
}

export const Step8Review: React.FC<Props> = ({ draft, onBack, onSubmitted }) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(false);
    try {
      const ref = await submitCrmBooking(draft);
      saveBookingRef(ref);
      saveBookingSummary(draft);
      onSubmitted(ref);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const rows: [string, string][] = [
    ['Service', draft.needCategory],
    ['Pickup', draft.pickupLocation || 'To be confirmed'],
    ['Destination', draft.destinationLocation || 'To be confirmed'],
    ['Date & Time', `${draft.date}${draft.time ? ` · ${draft.time}` : ''}`],
    ['Services', draft.services.join(' + ') || 'Hearse / transportation'],
    ['Contact', `${draft.contactName} · ${draft.phone}`],
  ];

  return (
    <div>
      <span className={stepEyebrowCls}>Step 8 · Review</span>
      <h3 className={stepTitleCls}>Review Your Arrangement</h3>
      <p className={stepSubtitleCls}>
        Everything in one quiet summary — deliberately not styled like an e-commerce checkout.
      </p>

      <div className="bg-ivory border border-gold/20 rounded-xs overflow-hidden mb-6">
        <div className="bg-deep-brown text-ivory px-5 py-3 flex items-center justify-between">
          <h4 className="font-serif text-base">Arrangement Summary</h4>
          <span className="text-[11px] opacity-80">Indicative</span>
        </div>
        <div className="divide-y divide-gold/10">
          {rows.map(([key, val]) => (
            <div key={key} className="flex justify-between px-5 py-3 text-sm">
              <span className="text-charcoal/55">{key}</span>
              <span className="font-medium text-deep-brown text-right">{val}</span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-xs px-4 py-3 mb-6" role="alert">
          We could not send your request just now. Please try again, or call us on{' '}
          <a href={PHONE_TEL} className="font-semibold underline">
            +91 84486 61338
          </a>
          .
        </p>
      )}

      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack} className={secondaryBtnCls} disabled={submitting}>
          ← Edit Details
        </button>
        <button type="button" onClick={handleSubmit} className={primaryBtnCls} disabled={submitting}>
          <span>{submitting ? 'Sending…' : 'Request Confirmation'}</span>
          {!submitting && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
