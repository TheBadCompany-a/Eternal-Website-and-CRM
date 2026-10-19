// Razorpay Checkout. Orders are created and verified by the CRM project's `razorpay`
// edge function (the secret key never reaches the browser, and the amount is fixed there).
const FN_URL = 'https://xcuqaxgmpcrszptjlzva.supabase.co/functions/v1/razorpay';
const CRM_KEY = 'sb_publishable_dwu1JAFa5KUaUq9X2wVnNA_iMdFl5t3';

export class GatewayNotConfiguredError extends Error {
  constructor() {
    super('Online payment is not set up yet.');
    this.name = 'GatewayNotConfiguredError';
  }
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayCheckout {
  open: () => void;
  on: (event: string, cb: () => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayCheckout;
  }
}

async function call<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch(FN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: CRM_KEY, Authorization: `Bearer ${CRM_KEY}` },
    body: JSON.stringify(body),
  });
  if (res.status === 503) throw new GatewayNotConfiguredError();
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || `Payment request failed (${res.status})`);
  return data as T;
}

let scriptPromise: Promise<void> | null = null;
function loadCheckoutScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => {
        scriptPromise = null;
        reject(new Error('Could not load the payment window.'));
      };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

export interface PayOptions {
  kind: 'star' | 'diya';
  /** Booking reference (star payments). */
  ref?: string;
  /** Free text saved with the payment, e.g. which star a diya was offered at. */
  note?: string;
  description: string;
  prefill?: { name?: string; email?: string; contact?: string };
}

/** Opens Razorpay. Resolves true when the payment is paid and verified, false if the visitor closed the window. */
export async function payWithRazorpay(opts: PayOptions): Promise<boolean> {
  const order = await call<{ key_id: string; order_id: string; amount: number; currency: string }>({
    action: 'create-order',
    kind: opts.kind,
    ref: opts.ref,
    note: opts.note,
  });
  await loadCheckoutScript();
  if (!window.Razorpay) throw new Error('Could not load the payment window.');
  const Razorpay = window.Razorpay;

  return new Promise<boolean>((resolve, reject) => {
    const checkout = new Razorpay({
      key: order.key_id,
      order_id: order.order_id,
      amount: order.amount,
      currency: order.currency,
      name: 'Eternal Repos',
      description: opts.description,
      prefill: opts.prefill,
      theme: { color: '#2a241f' },
      handler: async (response: RazorpayResponse) => {
        try {
          await call({
            action: 'verify',
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });
          resolve(true);
        } catch (err) {
          reject(err);
        }
      },
      modal: { ondismiss: () => resolve(false) },
    });
    checkout.on('payment.failed', () => resolve(false));
    checkout.open();
  });
}
