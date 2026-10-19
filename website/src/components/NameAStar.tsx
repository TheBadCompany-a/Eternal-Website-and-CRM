import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ImagePlus, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { preparePhoto, submitTribute } from '../utils/tributes';
import { useHoneypot } from '../utils/antiSpam';

const inputCls =
  'w-full px-4 py-3 bg-white border border-gold/25 rounded-xs text-sm text-deep-brown placeholder:text-charcoal/40 focus:outline-hidden focus:border-gold focus:ring-1 focus:ring-gold/40 transition-colors';
const labelCls = 'block text-[11px] uppercase tracking-[0.16em] font-semibold text-deep-brown mb-1.5';

type Status = 'idle' | 'sending' | 'done' | 'error';

export const NameAStar: React.FC = () => {
  const { t } = useTranslation('components');
  const optional = <span className="text-charcoal/40 normal-case tracking-normal font-normal"> {t('nameAStar.optionalLabel')}</span>;
  const [form, setForm] = useState({
    name: '', bornYear: '', passedYear: '', message: '', yourName: '', contact: '', consent: false,
  });
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const fileRef = useRef<HTMLInputElement>(null);
  const honeypot = useHoneypot();

  // Free the preview image when it is replaced or the form closes.
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const v = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };

  const pickPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPhotoError('');
    if (!file) return;
    try {
      const blob = await preparePhoto(file);
      setPhoto(blob);
      setPreview(URL.createObjectURL(blob));
    } catch (err) {
      setPhoto(null);
      setPreview(null);
      setPhotoError(err instanceof Error ? err.message : t('nameAStar.photoErrorFallback'));
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const yearOk = (v: string) => v === '' || (/^\d{4}$/.test(v) && +v >= 1800 && +v <= 2100);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot.isBot()) {
      setStatus('done');
      return;
    }
    if (!form.consent || !yearOk(form.bornYear) || !yearOk(form.passedYear)) return;
    setStatus('sending');
    try {
      await submitTribute(
        {
          name: form.name,
          bornYear: form.bornYear ? +form.bornYear : undefined,
          passedYear: form.passedYear ? +form.passedYear : undefined,
          message: form.message,
          submitterName: form.yourName,
          submitterContact: form.contact,
        },
        photo ?? undefined
      );
      setStatus('done');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} role="status" className="mt-10 max-w-xl mx-auto text-center bg-white/70 border border-gold/25 rounded-sm p-8 md:p-10 shadow-sm">
        <Star className="w-7 h-7 text-gold mx-auto mb-4" fill="currentColor" aria-hidden="true" />
        <h3 className="font-serif text-2xl md:text-3xl text-deep-brown">{t('nameAStar.thankYou.heading')}</h3>
        <p className="mt-3 text-[15px] text-charcoal/70 font-light leading-relaxed">
          {t('nameAStar.thankYou.message', { name: form.name.trim() })}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={submit}
      className="mt-10 max-w-2xl mx-auto bg-white/70 border border-gold/25 rounded-sm p-6 md:p-9 shadow-sm space-y-5"
    >
      {honeypot.field}
      <div className="text-center">
        <h3 className="font-serif text-2xl md:text-3xl text-deep-brown">{t('nameAStar.heading')}</h3>
        <p className="mt-2 text-sm text-charcoal/60 font-light">{t('nameAStar.subheading')}</p>
      </div>

      {/* live preview of the star */}
      <div className="flex flex-col items-center gap-2 py-2" aria-hidden="true">
        <span
          className="w-20 h-20 rounded-full overflow-hidden border border-[#D9C6A1]/70 flex items-center justify-center"
          style={{ background: '#3a4034', boxShadow: '0 0 22px 6px rgba(217,198,161,0.3)' }}
        >
          {preview ? <img src={preview} alt="" className="w-full h-full object-cover" /> : <Star className="w-9 h-9 text-[#D9C6A1]" fill="currentColor" />}
        </span>
        <span className="font-serif text-lg text-deep-brown min-h-7">{form.name.trim() || t('nameAStar.previewPlaceholderName')}</span>
      </div>

      <div>
        <label htmlFor="ns-name" className={labelCls}>{t('nameAStar.fields.name.label')} <span className="text-gold">*</span></label>
        <input id="ns-name" required maxLength={80} value={form.name} onChange={set('name')} placeholder={t('nameAStar.fields.name.placeholder')} className={inputCls} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="ns-born" className={labelCls}>{t('nameAStar.fields.born.label')}{optional}</label>
          <input id="ns-born" inputMode="numeric" maxLength={4} value={form.bornYear} onChange={set('bornYear')} placeholder={t('nameAStar.fields.born.placeholder')} className={inputCls} aria-invalid={!yearOk(form.bornYear)} />
        </div>
        <div>
          <label htmlFor="ns-passed" className={labelCls}>{t('nameAStar.fields.passed.label')}{optional}</label>
          <input id="ns-passed" inputMode="numeric" maxLength={4} value={form.passedYear} onChange={set('passedYear')} placeholder={t('nameAStar.fields.passed.placeholder')} className={inputCls} aria-invalid={!yearOk(form.passedYear)} />
        </div>
      </div>

      <div>
        <label htmlFor="ns-msg" className={labelCls}>{t('nameAStar.fields.message.label')}{optional}</label>
        <textarea id="ns-msg" rows={3} maxLength={400} value={form.message} onChange={set('message')} placeholder={t('nameAStar.fields.message.placeholder')} className={`${inputCls} resize-none`} />
        <p className="mt-1 text-[11px] text-charcoal/40 text-right">{form.message.length}/400</p>
      </div>

      <div>
        <span className={labelCls}>{t('nameAStar.fields.photo.label')}{optional}</span>
        <input ref={fileRef} id="ns-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={pickPhoto} className="sr-only" />
        <label htmlFor="ns-photo" className="inline-flex items-center gap-2.5 px-4 py-3 border border-dashed border-gold/50 rounded-xs text-sm text-deep-brown hover:bg-blush/50 cursor-pointer transition-colors focus-within:outline-2 focus-within:outline-gold">
          <ImagePlus className="w-4 h-4 text-gold" aria-hidden="true" />
          {preview ? t('nameAStar.fields.photo.chooseDifferent') : t('nameAStar.fields.photo.choose')}
        </label>
        {photoError && <p role="alert" className="mt-2 text-xs text-red-700">{photoError}</p>}
        <p className="mt-2 text-[11px] text-charcoal/45 leading-relaxed">{t('nameAStar.fields.photo.helper')}</p>
      </div>

      <div className="border-t border-gold/15 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="ns-you" className={labelCls}>{t('nameAStar.fields.yourName.label')} <span className="text-gold">*</span></label>
          <input id="ns-you" required maxLength={80} value={form.yourName} onChange={set('yourName')} autoComplete="name" className={inputCls} />
        </div>
        <div>
          <label htmlFor="ns-contact" className={labelCls}>{t('nameAStar.fields.contact.label')} <span className="text-gold">*</span></label>
          <input id="ns-contact" required minLength={5} maxLength={120} value={form.contact} onChange={set('contact')} autoComplete="email" className={inputCls} />
        </div>
        <p className="sm:col-span-2 -mt-1 text-[11px] text-charcoal/45">{t('nameAStar.contactHelper')}</p>
      </div>

      <label className="flex items-start gap-3 text-[13px] text-charcoal/70 font-light leading-relaxed cursor-pointer">
        <input type="checkbox" required checked={form.consent} onChange={set('consent')} className="mt-1 w-4 h-4 accent-[#5E6B54] shrink-0" />
        <span>{t('nameAStar.consentLabel')}</span>
      </label>

      {status === 'error' && (
        <p role="alert" className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-xs px-4 py-3">
          {t('nameAStar.errorMessage')}{' '}
          <a href="tel:+918448661338" className="font-semibold underline">+91 84486 61338</a>.
        </p>
      )}

      <div className="text-center pt-1">
        <button
          type="submit"
          disabled={status === 'sending'}
          className="px-9 py-4 bg-deep-brown text-ivory font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-gold transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {status === 'sending' ? t('nameAStar.sending') : t('nameAStar.submit')}
        </button>
      </div>
    </motion.form>
  );
};

export default NameAStar;
