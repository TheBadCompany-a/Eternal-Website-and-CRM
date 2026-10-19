import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { BookingDraft } from '../../../../utils/crmBooking';
import { inputCls, labelCls, primaryBtnCls, secondaryBtnCls, stepEyebrowCls, stepSubtitleCls, stepTitleCls } from '../styles';

const ALL_SERVICES = [
  'Hearse / transportation',
  'Family transportation',
  'Cremation coordination',
  'Burial coordination',
  'Documentation assistance',
  'Floral arrangements',
  'Priest / religious arrangements',
  'Airport transfer',
  'Other',
];

interface Props {
  draft: BookingDraft;
  updateDraft: (patch: Partial<BookingDraft>) => void;
  onBack: () => void;
  onNext: () => void;
}

export const Step3Requirements: React.FC<Props> = ({ draft, updateDraft, onBack, onNext }) => {
  const toggleService = (service: string) => {
    const services = draft.services.includes(service)
      ? draft.services.filter((s) => s !== service)
      : [...draft.services, service];
    updateDraft({ services });
  };

  return (
    <div>
      <span className={stepEyebrowCls}>Step 3 · Tell Us the Requirements</span>
      <h3 className={stepTitleCls}>Tell us the requirements</h3>
      <p className={stepSubtitleCls}>
        Only what's needed to prepare an indicative plan — your coordinator fills in the rest.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className={labelCls}>Pickup Location</label>
          <input
            type="text"
            className={inputCls}
            value={draft.pickupLocation}
            placeholder="e.g. Hospital / Residence"
            onChange={(e) => updateDraft({ pickupLocation: e.target.value })}
          />
        </div>
        <div>
          <label className={labelCls}>Destination</label>
          <input
            type="text"
            className={inputCls}
            value={draft.destinationLocation}
            placeholder="e.g. Crematorium / Cemetery"
            onChange={(e) => updateDraft({ destinationLocation: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className={labelCls}>Date</label>
          <input type="date" className={inputCls} value={draft.date} onChange={(e) => updateDraft({ date: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>Preferred Time</label>
          <select className={inputCls} value={draft.time} onChange={(e) => updateDraft({ time: e.target.value })}>
            <option value="">Select</option>
            <option value="10:00 AM">10:00 AM</option>
            <option value="11:30 AM">11:30 AM</option>
            <option value="02:30 PM">02:30 PM</option>
            <option value="04:00 PM">04:00 PM</option>
            <option value="Immediate">Immediate Next Available</option>
          </select>
        </div>
      </div>

      <label className={labelCls}>Services Needed</label>
      <div className="flex flex-wrap gap-2 mb-6">
        {ALL_SERVICES.map((service) => {
          const selected = draft.services.includes(service);
          return (
            <button
              type="button"
              key={service}
              onClick={() => toggleService(service)}
              className={`px-3.5 py-2 rounded-full text-xs font-medium border transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                selected ? 'bg-deep-brown text-ivory border-deep-brown' : 'bg-white text-deep-brown border-gold/25 hover:border-gold'
              }`}
            >
              <span>{selected ? '✓' : '+'}</span> {service}
            </button>
          );
        })}
      </div>

      <div className="mb-8">
        <label className={labelCls}>Anything else we should know?</label>
        <textarea
          rows={3}
          className={`${inputCls} resize-none`}
          value={draft.notes}
          placeholder="Optional notes (custom traditions, floral colors, special assistance...)"
          onChange={(e) => updateDraft({ notes: e.target.value })}
        />
      </div>

      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack} className={secondaryBtnCls}>
          ← Back
        </button>
        <button type="button" onClick={onNext} className={primaryBtnCls}>
          <span>Prepare Indicative Plan</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
