import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, ImagePlus, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { updatePageSEO } from '../../utils/seo';
import { preparePhoto } from '../../utils/tributes';
import { signUpWithPassword, uploadRequestStarPhoto, EmailAlreadyRegisteredError } from '../../utils/bookedStars';
import { submitEnquiry } from '../../utils/concierge';
import { submitStarBooking } from '../../utils/crmBooking';
import { StarPaymentPanel } from './StarPaymentPanel';
import { useHoneypot } from '../../utils/antiSpam';

const inputCls =
  'w-full px-4 py-3 bg-white border border-gold/25 rounded-xs text-sm text-deep-brown placeholder:text-charcoal/40 focus:outline-hidden focus:border-gold focus:ring-1 focus:ring-gold/40 transition-colors';
const labelCls = 'block text-[11px] uppercase tracking-[0.16em] font-semibold text-deep-brown mb-1.5';

type Status = 'idle' | 'sending' | 'done' | 'error' | 'emailTaken';

export const BookStarView: React.FC = () => {
  const { t } = useTranslation('bookStar');
  const optional = <span className="text-charcoal/40 normal-case tracking-normal font-normal"> {t('request.optionalLabel')}</span>;

  useEffect(() => {
    updatePageSEO(t('seo.requestTitle'), t('seo.requestDescription'));
  }, [t]);

  const [form, setForm] = useState({
    name: '',
    relationship: '',
    about: '',
    birthDate: '',
    deathDate: '',
    requesterName: '',
    requesterPhone: '',
    city: '',
    ownerEmail: '',
    password: '',
    confirmPassword: '',
    confirmed: false,
  });
  const [passwordError, setPasswordError] = useState('');
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [payRef, setPayRef] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const honeypot = useHoneypot();

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
      setPhotoError(err instanceof Error ? err.message : t('request.fields.photo.errorFallback'));
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot.isBot()) {
      setStatus('done');
      return;
    }
    setPasswordError('');
    if (form.password.length < 8) {
      setPasswordError(t('request.fields.password.tooShort'));
      return;
    }
    if (form.password !== form.confirmPassword) {
      setPasswordError(t('request.fields.confirmPassword.mismatch'));
      return;
    }
    if (!form.confirmed) return;
    setStatus('sending');
    try {
      // Optional extras first (best-effort): the family login and the photo live in the
      // website's own Supabase project and must never block the booking itself.
      let emailTaken = false;
      try {
        await signUpWithPassword(form.ownerEmail, form.password);
      } catch (err) {
        if (err instanceof EmailAlreadyRegisteredError) emailTaken = true;
        else console.error('Family login could not be created:', err);
      }
      if (emailTaken) {
        setStatus('emailTaken');
        return;
      }
      let photoPath: string | undefined;
      if (photo) {
        try {
          photoPath = await uploadRequestStarPhoto(photo);
        } catch (err) {
          console.error('Photo upload failed:', err);
        }
      }
      // The booking itself: saved in the CRM database as a star request + lead.
      const booking = await submitStarBooking({
        name: form.name,
        relationship: form.relationship,
        about: form.about || undefined,
        birthDate: form.birthDate || undefined,
        deathDate: form.deathDate || undefined,
        photoPath,
        requesterName: form.requesterName,
        requesterPhone: form.requesterPhone,
        city: form.city,
        ownerEmail: form.ownerEmail,
      });
      setPayRef(booking.arrangementId);
      setStatus('done');
      // Best-effort copy into the concierge enquiries inbox.
      submitEnquiry({
        name: form.requesterName,
        email: form.ownerEmail,
        phone: form.requesterPhone,
        service: 'Book a Star — Signature Farewell',
        message: `Booking request for a memorial star.\nName of loved one: ${form.name}\nRelationship: ${form.relationship || '—'}\nDate of birth: ${form.birthDate || '—'}\nDate of passing: ${form.deathDate || '—'}\nAbout: ${form.about || '—'}`,
        source: 'book-a-star-form',
        skipCrm: true,
      }).catch((err) => console.error('Concierge copy failed (booking was still saved):', err));
    } catch (err) {
      console.error(err);
      setStatus(err instanceof EmailAlreadyRegisteredError ? 'emailTaken' : 'error');
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 bg-ivory text-charcoal">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/40 mb-5">
            <Crown className="w-3.5 h-3.5 text-gold" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-gold font-semibold">{t('request.badge')}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-deep-brown leading-tight">{t('request.heading')}</h1>
          <p className="mt-4 text-base text-charcoal/70 font-light leading-relaxed max-w-xl mx-auto">{t('request.subheading')}</p>
        </div>

        {status === 'done' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} role="status" className="text-center bg-white border border-gold/25 rounded-sm p-8 md:p-10 shadow-sm">
            <Star className="w-7 h-7 text-gold mx-auto mb-4" fill="currentColor" aria-hidden="true" />
            <h2 className="font-serif text-2xl md:text-3xl text-deep-brown">{t('request.success.heading')}</h2>
            <p className="mt-3 text-[15px] text-charcoal/70 font-light leading-relaxed">{t('request.success.message', { name: form.name.trim() })}</p>
            {payRef && (
              <div className="mt-6 border border-gold/25 rounded-sm bg-ivory/60 p-5">
                <StarPaymentPanel bookingRef={payRef} />
              </div>
            )}
            <p className="mt-4 text-sm text-charcoal/60 font-light leading-relaxed">{t('request.success.confirmEmailHint')}</p>
            <p className="mt-2 text-sm text-charcoal/60 font-light leading-relaxed">{t('request.success.loginHint')}</p>
            <Link to="/services#galaxy-sky" className="inline-block mt-5 mr-6 text-xs uppercase tracking-wider font-semibold text-deep-brown border-b border-deep-brown/40 pb-1 hover:text-gold transition-colors">
              See your star in the sky
            </Link>
            <Link to="/my-star/login" className="inline-block mt-5 text-xs uppercase tracking-wider font-semibold text-gold border-b border-gold/50 pb-1 hover:text-deep-brown transition-colors">
              {t('request.success.loginLinkLabel')}
            </Link>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={submit}
            className="bg-white border border-gold/25 rounded-sm p-6 md:p-9 shadow-sm space-y-5"
          >
            {honeypot.field}

            <div>
              <label htmlFor="bs-name" className={labelCls}>{t('request.fields.name.label')} <span className="text-gold">*</span></label>
              <input id="bs-name" required maxLength={80} value={form.name} onChange={set('name')} placeholder={t('request.fields.name.placeholder')} className={inputCls} />
            </div>

            <div>
              <label htmlFor="bs-relationship" className={labelCls}>{t('request.fields.relationship.label')}{optional}</label>
              <input id="bs-relationship" maxLength={60} value={form.relationship} onChange={set('relationship')} placeholder={t('request.fields.relationship.placeholder')} className={inputCls} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="bs-birth" className={labelCls}>{t('request.fields.birthDate.label')}{optional}</label>
                <input id="bs-birth" type="date" value={form.birthDate} onChange={set('birthDate')} className={inputCls} />
              </div>
              <div>
                <label htmlFor="bs-death" className={labelCls}>{t('request.fields.deathDate.label')}{optional}</label>
                <input id="bs-death" type="date" value={form.deathDate} onChange={set('deathDate')} className={inputCls} />
              </div>
            </div>

            <div>
              <label htmlFor="bs-about" className={labelCls}>{t('request.fields.about.label')}{optional}</label>
              <textarea id="bs-about" rows={4} maxLength={2000} value={form.about} onChange={set('about')} placeholder={t('request.fields.about.placeholder')} className={`${inputCls} resize-none`} />
              <p className="mt-1 text-[11px] text-charcoal/40 text-right">{form.about.length}/2000</p>
              <p className="mt-1 text-[11px] text-charcoal/45 leading-relaxed">{t('request.fields.about.helper')}</p>
            </div>

            <div>
              <span className={labelCls}>{t('request.fields.photo.label')}{optional}</span>
              <input ref={fileRef} id="bs-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={pickPhoto} className="sr-only" />
              <label htmlFor="bs-photo" className="inline-flex items-center gap-2.5 px-4 py-3 border border-dashed border-gold/50 rounded-xs text-sm text-deep-brown hover:bg-blush/50 cursor-pointer transition-colors focus-within:outline-2 focus-within:outline-gold">
                <ImagePlus className="w-4 h-4 text-gold" aria-hidden="true" />
                {preview ? t('request.fields.photo.chooseDifferent') : t('request.fields.photo.choose')}
              </label>
              {photoError && <p role="alert" className="mt-2 text-xs text-red-700">{photoError}</p>}
              <p className="mt-2 text-[11px] text-charcoal/45 leading-relaxed">{t('request.fields.photo.helper')}</p>
            </div>

            <div className="border-t border-gold/15 pt-5 space-y-4">
              <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-charcoal/50">{t('request.contactSectionLabel')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="bs-requester-name" className={labelCls}>{t('request.fields.requesterName.label')} <span className="text-gold">*</span></label>
                  <input id="bs-requester-name" required maxLength={80} value={form.requesterName} onChange={set('requesterName')} autoComplete="name" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="bs-requester-phone" className={labelCls}>{t('request.fields.requesterPhone.label')} <span className="text-gold">*</span></label>
                  <input id="bs-requester-phone" required minLength={5} maxLength={20} value={form.requesterPhone} onChange={set('requesterPhone')} autoComplete="tel" className={inputCls} />
                </div>
              </div>
              <div>
                <label htmlFor="bs-city" className={labelCls}>City</label>
                <input id="bs-city" maxLength={60} value={form.city} onChange={set('city')} placeholder="e.g. Delhi, Noida, Gurugram" autoComplete="address-level2" className={inputCls} />
              </div>
              <div>
                <label htmlFor="bs-owner-email" className={labelCls}>{t('request.fields.ownerEmail.label')} <span className="text-gold">*</span></label>
                <input id="bs-owner-email" type="email" required minLength={5} maxLength={120} value={form.ownerEmail} onChange={set('ownerEmail')} autoComplete="email" className={inputCls} />
                <p className="mt-1.5 text-[11px] text-charcoal/45 leading-relaxed">{t('request.fields.ownerEmail.helper')}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="bs-password" className={labelCls}>{t('request.fields.password.label')} <span className="text-gold">*</span></label>
                  <input id="bs-password" type="password" required minLength={8} value={form.password} onChange={set('password')} autoComplete="new-password" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="bs-confirm-password" className={labelCls}>{t('request.fields.confirmPassword.label')} <span className="text-gold">*</span></label>
                  <input id="bs-confirm-password" type="password" required minLength={8} value={form.confirmPassword} onChange={set('confirmPassword')} autoComplete="new-password" className={inputCls} />
                </div>
              </div>
              <p className="-mt-1 text-[11px] text-charcoal/45">{t('request.fields.password.helper')}</p>
              {passwordError && <p role="alert" className="text-xs text-red-700">{passwordError}</p>}
            </div>

            <label className="flex items-start gap-3 text-[13px] text-charcoal/70 font-light leading-relaxed cursor-pointer">
              <input type="checkbox" required checked={form.confirmed} onChange={set('confirmed')} className="mt-1 w-4 h-4 accent-[#5E6B54] shrink-0" />
              <span>{t('request.confirmLabel')}</span>
            </label>

            {status === 'error' && (
              <p role="alert" className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-xs px-4 py-3">
                {t('request.error')}{' '}
                <a href="tel:+918448661338" className="font-semibold underline">+91 84486 61338</a>.
              </p>
            )}

            {status === 'emailTaken' && (
              <p role="alert" className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-xs px-4 py-3">
                {t('request.emailTakenError')}{' '}
                <Link to="/my-star/login" className="font-semibold underline">{t('request.emailTakenLinkLabel')}</Link>
              </p>
            )}

            <div className="text-center pt-1">
              <button
                type="submit"
                disabled={status === 'sending'}
                className="px-9 py-4 bg-deep-brown text-ivory font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-gold transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {status === 'sending' ? t('request.sending') : t('request.submit')}
              </button>
            </div>
          </motion.form>
        )}

        <p className="text-center mt-8 text-sm text-charcoal/60 font-light">
          {t('request.alreadyBooked.text')}{' '}
          <Link to="/my-star/login" className="text-gold font-semibold border-b border-gold/40 pb-0.5 hover:text-deep-brown transition-colors">
            {t('request.alreadyBooked.linkLabel')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default BookStarView;
