import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, ClipboardCheck, Heart, PhoneCall, Users, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { submitEnquiry } from '../utils/concierge';
import { useHoneypot } from '../utils/antiSpam';

const PHONE_DISPLAY = '+91 84486 61338';
const PHONE_TEL = 'tel:+918448661338';
const WHATSAPP_URL =
  'https://wa.me/918448661338?text=Hello%20Eternal%20Team%2C%20I%20would%20like%20to%20know%20more%20about%20pre-booking.';

// Why pre-book — icons only; the title/text copy comes from i18n (components.preBooking.why.items).
const WHY_ICONS = [Heart, ClipboardCheck, Users];

const isPhoneValid = (phoneStr: string): boolean => {
  const digits = phoneStr.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return /^[6-9]\d{9}$/.test(digits.slice(2));
  return digits.length === 10 && /^[6-9]\d{9}$/.test(digits);
};

type Status = 'idle' | 'sending' | 'done' | 'error';

const inputCls =
  'w-full px-4 py-3 bg-ivory border border-gold/25 rounded-xs text-sm text-deep-brown placeholder:text-charcoal/40 focus:outline-hidden focus:border-gold focus:ring-1 focus:ring-gold/40 transition-colors';
const labelCls = 'block text-[11px] uppercase tracking-[0.16em] font-semibold text-deep-brown mb-1.5';

