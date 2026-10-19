import React, { useEffect, useState } from 'react';
import { X, CheckCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { submitEnquiry } from '../utils/concierge';
import { useHoneypot } from '../utils/antiSpam';

interface ConciergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: string;
}

export const ConciergeModal: React.FC<ConciergeModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'General Service Enquiry',
}) => {
  const { t } = useTranslation('conciergeModal');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    organization: '',
    city: '',
    category: defaultCategory,
    message: '',
  });

  const honeypot = useHoneypot();

  // Escape closes the form.
  useEffect(() => {
    if (!isOpen) return;
    honeypot.reset();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, onClose]);

  // Keep the category in step with whichever page opened the form.
  useEffect(() => {
    setFormData((prev) => ({ ...prev, category: defaultCategory }));
  }, [defaultCategory, isOpen]);

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [phoneError, setPhoneError] = useState('');

  const isPhoneValid = (phoneStr: string): boolean => {
    const cleanDigits = phoneStr.replace(/\D/g, '');
    if (cleanDigits.length === 12 && cleanDigits.startsWith('91')) {
      return /^[6-9]\d{9}$/.test(cleanDigits.slice(2));
    }
    return cleanDigits.length === 10 && /^[6-9]\d{9}$/.test(cleanDigits);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const sanitized = value.replace(/[^\d+]/g, '');
      setFormData((prev) => ({ ...prev, phone: sanitized }));
      if (phoneError) setPhoneError('');
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot.isBot()) {
      // Silently pretend success — never tip off the bot that it was caught.
      setSubmitted(true);
      return;
    }
    if (!isPhoneValid(formData.phone)) {
      setPhoneError(t('validation.phoneInvalid'));
      return;
    }
    setPhoneError('');
    setIsSubmitting(true);
    submitEnquiry({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      organisation: formData.organization,
      city: formData.city,
      service: formData.category,
      message: formData.message,
      source: 'concierge-modal',
    })
      .catch((err) => console.error(err))
      .finally(() => {
        setIsSubmitting(false);
        setSubmitted(true);
      });
  };

  const handleReset = () => {
    setSubmitted(false);
    setPhoneError('');
    setFormData({
      name: '',
      phone: '',
      email: '',
      organization: '',
    city: '',
      category: defaultCategory,
      message: '',
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-deep-brown/60 backdrop-blur-xs"
          />

          {/* Close: pinned to the screen corner so it is always reachable, even on short phones */}
          <button
            onClick={onClose}
            aria-label={t('closeAria')}
            className="fixed top-3 right-3 z-20 w-11 h-11 rounded-full bg-ivory/95 text-deep-brown shadow-lg border border-gold/30 flex items-center justify-center hover:bg-gold hover:text-ivory transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-gold"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg bg-ivory text-charcoal p-8 sm:p-10 rounded-xs shadow-2xl z-10 border border-gold/30 my-8"
          >
            {!submitted ? (
              <>
                <div className="mb-6 space-y-1">
                  <span className="text-[11px] uppercase tracking-[0.25em] text-gold font-semibold block">
                    {t('kicker')}
                  </span>
                  <h3 className="font-serif text-3xl font-bold text-deep-brown">
                    {t('heading')}
                  </h3>
                  <p className="text-xs text-charcoal/80 font-light pt-0.5">
                    {t('subheading')}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                  {honeypot.field}
                  <div>
                    <label className="block text-xs font-semibold text-deep-brown uppercase tracking-wider mb-1.5">
                      {t('form.fullName.label')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t('form.fullName.placeholder')}
                      className="w-full px-4 py-3 bg-white border border-gold/25 rounded-xs text-sm focus:outline-hidden focus:border-gold transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-deep-brown uppercase tracking-wider mb-1.5">
                        {t('form.phone.label')}
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        maxLength={14}
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder={t('form.phone.placeholder')}
                        className={`w-full px-4 py-3 bg-white border ${
                          phoneError ? 'border-red-500 ring-1 ring-red-500' : 'border-gold/25'
                        } rounded-xs text-sm focus:outline-hidden focus:border-gold transition-colors`}
                      />
                      {phoneError && (
                        <span className="text-[11px] text-red-600 font-medium block mt-1">
                          {phoneError}
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-deep-brown uppercase tracking-wider mb-1.5">
                        {t('form.email.label')}
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={t('form.email.placeholder')}
                        className="w-full px-4 py-3 bg-white border border-gold/25 rounded-xs text-sm focus:outline-hidden focus:border-gold transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-deep-brown uppercase tracking-wider mb-1.5">City (optional)</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Delhi, Noida, Gurugram"
                      className="w-full px-4 py-3 bg-white border border-gold/25 rounded-xs text-sm focus:outline-hidden focus:border-gold transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-deep-brown uppercase tracking-wider mb-1.5">
                        {t('form.organization.label')}
                      </label>
                      <input
                        type="text"
                        name="organization"
                        value={formData.organization}
                        onChange={handleChange}
                        placeholder={t('form.organization.placeholder')}
                        className="w-full px-4 py-3 bg-white border border-gold/25 rounded-xs text-sm focus:outline-hidden focus:border-gold transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-deep-brown uppercase tracking-wider mb-1.5">
                        {t('form.category.label')}
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-gold/25 rounded-xs text-sm focus:outline-hidden focus:border-gold transition-colors"
                      >
                        <option value="General Service Enquiry">{t('form.category.options.general')}</option>
                        <option value="Core Services — Immediate Response">{t('form.category.options.core')}</option>
                        <option value="Funeral & Memorial Planning">{t('form.category.options.funeral')}</option>
                        <option value="Floral Services">{t('form.category.options.floral')}</option>
                        <option value="Family Support & Counselling">{t('form.category.options.familySupport')}</option>
                        <option value="Pre-Planning Services">{t('form.category.options.prePlanning')}</option>
                        <option value="Asthi Visarjan">{t('form.category.options.asthiVisarjan')}</option>
                        <option value="Institutional Fleet Leasing">{t('form.category.options.fleetLeasing')}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-deep-brown uppercase tracking-wider mb-1.5">
                      {t('form.message.label')}
                    </label>
                    <textarea
                      name="message"
                      rows={3}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={t('form.message.placeholder')}
                      className="w-full px-4 py-3 bg-white border border-gold/25 rounded-xs text-sm focus:outline-hidden focus:border-gold resize-none transition-colors"
                    ></textarea>
                  </div>

                  <div className="pt-3 flex items-center justify-between text-xs text-charcoal/60">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-gold shrink-0" />
                      {t('confidential')}
                    </span>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3.5 bg-deep-brown text-ivory text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-deep-brown transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <span>{isSubmitting ? t('submitting') : t('submit')}</span>
                      <ArrowRight className="w-4 h-4 text-gold" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-10 space-y-4">
                <CheckCircle className="w-14 h-14 text-gold mx-auto mb-2" />
                <h3 className="font-serif text-3xl font-bold text-deep-brown">
                  {t('success.heading')}
                </h3>
                <p className="text-sm text-charcoal/80 max-w-xs mx-auto font-light leading-relaxed">
                  {t('success.message', { name: formData.name })}
                </p>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-deep-brown text-ivory text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-deep-brown transition-colors cursor-pointer shadow-xs"
                >
                  {t('success.returnToSite')}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
