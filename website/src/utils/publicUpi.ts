import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export const DIYA_PRICE = 20;

// The UPI ID comes from CRM Settings (Company & messages, Payment details); this is only the fallback.
const FALLBACK_UPI = { id: 'eternalrepos@icici', name: 'Eternal Repos' };
const CRM_RPC = 'https://xcuqaxgmpcrszptjlzva.supabase.co/rest/v1/rpc/get_public_settings';
const CRM_KEY = 'sb_publishable_dwu1JAFa5KUaUq9X2wVnNA_iMdFl5t3';

/** A QR code for a fixed UPI payment to the company's UPI ID, or null while it is being made. */
export function useUpiQr(amount: number, note: string): string | null {
  const [upi, setUpi] = useState(FALLBACK_UPI);
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(CRM_RPC, { method: 'POST', headers: { apikey: CRM_KEY, Authorization: `Bearer ${CRM_KEY}`, 'Content-Type': 'application/json' }, body: '{}' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { upi_id?: string; upi_name?: string } | null) => {
        if (alive && d?.upi_id) setUpi({ id: d.upi_id, name: d.upi_name || FALLBACK_UPI.name });
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let alive = true;
    const link = `upi://pay?pa=${encodeURIComponent(upi.id)}&pn=${encodeURIComponent(upi.name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
    QRCode.toDataURL(link, { width: 260, margin: 1, color: { dark: '#2a241f', light: '#ffffff' } })
      .then((url) => alive && setQr(url))
      .catch(() => {});
    return () => { alive = false; };
  }, [upi, amount, note]);

  return qr;
}
