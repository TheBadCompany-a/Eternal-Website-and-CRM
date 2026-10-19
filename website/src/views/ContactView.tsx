import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Phone, Mail, MapPin, ShieldAlert, CheckCircle2, ArrowRight, MessageSquare, Calendar, X } from 'lucide-react';
import { updatePageSEO } from '../utils/seo';
import { Verse } from '../components/Verse';
import { submitEnquiry } from '../utils/concierge';
import { useHoneypot } from '../utils/antiSpam';
import { SHOW_VEHICLE } from '../config/features';

export const ContactView: React.FC = () => {
  const { t } = useTranslation('contact');

  useEffect(() => {
    updatePageSEO(
      t('seo.title'),
      t('seo.description')
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Strict Phone Validation helper (10-digit Indian Mobile check)
  const isPhoneValid = (phoneStr: string): boolean => {
    const cleanDigits = phoneStr.replace(/\D/g, '');
    if (cleanDigits.length === 12 && cleanDigits.startsWith('91')) {
      return /^[6-9]\d{9}$/.test(cleanDigits.slice(2));
    }
    return cleanDigits.length === 10 && /^[6-9]\d{9}$/.test(cleanDigits);
  };

  // Primary Contact Form State
  const [formState, setFormState] = useState({
    fullName: '',
    organization: '',
    city: '',
    phone: '',
    email: '',
    enquiryType: 'General Enquiry',
    message: '',
  });
  const [phoneError, setPhoneError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const honeypot = useHoneypot();

  // Demo Booking Popup Form State
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoFormSubmitted, setDemoFormSubmitted] = useState(false);
  const [demoPhoneError, setDemoPhoneError] = useState('');
  const [demoFormState, setDemoFormState] = useState({
    fullName: '',
    phone: '',
    email: '',
    preferredDate: '',
    organization: '',
  });
  const demoHoneypot = useHoneypot();
  useEffect(() => {
    if (demoModalOpen) demoHoneypot.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoModalOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (honeypot.isBot()) {
      setSubmitted(true);
      return;
    }

    // Strict Phone Check
    if (!isPhoneValid(formState.phone)) {
      setPhoneError(t('validation.invalidPhone'));
      return;
    }
    setPhoneError('');

    setLoading(true);
    submitEnquiry({
      name: formState.fullName,
      organisation: formState.organization,
      city: formState.city,
      phone: formState.phone,
      email: formState.email,
      service: formState.enquiryType,
      message: formState.message,
      source: 'contact-primary',
    })
      .catch((err) => console.error(err))
      .finally(() => {
        setLoading(false);
        setSubmitted(true);
      });
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (demoHoneypot.isBot()) {
      setDemoFormSubmitted(true);
      return;
    }

    // Strict Phone Check
    if (!isPhoneValid(demoFormState.phone)) {
      setDemoPhoneError(t('validation.invalidPhone'));
      return;
    }
    setDemoPhoneError('');

    setDemoLoading(true);
    submitEnquiry({
      name: demoFormState.fullName,
      phone: demoFormState.phone,
      email: demoFormState.email,
      organisation: demoFormState.organization,
      service: 'Vehicle viewing (demo)',
      message: demoFormState.preferredDate ? `Preferred date: ${demoFormState.preferredDate}` : '',
      source: 'contact-demo',
    })
      .catch((err) => console.error(err))
      .finally(() => {
        setDemoLoading(false);
        setDemoFormSubmitted(true);
      });
  };

  return (
    <div className="pt-28 pb-0 space-y-0">
      {/* 1. HERO */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 px-6 md:px-12 bg-ivory text-center">
        <div className="max-w-3xl mx-auto space-y-5">
          <span className="text-[11px] uppercase tracking-[0.25em] text-gold font-semibold block">
            {t('hero.kicker')}
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-deep-brown leading-tight">
            {t('hero.title')}
          </h1>
          <p className="text-sm md:text-base text-charcoal/80 font-light max-w-xl mx-auto pt-1">
            {t('hero.subtitle')}
          </p>
        </div>
      </section>

      {/* 2. MAIN CONTACT & FORM SECTION */}
      <section className="pt-6 pb-16 md:pt-8 md:pb-20 px-6 md:px-12 bg-ivory">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Contact Info & Demo Booking Card Option */}
          <div className="lg:col-span-5 space-y-8">
            {/* DEMO BOOKING FORM CARD OPTION */}
            {SHOW_VEHICLE && (
            <div className="p-7 sm:p-8 bg-deep-brown text-ivory rounded-xs border border-gold/40 shadow-xl relative overflow-hidden group">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-semibold block">
                    {t('demoCard.badge')}
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-ivory">
                    {t('demoCard.title')}
                  </h3>
                  <p className="text-xs text-ivory/80 font-light max-w-sm leading-relaxed">
                    {t('demoCard.description')}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold shrink-0 shadow-xs">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => {
                    setDemoFormSubmitted(false);
                    setDemoPhoneError('');
                    setDemoModalOpen(true);
                  }}
                  className="px-6 py-3 bg-gold text-ivory font-bold text-xs rounded-xs hover:bg-white hover:text-charcoal transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <span>{t('demoCard.button')}</span>
                  <ArrowRight className="w-4 h-4 text-deep-brown" />
                </button>
              </div>
            </div>
            )}

            <div className="space-y-4">
              <span className="text-[11px] uppercase tracking-[0.25em] text-gold font-semibold block">
                {t('info.kicker')}
              </span>
              <h2 className="font-serif text-3xl font-bold text-deep-brown">
                Eternal Repos
              </h2>
              <p className="text-xs text-charcoal/80 font-light leading-relaxed">
                {t('info.description')}
              </p>

              <div className="space-y-4 text-xs font-light text-charcoal/90 pt-2">
                <div className="flex items-start gap-3.5 p-3 rounded-xs bg-white border border-gold/15">
                  <MapPin className="w-4.5 h-4.5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-deep-brown font-semibold">{t('info.officeLabel')}</strong>
                    <span>{t('info.officeAddress')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3 rounded-xs bg-white border border-gold/15">
                  <Mail className="w-4.5 h-4.5 text-gold shrink-0" />
                  <div>
                    <strong className="block text-deep-brown font-semibold">{t('info.emailLabel')}</strong>
                    <a href="mailto:care@eternalrepos.com" className="inline-block py-1.5 hover:text-gold transition-colors">care@eternalrepos.com</a>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3 rounded-xs bg-white border border-gold/15">
                  <Phone className="w-4.5 h-4.5 text-gold shrink-0" />
                  <div>
                    <strong className="block text-deep-brown font-semibold">{t('info.phoneLabel')}</strong>
                    <span>{t('info.phoneDisplay')}</span>
                  </div>
                </div>
                <p className="text-[11px] text-charcoal/50 font-light pt-1">{t('info.entityLine')}</p>
              </div>
            </div>

            {/* Map embed — Noida office */}
            <div className="rounded-xs overflow-hidden border border-gold/20 shadow-sm">
              <iframe
                title={t('map.iframeTitle')}
                src="https://www.google.com/maps?q=ATS%20Bouquet%2C%20Sector%20132%2C%20Noida%20201304&output=embed"
                className="w-full h-56 md:h-64 block"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>

            {/* Embedded Map Graphic */}
            <div className="p-5 bg-blush/50 border border-gold/25 rounded-xs space-y-2.5">
              <span className="text-[11px] text-gold font-bold uppercase tracking-wider block">{t('whereWeServe.badge')}</span>
              <p className="text-xs text-charcoal/80 font-light">
                <strong>{t('whereWeServe.hereLabel')}</strong> {t('whereWeServe.hereText')}
              </p>
              <p className="text-xs text-charcoal/60 font-light">
                <strong>{t('whereWeServe.corridorsLabel')}</strong> {t('whereWeServe.corridorsText')}
              </p>
            </div>
          </div>

          {/* Right Original Form */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 border border-gold/25 rounded-xs shadow-lg">
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-deep-brown mb-2">
              {t('form.title')}
            </h3>
            <p className="text-xs md:text-sm text-charcoal/70 font-light mb-8">
              {t('form.subtitle')}
            </p>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {honeypot.field}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-deep-brown uppercase tracking-wider mb-1.5">
                      {t('form.fullNameLabel')}
                    </label>
                    <input
                      type="text"
                      required
                      value={formState.fullName}
                      onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                      placeholder={t('form.fullNamePlaceholder')}
                      className="w-full px-4 py-3 bg-ivory/40 border border-gold/25 rounded-xs text-sm focus:outline-hidden focus:border-gold transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-deep-brown uppercase tracking-wider mb-1.5">
                      {t('form.organizationLabel')}
                    </label>
                    <input
                      type="text"
                      value={formState.organization}
                      onChange={(e) => setFormState({ ...formState, organization: e.target.value })}
                      placeholder={t('form.organizationPlaceholder')}
                      className="w-full px-4 py-3 bg-ivory/40 border border-gold/25 rounded-xs text-sm focus:outline-hidden focus:border-gold transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-deep-brown uppercase tracking-wider mb-1.5">City (optional)</label>
                  <input
                    type="text"
                    value={formState.city}
                    onChange={(e) => setFormState({ ...formState, city: e.target.value })}
                    placeholder="e.g. Delhi, Noida, Gurugram"
                    className="w-full px-4 py-3 bg-ivory/40 border border-gold/25 rounded-xs text-sm focus:outline-hidden focus:border-gold transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-deep-brown uppercase tracking-wider mb-1.5">
                      {t('form.phoneLabel')}
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={14}
                      value={formState.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^\d+]/g, '');
                        setFormState({ ...formState, phone: val });
                        if (phoneError) setPhoneError('');
                      }}
                      placeholder={t('form.phonePlaceholder')}
                      className={`w-full px-4 py-3 bg-ivory/40 border ${
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
                      {t('form.emailLabel')}
                    </label>
                    <input
                      type="email"
                      required
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      placeholder={t('form.emailPlaceholder')}
                      className="w-full px-4 py-3 bg-ivory/40 border border-gold/25 rounded-xs text-sm focus:outline-hidden focus:border-gold transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-deep-brown uppercase tracking-wider mb-1.5">
                    {t('form.enquiryTypeLabel')}
                  </label>
                  <select
                    value={formState.enquiryType}
                    onChange={(e) => setFormState({ ...formState, enquiryType: e.target.value })}
                    className="w-full px-4 py-3 bg-ivory/40 border border-gold/25 rounded-xs text-sm focus:outline-hidden focus:border-gold transition-colors"
                  >
                    <option value="General Enquiry">{t('form.enquiryOptions.general')}</option>
                    <option value="Family Ceremonial Mobility">{t('form.enquiryOptions.familyMobility')}</option>
                    <option value="Institutional Partnership">{t('form.enquiryOptions.institutionalPartnership')}</option>
                    <option value="Custom Coachbuilding Fabrication">{t('form.enquiryOptions.customCoachbuilding')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-deep-brown uppercase tracking-wider mb-1.5">
                    {t('form.messageLabel')}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    placeholder={t('form.messagePlaceholder')}
                    className="w-full px-4 py-3 bg-ivory/40 border border-gold/25 rounded-xs text-sm focus:outline-hidden focus:border-gold resize-none transition-colors"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-deep-brown text-ivory font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-deep-brown/90 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>{loading ? t('form.submitSending') : t('form.submitIdle')}</span>
                  <ArrowRight className="w-4 h-4 text-gold" />
                </button>
              </form>
            ) : (
              <div className="text-center py-14 space-y-3">
                <CheckCircle2 className="w-14 h-14 text-gold mx-auto mb-2" />
                <h3 className="font-serif text-3xl font-bold text-deep-brown">{t('form.successTitle')}</h3>
                <p className="text-xs md:text-sm text-charcoal/80 max-w-xs mx-auto font-light leading-relaxed">
                  {t('form.successMessage', { name: formState.fullName })}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. URGENT 24/7 OPERATIONAL HELPLINE BANNER */}
      <section className="py-12 px-6 md:px-12 bg-deep-brown text-ivory border-y border-gold/30">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left">
            <div className="w-14 h-14 rounded-full border border-gold/50 bg-gold/15 flex items-center justify-center text-gold shrink-0 shadow-gold-subtle">
              <ShieldAlert className="w-7 h-7 text-gold" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] sm:text-[11px] text-gold uppercase tracking-[0.2em] font-bold block">
                {t('helpline.badge')}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl md:text-3xl text-white font-normal">
                {t('helpline.heading')}
              </h3>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full lg:w-auto">
            <a
              href="tel:+918448661338"
              className="w-full sm:w-auto px-7 py-4 bg-gold text-ivory font-bold text-xs md:text-sm rounded-xs hover:bg-white hover:text-charcoal transition-all duration-300 flex items-center justify-center gap-2.5 shadow-md cursor-pointer"
            >
              <Phone className="w-4 h-4 fill-current text-deep-brown" />
              <span>{t('helpline.callButton')}</span>
            </a>
            <a
              href="https://wa.me/918448661338"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-7 py-4 bg-white/5 border border-gold/40 text-white text-xs md:text-sm font-bold uppercase tracking-wider rounded-xs hover:border-gold hover:text-gold transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-gold" />
              <span>{t('helpline.whatsappButton')}</span>
            </a>
          </div>
        </div>
      </section>

      {/* DEMO BOOKING POPUP MODAL */}
      <AnimatePresence>
        {demoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-deep-brown/75 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setDemoModalOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-ivory text-charcoal max-w-lg w-full p-8 sm:p-10 rounded-xs shadow-2xl relative border border-gold/30"
            >
              <button
                onClick={() => setDemoModalOpen(false)}
                className="absolute top-5 right-5 text-charcoal/60 hover:text-deep-brown p-1 transition-colors cursor-pointer"
                aria-label={t('demoModal.closeAriaLabel')}
              >
                <X className="w-5 h-5" />
              </button>

              {!demoFormSubmitted ? (
                <>
                  <div className="mb-6 space-y-1">
                    <span className="text-[10px] text-gold font-bold uppercase tracking-widest block">
                      {t('demoModal.badge')}
                    </span>
                    <h3 className="font-serif text-3xl font-bold text-deep-brown">
                      {t('demoModal.title')}
                    </h3>
                    <p className="text-xs text-charcoal/75 font-light pt-0.5">
                      {t('demoModal.subtitle')}
                    </p>
                  </div>

                  <form onSubmit={handleDemoSubmit} className="space-y-4">
                    {demoHoneypot.field}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-deep-brown uppercase tracking-wider mb-1.5">
                          {t('demoModal.fullNameLabel')}
                        </label>
                        <input
                          type="text"
                          required
                          value={demoFormState.fullName}
                          onChange={(e) => setDemoFormState({ ...demoFormState, fullName: e.target.value })}
                          placeholder={t('demoModal.fullNamePlaceholder')}
                          className="w-full px-4 py-3 bg-white border border-gold/25 rounded-xs text-sm focus:outline-hidden focus:border-gold transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-deep-brown uppercase tracking-wider mb-1.5">
                          {t('demoModal.phoneLabel')}
                        </label>
                        <input
                          type="tel"
                          required
                          maxLength={14}
                          value={demoFormState.phone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^\d+]/g, '');
                            setDemoFormState({ ...demoFormState, phone: val });
                            if (demoPhoneError) setDemoPhoneError('');
                          }}
                          placeholder={t('demoModal.phonePlaceholder')}
                          className={`w-full px-4 py-3 bg-white border ${
                            demoPhoneError ? 'border-red-500 ring-1 ring-red-500' : 'border-gold/25'
                          } rounded-xs text-sm focus:outline-hidden focus:border-gold transition-colors`}
                        />
                        {demoPhoneError && (
                          <span className="text-[11px] text-red-600 font-medium block mt-1">
                            {demoPhoneError}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-deep-brown uppercase tracking-wider mb-1.5">
                          {t('demoModal.emailLabel')}
                        </label>
                        <input
                          type="email"
                          required
                          value={demoFormState.email}
                          onChange={(e) => setDemoFormState({ ...demoFormState, email: e.target.value })}
                          placeholder={t('demoModal.emailPlaceholder')}
                          className="w-full px-4 py-3 bg-white border border-gold/25 rounded-xs text-sm focus:outline-hidden focus:border-gold transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-deep-brown uppercase tracking-wider mb-1.5">
                          {t('demoModal.preferredDateLabel')}
                        </label>
                        <input
                          type="date"
                          required
                          value={demoFormState.preferredDate}
                          onChange={(e) => setDemoFormState({ ...demoFormState, preferredDate: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gold/25 rounded-xs text-sm focus:outline-hidden focus:border-gold transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-deep-brown uppercase tracking-wider mb-1.5">
                        {t('demoModal.organizationLabel')}
                      </label>
                      <input
                        type="text"
                        value={demoFormState.organization}
                        onChange={(e) => setDemoFormState({ ...demoFormState, organization: e.target.value })}
                        placeholder={t('demoModal.organizationPlaceholder')}
                        className="w-full px-4 py-3 bg-white border border-gold/25 rounded-xs text-sm focus:outline-hidden focus:border-gold transition-colors"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={demoLoading}
                      className="w-full py-4 bg-gold text-ivory font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-deep-brown hover:text-ivory transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md mt-2"
                    >
                      <span>{demoLoading ? t('demoModal.submitProcessing') : t('demoModal.submitIdle')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="w-14 h-14 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif text-3xl font-bold text-deep-brown">
                      {t('demoModal.successTitle')}
                    </h3>
                    <p className="text-xs text-charcoal/80 font-light max-w-sm mx-auto leading-relaxed pt-1">
                      {t('demoModal.successMessagePrefix')} <strong className="font-semibold text-deep-brown">{demoFormState.fullName}</strong>. {t('demoModal.successMessageSuffix')}
                    </p>
                  </div>
                  <button
                    onClick={() => setDemoModalOpen(false)}
                    className="px-6 py-3 bg-deep-brown text-ivory font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-deep-brown transition-colors shadow-xs cursor-pointer"
                  >
                    {t('demoModal.closeButton')}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Verse text={t('verse.text')} attr={t('verse.attr')} />
    </div>
  );
};

