import React, { useEffect, useState } from 'react';
import { CheckCircle2, FileText, MessageCircle, Printer } from 'lucide-react';
import type { BookingDraft, BookingReference, TrackedBooking } from '../../../../utils/crmBooking';
import { getTrackedBooking } from '../../../../utils/crmBooking';
import { secondaryBtnCls, stepEyebrowCls, stepSubtitleCls, stepTitleCls } from '../styles';

const PHONE_DISPLAY = '+91 84486 61338';
const PHONE_TEL = 'tel:+918448661338';
const WHATSAPP_URL = 'https://wa.me/918448661338?text=Hello%2C%20I%20just%20submitted%20a%20service%20request%20on%20your%20website.';

const TRACKING_STAGES = [
  'Arrangement Confirmed',
  'Team Assigned',
  'Vehicle Preparing',
  'Vehicle En Route',
  'Arrived at Location',
  'Service Completed',
];

const summaryRows = (d: BookingDraft): [string, string][] =>
  (
    [
      ['Service needed', d.needCategory],
      ['Pickup location', d.pickupLocation],
      ['Destination', d.destinationLocation],
      ['Date', d.date],
      ['Time', d.time],
      ['Services chosen', d.services.join(', ')],
      ['Name of loved one', d.deceasedName],
      ['Relationship', d.relationship],
      ['Contact person', d.contactName],
      ['Phone', d.phone],
      ['Email', d.email],
      ['Notes', d.notes],
    ] as [string, string][]
  ).filter(([, v]) => v && v.trim());

export const Step9Confirmation: React.FC<{ bookingRef: BookingReference; summary: BookingDraft }> = ({ bookingRef, summary }) => {
  const rows = summaryRows(summary);
  const [tracked, setTracked] = useState<TrackedBooking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getTrackedBooking(bookingRef)
      .then((result) => {
        if (!cancelled) setTracked(result);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bookingRef]);

  const stage = tracked?.customerTrackingStage ?? 1;
  const fillPercent = Math.min(100, Math.max(10, ((stage - 1) / (TRACKING_STAGES.length - 1)) * 100));

  return (
    <div className="text-center max-w-xl mx-auto">
      <CheckCircle2 className="w-14 h-14 text-gold mx-auto mb-4" />
      <span className={`${stepEyebrowCls} justify-center flex`}>Step 9 · Request Received</span>
      <h3 className={stepTitleCls}>We've Received Your Request</h3>
      <p className={stepSubtitleCls}>A reference ID and a visible path forward — nothing left ambiguous.</p>

      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/15 border border-gold/30 rounded-full text-sm font-semibold text-deep-brown mb-8">
        <FileText className="w-4 h-4 text-gold" />
        Reference ID: {bookingRef.id}
      </div>

      {!loading && tracked && (
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.2em] text-charcoal/50 font-semibold mb-4">
            Live Arrangement Progress
          </p>
          <div className="relative">
            <div className="absolute top-3 left-0 right-0 h-0.5 bg-gold/15">
              <div className="h-full bg-gold transition-all duration-700" style={{ width: `${fillPercent}%` }} />
            </div>
            <div className="relative flex justify-between">
              {TRACKING_STAGES.map((label, idx) => {
                const stepIndex = idx + 1;
                const done = stepIndex < stage;
                const current = stepIndex === stage;
                return (
                  <div key={label} className="flex flex-col items-center gap-2 flex-1">
                    <span
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold bg-ivory ${
                        done || current ? 'border-gold text-gold' : 'border-charcoal/15 text-charcoal/30'
                      }`}
                    >
                      {done ? '✓' : ''}
                    </span>
                    <span className={`text-[9px] leading-tight max-w-[64px] ${done || current ? 'text-deep-brown font-medium' : 'text-charcoal/35'}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-gold/25 rounded-xs p-6 mb-6 text-left">
        <p className="text-[11px] uppercase tracking-[0.2em] text-gold font-semibold mb-1.5">
          Your Dedicated Coordinator
        </p>
        <h4 className="font-serif text-xl text-deep-brown mb-1">Eternal Repos Care Team</h4>
        <p className="text-xs text-charcoal/60 mb-4">Direct Contact: {PHONE_DISPLAY} · Online &amp; Coordinating</p>
        <div className="flex flex-wrap gap-3">
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={secondaryBtnCls}>
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </a>
          <a href={PHONE_TEL} className={secondaryBtnCls}>
            Call Coordinator
          </a>
        </div>
      </div>

      {rows.length > 0 && (
        <div id="print-summary" className="bg-white border border-gold/25 rounded-xs mb-6 text-left overflow-hidden">
          <div className="print-only hidden px-6 pt-6 pb-2">
            <p className="font-serif text-2xl text-deep-brown">Eternal Repos</p>
            <p className="text-xs text-charcoal/60">Tribute in Motion · +91 84486 61338 · care@eternalrepos.com</p>
            <p className="text-sm mt-3">Service request summary · Reference ID: <strong>{bookingRef.id}</strong></p>
          </div>
          <p className="no-print text-[11px] uppercase tracking-[0.2em] text-gold font-semibold px-6 pt-5 pb-2">
            What you told us
          </p>
          <dl className="divide-y divide-gold/10">
            {rows.map(([key, val]) => (
              <div key={key} className="flex justify-between gap-6 px-6 py-3 text-sm">
                <dt className="text-charcoal/55 shrink-0">{key}</dt>
                <dd className="font-medium text-deep-brown text-right whitespace-pre-wrap">{val}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <button type="button" onClick={() => window.print()} className={`${secondaryBtnCls} mx-auto`}>
        <Printer className="w-4 h-4" /> Print Summary
      </button>
    </div>
  );
};
