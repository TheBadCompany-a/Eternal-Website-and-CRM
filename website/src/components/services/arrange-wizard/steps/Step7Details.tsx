import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { BookingDraft } from '../../../../utils/crmBooking';
import { inputCls, labelCls, primaryBtnCls, secondaryBtnCls, stepEyebrowCls, stepSubtitleCls, stepTitleCls } from '../styles';

const isPhoneValid = (phoneStr: string): boolean => {
  const digits = phoneStr.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return /^[6-9]\d{9}$/.test(digits.slice(2));
  return digits.length === 10 && /^[6-9]\d{9}$/.test(digits);
};

interface Props {
  draft: BookingDraft;
  updateDraft: (patch: Partial<BookingDraft>) => void;
  onBack: () => void;
  onNext: () => void;
}

export const Step7Details: React.FC<Props> = ({ draft, updateDraft, onBack, onNext }) => {
  const [phoneError, setPhoneError] = useState('');

  const handleContinue = () => {
    if (!draft.contactName.trim()) return;
    if (!isPhoneValid(draft.phone)) {
      setPhoneError('Please enter a valid 10-digit mobile number (e.g. 9810000000).');
      return;
    }
    setPhoneError('');
    onNext();
  };

  return (
    <div>
      <span className={stepEyebrowCls}>Step 7 · Your Details</span>
      <h3 className={stepTitleCls}>Just the essentials</h3>
      <p className={stepSubtitleCls}>Minimal fields, asked with care rather than as a checkout form.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className={labelCls}>
            Your Name <span className="text-gold">*</span>
          </label>
          <input
            type="text"
            className={inputCls}
            value={draft.contactName}
            placeholder="e.g. Rajesh Sharma"
            onChange={(e) => updateDraft({ contactName: e.target.value })}
          />
        </div>
        <div>
          <label className={labelCls}>
            Mobile Number <span className="text-gold">*</span>
          </label>
          <input
            type="tel"
            className={inputCls}
            value={draft.phone}
            placeholder="10-digit mobile number"
            onChange={(e) => {
              updateDraft({ phone: e.target.value.replace(/[^\d+\s]/g, '') });
              if (phoneError) setPhoneError('');
            }}
          />
          {phoneError && <p className="text-xs text-red-700 mt-1.5">{phoneError}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className={labelCls}>Email (Optional)</label>
          <input
            type="email"
            className={inputCls}
            value={draft.email}
            placeholder="name@domain.com"
            onChange={(e) => updateDraft({ email: e.target.value })}
          />
        </div>
        <div>
          <label className={labelCls}>Relationship to the Deceased</label>
          <input
            type="text"
            className={inputCls}
            value={draft.relationship}
            placeholder="e.g. Son, Daughter, Spouse"
            onChange={(e) => updateDraft({ relationship: e.target.value })}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className={labelCls}>City</label>
        <input
          type="text"
          className={inputCls}
          value={draft.city}
          placeholder="e.g. Delhi, Noida, Gurugram"
          onChange={(e) => updateDraft({ city: e.target.value })}
        />
      </div>

      <div className="mb-8">
        <label className={labelCls}>Name of Your Loved One (Optional)</label>
        <input
          type="text"
          className={inputCls}
          value={draft.deceasedName}
          placeholder="So we may honour them by name"
          onChange={(e) => updateDraft({ deceasedName: e.target.value })}
        />
      </div>

      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack} className={secondaryBtnCls}>
          ← Back
        </button>
        <button type="button" onClick={handleContinue} className={primaryBtnCls} disabled={!draft.contactName.trim()}>
          <span>Review Arrangement</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
