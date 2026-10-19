import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { CheckCircle2 } from 'lucide-react';
import { reportPaymentClaim } from '../../utils/crmBooking';
import { GatewayNotConfiguredError, payWithRazorpay } from '../../utils/razorpay';

export const STAR_PRICE = 4999;
export const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

// The UPI ID the money goes to. It comes from CRM Settings (Company & messages, Payment details);
// this is only the fallback if the settings cannot be read.
const FALLBACK_UPI = { id: 'eternalrepos@icici', name: 'Eternal Repos' };
const CRM_RPC = 'https://xcuqaxgmpcrszptjlzva.supabase.co/rest/v1/rpc/get_public_settings';
const CRM_KEY = 'sb_publishable_dwu1JAFa5KUaUq9X2wVnNA_iMdFl5t3';

export const upiLink = (ref: string, upi = FALLBACK_UPI) =>
  `upi://pay?pa=${encodeURIComponent(upi.id)}&pn=${encodeURIComponent(upi.name)}&am=${STAR_PRICE}&cu=INR&tn=${encodeURIComponent(`Star ${ref}`)}`;

// Pay by UPI: scan the QR (or open the link on a phone), then report the transaction
// reference so the team can match it against the bank and confirm the star.
export const StarPaymentPanel: React.FC<{ bookingRef: string }> = ({ bookingRef }) => {
  const [upi, setUpi] = useState(FALLBACK_UPI);
  const [qr, setQr] = useState<string | null>(null);
  const [utr, setUtr] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [gateway, setGateway] = useState<'idle' | 'opening' | 'paid' | 'unavailable' | 'error'>('idle');
  const [showUpi, setShowUpi] = useState(false);

  const payOnline = async () => {
    setGateway('opening');
    try {
      const paid = await payWithRazorpay({ kind: 'star', ref: bookingRef, description: `Book a Star · ${bookingRef}` });
      setGateway(paid ? 'paid' : 'idle');
    } catch (err) {
      console.error(err);
      if (err instanceof GatewayNotConfiguredError) {
        setGateway('unavailable');
        setShowUpi(true);
      } else {
        setGateway('error');
      }
    }
  };

  useEffect(() => {
    let alive = true;
    fetch(CRM_RPC, { method: 'POST', headers: { apikey: CRM_KEY, Authorization: `Bearer ${CRM_KEY}`, 'Content-Type': 'application/json' }, body: '{}' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { upi_id?: string; upi_name?: string } | null) => {
        if (alive && d?.upi_id) setUpi({ id: d.upi_id, name: d.upi_name || FALLBACK_UPI.name });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(upiLink(bookingRef, upi), { width: 240, margin: 1, color: { dark: '#2a241f', light: '#ffffff' } })
      .then((url) => alive && setQr(url))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [bookingRef, upi]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await reportPaymentClaim(bookingRef, STAR_PRICE, utr);
      setStatus('done');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  if (gateway === 'paid') {
    return (
      <div role="status" className="text-center py-4">
        <CheckCircle2 className="w-9 h-9 text-gold mx-auto mb-3" aria-hidden="true" />
        <p className="font-serif text-xl text-deep-brown">Payment received</p>
        <p className="mt-2 text-sm text-charcoal/65 font-light leading-relaxed">
          Thank you. Your payment of {inr(STAR_PRICE)} is confirmed and our team will activate your star shortly.
        </p>
      </div>
    );
  }

  if (status === 'done') {
    return (
      <div role="status" className="text-center py-4">
        <CheckCircle2 className="w-9 h-9 text-gold mx-auto mb-3" aria-hidden="true" />
        <p className="font-serif text-xl text-deep-brown">Thank you</p>
        <p className="mt-2 text-sm text-charcoal/65 font-light leading-relaxed">
          We have your payment reference. Our team will check it and confirm your star shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-[11px] uppercase tracking-[0.2em] text-gold font-semibold">Complete your booking</p>
      <p className="mt-1 font-serif text-4xl text-deep-brown">{inr(STAR_PRICE)}</p>
      <button
        type="button"
        onClick={payOnline}
        disabled={gateway === 'opening'}
        className="mt-5 w-full py-3.5 px-5 text-xs uppercase tracking-wider font-bold rounded-xs bg-deep-brown text-ivory hover:bg-gold transition-colors disabled:opacity-60 cursor-pointer"
      >
        {gateway === 'opening' ? 'Opening payment…' : `Pay ${inr(STAR_PRICE)} online`}
      </button>
      <p className="mt-2 text-[11px] text-charcoal/50 font-light">UPI, cards and net banking · secured by Razorpay</p>
      {gateway === 'unavailable' && (
        <p role="status" className="mt-3 text-xs text-amber-800">Online payment isn't switched on yet. Please pay with the UPI QR below.</p>
      )}
      {gateway === 'error' && (
        <p role="alert" className="mt-3 text-xs text-red-700">The payment did not go through. Please try again, or use the UPI QR below.</p>
      )}
      {!showUpi && (
        <button type="button" onClick={() => setShowUpi(true)} className="mt-4 text-xs underline text-charcoal/60 cursor-pointer">
          Prefer to pay with a UPI QR?
        </button>
      )}
      {showUpi && <div className="mt-6 pt-6 border-t border-gold/20"><p className="text-[11px] uppercase tracking-[0.2em] text-gold font-semibold">Or pay by UPI QR</p></div>}
      {showUpi && qr && <img src={qr} alt="UPI QR code for the star payment" width={200} height={200} className="mx-auto mt-4 rounded-xs border border-gold/20" />}
      {showUpi && <p className="mt-3 text-xs text-charcoal/60 font-light">Scan with any UPI app (GPay, PhonePe, Paytm…)</p>}
      {showUpi && <p className="mt-1 text-sm text-deep-brown font-medium select-all">{upi.id}</p>}
      {showUpi && (
        <a href={upiLink(bookingRef, upi)} className="inline-block mt-2 text-xs underline text-charcoal/60 md:hidden">
          Open UPI app
        </a>
      )}

      {showUpi && <form onSubmit={submit} className="mt-6 text-left space-y-3">
        <label htmlFor="utr" className="block text-[11px] uppercase tracking-[0.16em] font-semibold text-deep-brown">
          After paying, enter the UPI transaction ID (UTR)
        </label>
        <input
          id="utr"
          required
          minLength={6}
          maxLength={40}
          value={utr}
          onChange={(e) => setUtr(e.target.value)}
          placeholder="e.g. 412345678901"
          className="w-full px-4 py-3 bg-white border border-gold/25 rounded-xs text-sm text-deep-brown placeholder:text-charcoal/40 focus:outline-hidden focus:border-gold focus:ring-1 focus:ring-gold/40"
        />
        {status === 'error' && (
          <p role="alert" className="text-xs text-red-700">
            We could not save that. Please check the reference and try again, or call +91 84486 61338.
          </p>
        )}
        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full py-3.5 px-5 text-xs uppercase tracking-wider font-bold rounded-xs bg-deep-brown text-ivory hover:bg-gold transition-colors disabled:opacity-60 cursor-pointer"
        >
          {status === 'sending' ? 'Sending…' : "I've paid"}
        </button>
      </form>}
    </div>
  );
};
