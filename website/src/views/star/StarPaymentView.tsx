import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Star } from 'lucide-react';
import { updatePageSEO } from '../../utils/seo';
import { StarPaymentPanel } from './StarPaymentPanel';

// Opened from the booking confirmation: pay the star by UPI and report the reference.
export const StarPaymentView: React.FC = () => {
  const [params] = useSearchParams();
  const ref = params.get('ref') || '';

  useEffect(() => {
    updatePageSEO('Star payment | Eternal Repos', 'Complete payment for your Signature Farewell star.');
  }, []);

  return (
    <div className="min-h-screen pt-28 pb-16 px-6 bg-ivory text-charcoal flex items-start justify-center">
      <div className="w-full max-w-sm bg-white border border-gold/25 rounded-sm p-8 shadow-sm">
        <Star className="w-8 h-8 text-gold mx-auto mb-3" fill="currentColor" aria-hidden="true" />
        <h1 className="text-center font-serif text-2xl text-deep-brown mb-1">Signature Farewell · Book a Star</h1>
        {ref ? (
          <>
            <p className="text-center text-xs text-charcoal/50 mb-6">Booking reference {ref}</p>
            <StarPaymentPanel bookingRef={ref} />
          </>
        ) : (
          <p className="text-center text-sm text-charcoal/65 mt-4">Open this page from your booking confirmation so we know which star it is for.</p>
        )}
      </div>
    </div>
  );
};

export default StarPaymentView;
