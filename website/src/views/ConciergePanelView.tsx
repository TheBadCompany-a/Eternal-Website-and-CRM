import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Lock, Phone, Mail, MapPin, Building2, Clock, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { updatePageSEO } from '../utils/seo';
import { listEnquiries, setEnquiryStatus, type Enquiry } from '../utils/concierge';

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-gold text-ivory',
  seen: 'bg-deep-brown/10 text-deep-brown',
  actioned: 'bg-[#5E6B54] text-ivory',
};

export const ConciergePanelView: React.FC = () => {
  const { t } = useTranslation('concierge');
  const [pass, setPass] = useState('');
  const [authed, setAuthed] = useState(false);
  const [entry, setEntry] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Enquiry[]>([]);
  const [filter, setFilter] = useState<'all' | 'new'>('all');

  useEffect(() => {
    updatePageSEO(t('seo.title'), t('seo.description'));
    try {
      const saved = sessionStorage.getItem('er_concierge_pass');
      if (saved) { setPass(saved); setAuthed(true); }
    } catch { /* ignore */ }
  }, [t]);

  const load = useCallback(async (p: string) => {
    setLoading(true); setError('');
    try {
      const data = await listEnquiries(p);
      setRows(data);
      setAuthed(true);
      try { sessionStorage.setItem('er_concierge_pass', p); } catch { /* ignore */ }
    } catch (e: unknown) {
      if (String(e).includes('unauthorized')) setError(t('login.errorMismatch'));
      else setError(t('login.errorLoad'));
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { if (authed && pass) load(pass); }, [authed, pass, load]);

  const submitPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry.trim()) return;
    setPass(entry.trim());
    load(entry.trim());
  };

  const mark = async (id: string, status: string) => {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
    try { await setEnquiryStatus(pass, id, status); } catch (e) { console.error(e); }
  };

  const fmt = (iso: string) => {
    try { return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); }
    catch { return iso; }
  };

  const visible = filter === 'new' ? rows.filter((r) => r.status === 'new') : rows;
  const newCount = rows.filter((r) => r.status === 'new').length;

  if (!authed) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center px-6 pt-32 pb-20">
        <form onSubmit={submitPass} className="w-full max-w-sm text-center">
          <div className="w-12 h-12 rounded-full bg-gold/12 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-5 h-5 text-gold" />
          </div>
          <h1 className="font-serif text-2xl text-deep-brown mb-2">{t('login.heading')}</h1>
          <p className="text-sm text-charcoal/60 font-light mb-6">{t('login.body')}</p>
          <input
            type="password"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder={t('login.placeholder')}
            className="w-full px-4 py-3 bg-white border border-gold/25 rounded-xs text-sm text-charcoal focus:outline-hidden focus:border-gold transition-colors text-center"
          />
          {error && <p className="text-xs text-[#B4553F] mt-3">{error}</p>}
          <button type="submit" disabled={loading} className="mt-5 w-full py-3 bg-gold text-ivory font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-deep-brown transition-all duration-300 cursor-pointer">
            {loading ? t('login.checking') : t('login.enter')}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory pt-32 md:pt-36 pb-24 px-5 md:px-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end justify-between gap-4 mb-8 border-b border-gold/20 pb-6">
          <div>
            <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold block mb-1.5">{t('panel.eyebrow')}</span>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-deep-brown leading-none">{t('panel.heading')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setFilter(filter === 'all' ? 'new' : 'all')} className="px-3 py-2 text-[11px] uppercase tracking-wider font-semibold rounded-xs border border-gold/30 text-deep-brown hover:bg-blush transition-colors cursor-pointer">
              {filter === 'all' ? t('panel.newOnly', { count: newCount }) : t('panel.showAll')}
            </button>
            <button onClick={() => load(pass)} disabled={loading} aria-label={t('panel.refresh')} className="w-9 h-9 rounded-xs border border-gold/30 flex items-center justify-center text-gold hover:bg-blush transition-colors cursor-pointer">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-[#B4553F] mb-4">{error}</p>}
        {!loading && visible.length === 0 && (
          <p className="text-center text-charcoal/50 font-light py-16">{t('panel.noEnquiries')}</p>
        )}

        <div className="space-y-4">
          {visible.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.03, 0.3) }}
              className="bg-white border border-gold/15 rounded-sm p-5 md:p-6 shadow-[0_6px_24px_rgba(58,54,47,0.05)]"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-serif text-xl text-deep-brown leading-tight">{r.name || t('panel.unnamed')}</h3>
                  <span className="text-[11px] text-charcoal/45 inline-flex items-center gap-1 mt-1"><Clock className="w-3 h-3" /> {fmt(r.created_at)}</span>
                </div>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[r.status] || STATUS_STYLES.seen}`}>{r.status}</span>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-charcoal/80 mb-3">
                {r.phone && <a href={`tel:${r.phone}`} className="inline-flex items-center gap-1.5 hover:text-gold"><Phone className="w-3.5 h-3.5 text-gold" />{r.phone}</a>}
                {r.email && <a href={`mailto:${r.email}`} className="inline-flex items-center gap-1.5 hover:text-gold"><Mail className="w-3.5 h-3.5 text-gold" />{r.email}</a>}
                {r.city && <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gold" />{r.city}</span>}
                {r.organisation && <span className="inline-flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-gold" />{r.organisation}</span>}
              </div>

              {r.service && <p className="text-[11px] uppercase tracking-wider text-gold font-semibold mb-1.5">{r.service}</p>}
              {r.message && <p className="text-sm text-charcoal/85 font-light leading-relaxed whitespace-pre-wrap">{r.message}</p>}

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gold/10">
                <span className="text-[10px] uppercase tracking-wider text-charcoal/35 mr-auto">{r.source}</span>
                {r.status !== 'seen' && <button onClick={() => mark(r.id, 'seen')} className="text-[11px] uppercase tracking-wider font-semibold text-charcoal/60 hover:text-deep-brown cursor-pointer">{t('panel.markSeen')}</button>}
                {r.status !== 'actioned' && <button onClick={() => mark(r.id, 'actioned')} className="text-[11px] uppercase tracking-wider font-semibold text-[#5E6B54] hover:text-deep-brown inline-flex items-center gap-1 cursor-pointer"><Check className="w-3.5 h-3.5" />{t('panel.actioned')}</button>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConciergePanelView;