export const PreBookingSection: React.FC = () => {
  const { t } = useTranslation('components');
  const whyItems = t('preBooking.why.items', { returnObjects: true }) as { title: string; text: string }[];
  const WHY = whyItems.map((item, idx) => ({ ...item, icon: WHY_ICONS[idx] }));
  const STEPS = t('preBooking.how.items', { returnObjects: true }) as { title: string; text: string }[];
  const FOR_WHOM = t('preBooking.forWhomOptions', { returnObjects: true }) as string[];
  const CALL_TIMES = t('preBooking.callTimeOptions', { returnObjects: true }) as string[];
  const successSteps = t('preBooking.success.steps', { returnObjects: true }) as string[];
  const [form, setForm] = useState({
    name: '',
    phone: '',
    forWhom: '',
    city: '',
    tradition: '',
    callTime: '',
    email: '',
    notes: '',
  });
  const [phoneError, setPhoneError] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const honeypot = useHoneypot();

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = k === 'phone' ? e.target.value.replace(/[^\d+\s]/g, '') : e.target.value;
      setForm((f) => ({ ...f, [k]: value }));
      if (k === 'phone' && phoneError) setPhoneError('');
    };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot.isBot()) {
      setStatus('done');
      return;
    }
    if (!isPhoneValid(form.phone)) {
      setPhoneError(t('preBooking.validation.phoneInvalid'));
      return;
    }
    setStatus('sending');
    const details = [
      form.forWhom && `${t('preBooking.detailsPrefix.forWhom')} ${form.forWhom}`,
      form.tradition && `${t('preBooking.detailsPrefix.tradition')} ${form.tradition}`,
      form.callTime && `${t('preBooking.detailsPrefix.callTime')} ${form.callTime}`,
      form.notes && `${t('preBooking.detailsPrefix.notes')} ${form.notes}`,
    ]
      .filter(Boolean)
      .join('\n');
    try {
      await submitEnquiry({
        name: form.name,
        phone: form.phone,
        email: form.email,
        city: form.city,
        service: 'Pre-Booking',
        message: details,
        source: 'pre-booking',
      });
      setStatus('done');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const scrollToForm = () => {
    document.getElementById('pre-booking-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <section id="pre-booking" className="py-20 md:py-28 px-6 md:px-12 bg-blush/40 border-t border-gold/15">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-12 md:mb-14"
        >
          <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-gold font-semibold mb-4">
            {t('preBooking.badge')}
            <span className="px-2 py-0.5 rounded-full border border-[#B98C71]/40 bg-[#B98C71]/15 text-[#8a5a3f] text-[10px] tracking-[0.12em]">
              {t('preBooking.badgeSoon')}
            </span>
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-semibold text-deep-brown leading-tight mb-4">
            {t('preBooking.heading')}
          </h2>
          <p className="text-base md:text-lg text-charcoal/70 font-light leading-relaxed">
            {t('preBooking.intro')}
          </p>
          <button
            onClick={scrollToForm}
            className="mt-7 px-8 py-4 bg-gold text-ivory font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-deep-brown transition-all duration-300 inline-flex items-center gap-2.5 group shadow-sm cursor-pointer"
          >
            <span>{t('preBooking.startCta')}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left — why + how */}
          <div className="lg:col-span-6 space-y-10">
            <div>
              <h3 className="text-[11px] uppercase tracking-[0.24em] text-charcoal/60 font-semibold mb-5">{t('preBooking.why.heading')}</h3>
              <ul className="space-y-5">
                {WHY.map((w) => (
                  <li key={w.title} className="flex items-start gap-4">
                    <span className="w-11 h-11 shrink-0 rounded-full bg-ivory border border-gold/40 text-gold flex items-center justify-center">
                      <w.icon className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-serif text-xl text-deep-brown leading-tight">{w.title}</p>
                      <p className="text-sm text-charcoal/70 font-light leading-relaxed mt-0.5">{w.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] uppercase tracking-[0.24em] text-charcoal/60 font-semibold mb-5">{t('preBooking.how.heading')}</h3>
              <ol className="space-y-5">
                {STEPS.map((s, i) => (
                  <li key={s.title} className="flex items-start gap-4">
                    <span className="w-8 h-8 shrink-0 rounded-full bg-deep-brown text-ivory font-serif text-base flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-serif text-xl text-deep-brown leading-tight">{s.title}</p>
                      <p className="text-sm text-charcoal/70 font-light leading-relaxed mt-0.5">{s.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Right — form / confirmation */}
          <div id="pre-booking-form" className="lg:col-span-6 lg:sticky lg:top-28 scroll-mt-28">
            {status === 'done' ? (
              <div className="bg-white border border-gold/30 rounded-xs shadow-lg p-7 md:p-9 space-y-6" role="status">
                <div className="flex items-center gap-3 text-deep-brown">
                  <CheckCircle2 className="w-8 h-8 text-gold shrink-0" aria-hidden="true" />
                  <h3 className="font-serif text-2xl md:text-3xl font-semibold">{t('preBooking.success.heading')}</h3>
                </div>
                <p className="text-sm md:text-base text-charcoal/75 font-light leading-relaxed">
                  {t('preBooking.success.message', { name: form.name.split(' ')[0] || t('preBooking.success.fallbackName') })}
                </p>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-gold font-semibold mb-3">{t('preBooking.success.nextHeading')}</p>
                  <ol className="space-y-3 text-sm text-charcoal/80 font-light">
                    <li className="flex gap-3"><span className="text-gold font-serif text-lg leading-none">1</span><span>{successSteps[0].replace('{{phone}}', form.phone.trim())}</span></li>
                    <li className="flex gap-3"><span className="text-gold font-serif text-lg leading-none">2</span><span>{successSteps[1]}</span></li>
                    <li className="flex gap-3"><span className="text-gold font-serif text-lg leading-none">3</span><span>{successSteps[2]}</span></li>
                  </ol>
                </div>
                <div className="flex flex-wrap gap-3 pt-2 border-t border-gold/15">
                  <a href={PHONE_TEL} className="mt-4 px-5 py-3 bg-deep-brown text-ivory text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-gold transition-colors inline-flex items-center gap-2">
                    <PhoneCall className="w-4 h-4" aria-hidden="true" /> {PHONE_DISPLAY}
                  </a>
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="mt-4 px-5 py-3 border border-gold/40 text-deep-brown text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-gold hover:text-ivory transition-colors inline-flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" aria-hidden="true" /> {t('preBooking.success.callCta')}
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="bg-white border border-gold/30 rounded-xs shadow-lg p-7 md:p-9 space-y-5">
                {honeypot.field}
                <div>
                  <h3 className="font-serif text-2xl md:text-3xl font-semibold text-deep-brown">{t('preBooking.form.heading')}</h3>
                  <p className="text-xs text-charcoal/60 mt-1.5">{t('preBooking.form.subheading')}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pb-name" className={labelCls}>{t('preBooking.form.fullName.label')} <span className="text-gold">*</span></label>
                    <input id="pb-name" required value={form.name} onChange={set('name')} placeholder={t('preBooking.form.fullName.placeholder')} className={inputCls} autoComplete="name" />
                  </div>
                  <div>
                    <label htmlFor="pb-phone" className={labelCls}>{t('preBooking.form.phone.label')} <span className="text-gold">*</span></label>
                    <input id="pb-phone" required inputMode="tel" value={form.phone} onChange={set('phone')} placeholder={t('preBooking.form.phone.placeholder')} className={inputCls} autoComplete="tel" aria-invalid={!!phoneError} aria-describedby={phoneError ? 'pb-phone-err' : undefined} />
                    {phoneError && <p id="pb-phone-err" className="text-xs text-red-700 mt-1.5">{phoneError}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pb-for" className={labelCls}>{t('preBooking.form.forWhom.label')} <span className="text-charcoal/40 normal-case tracking-normal font-normal">{t('preBooking.form.optional')}</span></label>
                    <select id="pb-for" value={form.forWhom} onChange={set('forWhom')} className={inputCls}>
                      <option value="">{t('preBooking.form.forWhom.select')}</option>
                      {FOR_WHOM.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="pb-city" className={labelCls}>{t('preBooking.form.city.label')} <span className="text-charcoal/40 normal-case tracking-normal font-normal">{t('preBooking.form.optional')}</span></label>
                    <input id="pb-city" value={form.city} onChange={set('city')} placeholder={t('preBooking.form.city.placeholder')} className={inputCls} autoComplete="address-level2" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pb-trad" className={labelCls}>{t('preBooking.form.tradition.label')} <span className="text-charcoal/40 normal-case tracking-normal font-normal">{t('preBooking.form.optional')}</span></label>
                    <input id="pb-trad" value={form.tradition} onChange={set('tradition')} placeholder={t('preBooking.form.tradition.placeholder')} className={inputCls} />
                  </div>
                  <div>
                    <label htmlFor="pb-time" className={labelCls}>{t('preBooking.form.callTime.label')} <span className="text-charcoal/40 normal-case tracking-normal font-normal">{t('preBooking.form.optional')}</span></label>
                    <select id="pb-time" value={form.callTime} onChange={set('callTime')} className={inputCls}>
                      <option value="">{t('preBooking.form.callTime.select')}</option>
                      {CALL_TIMES.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="pb-email" className={labelCls}>{t('preBooking.form.email.label')} <span className="text-charcoal/40 normal-case tracking-normal font-normal">{t('preBooking.form.optional')}</span></label>
                  <input id="pb-email" type="email" value={form.email} onChange={set('email')} placeholder={t('preBooking.form.email.placeholder')} className={inputCls} autoComplete="email" />
                </div>

                <div>
                  <label htmlFor="pb-notes" className={labelCls}>{t('preBooking.form.notes.label')} <span className="text-charcoal/40 normal-case tracking-normal font-normal">{t('preBooking.form.optional')}</span></label>
                  <textarea id="pb-notes" rows={3} value={form.notes} onChange={set('notes')} placeholder={t('preBooking.form.notes.placeholder')} className={`${inputCls} resize-none`} />
                </div>

                {status === 'error' && (
                  <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-xs px-4 py-3" role="alert">
                    {t('preBooking.form.errorMessage')}{' '}
                    <a href={PHONE_TEL} className="font-semibold underline">{PHONE_DISPLAY}</a> {t('preBooking.form.errorOr')}{' '}
                    <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="font-semibold underline">{t('preBooking.form.whatsappLink')}</a>.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full px-8 py-4 bg-deep-brown text-ivory font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-gold transition-all duration-300 inline-flex items-center justify-center gap-2.5 group disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span>{status === 'sending' ? t('preBooking.form.sending') : t('preBooking.form.submit')}</span>
                  {status !== 'sending' && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
                </button>
                <p className="text-[11px] text-charcoal/55 leading-relaxed">
                  {t('preBooking.form.consent')}
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreBookingSection;
