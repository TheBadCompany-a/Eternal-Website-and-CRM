import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { submitEnquiry } from '../utils/concierge';
import { useHoneypot } from '../utils/antiSpam';

interface Item {
  name: string;
  price: number;
}

const inputCls =
  'w-full px-4 py-3 bg-white border border-gold/25 rounded-xs text-sm text-deep-brown placeholder:text-charcoal/40 focus:outline-hidden focus:border-gold focus:ring-1 focus:ring-gold/40 transition-colors';

// "Build your own" package: pick any of the itemised inclusions, see a live
// estimate, and send the request to the team (it also lands in the CRM as a lead).
export const CustomPackage: React.FC<{ items: Item[] }> = ({ items }) => {
  const unique = useMemo(() => {
    const seen = new Map<string, Item>();
    items.forEach((i) => {
      if (!seen.has(i.name)) seen.set(i.name, i);
    });
    return [...seen.values()];
  }, [items]);

  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');
  const honeypot = useHoneypot();

  const chosen = unique.filter((i) => picked.has(i.name));

  const toggle = (name: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot.isBot()) {
      setStatus('done');
      return;
    }
    if (!chosen.length && !form.notes.trim()) {
      setError('Choose at least one inclusion, or describe what you need.');
      return;
    }
    if (form.phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid phone number.');
      return;
    }
    setError('');
    setStatus('sending');
    const lines = chosen.map((i) => `• ${i.name}`).join('\n');
    submitEnquiry({
      name: form.name,
      phone: form.phone,
      email: form.email,
      service: 'Customised package',
      message: `${lines || '(no items selected)'}\nNotes: ${form.notes || '—'}`,
      source: 'custom-package',
      crm: { services: chosen.map((i) => i.name) },
    })
      .catch((err) => console.error(err))
      .finally(() => setStatus('done'));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mb-12 bg-white border border-dashed border-gold/60 rounded-sm shadow-sm"
    >
      <div className="p-7 sm:p-10">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] font-semibold text-gold">
            <Sparkles className="w-3.5 h-3.5" /> Build your own
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-deep-brown mt-2">Customised Package</h3>
          <p className="text-sm text-charcoal/70 font-light leading-relaxed mt-2">
            Pick only what your family needs. Our team will confirm the final plan and pricing with you.
          </p>
        </div>

        {status === 'done' ? (
          <div role="status" className="text-center py-6">
            <CheckCircle2 className="w-9 h-9 text-gold mx-auto mb-3" aria-hidden="true" />
            <h4 className="font-serif text-xl text-deep-brown">Request received</h4>
            <p className="mt-2 text-sm text-charcoal/65 font-light">Our care team will call you shortly to finalise your customised package.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-5 gap-8 relative">
            <div className="lg:col-span-3">
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-charcoal/50 block mb-3">Choose inclusions</span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {unique.map((item) => {
                  const on = picked.has(item.name);
                  return (
                    <li key={item.name}>
                      <label
                        className={`flex items-center justify-between gap-3 px-3.5 py-3 border rounded-xs text-[13px] cursor-pointer transition-colors ${
                          on ? 'border-gold bg-gold/10' : 'border-gold/20 hover:bg-blush/40'
                        }`}
                      >
                        <span className="flex items-center gap-2.5 min-w-0">
                          <input type="checkbox" checked={on} onChange={() => toggle(item.name)} className="accent-[#b98c71] w-4 h-4 shrink-0" />
                          <span className="font-light text-charcoal/90 leading-snug">{item.name}</span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="lg:col-span-2 space-y-3">
              <div className="border-b border-gold/20 pb-3">
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-charcoal/50">
                  {chosen.length} {chosen.length === 1 ? 'item' : 'items'} selected
                </span>
              </div>
              {honeypot.field}
              <input required className={inputCls} placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input required type="tel" className={inputCls} placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <input type="email" className={inputCls} placeholder="Email (optional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <textarea rows={3} className={`${inputCls} resize-none`} placeholder="Anything else you need? (customs, priest, flowers…)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full py-3.5 px-5 text-xs uppercase tracking-wider font-bold rounded-xs bg-deep-brown text-ivory hover:bg-gold transition-colors disabled:opacity-60 cursor-pointer"
              >
                {status === 'sending' ? 'Sending…' : 'Request customised package'}
              </button>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
};
