import React, { useState, useEffect } from 'react';
import { SHOW_VEHICLE } from '../config/features';
import { Link, useLocation } from 'react-router-dom';
import { Mail, Phone, ArrowUpRight, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Social creative slides — the 'Prelude' teaser series (portrait 4:5), from our feed.
// Featured ordered story — 'We Prepare' (read 1 -> 6). Alt text comes from i18n (footer.social.featuredAlts).
const FEATURED_IMAGES = [
  '/assets/social/social_13.jpg',
  '/assets/social/social_14.jpg',
  '/assets/social/social_15.jpg',
  '/assets/social/social_16.jpg',
  '/assets/social/social_17.jpg',
  '/assets/social/social_18.jpg',
];

// Drifting strip — the rest of the series. Alt text comes from i18n (footer.social.stripAlts).
const STRIP_IMAGES = [
  '/assets/social/social_5.jpg',
  '/assets/social/social_7.jpg',
  '/assets/social/social_8.jpg',
  '/assets/social/social_9.jpg',
  '/assets/social/social_10.jpg',
  '/assets/social/social_11.jpg',
  '/assets/social/social_12.jpg',
  '/assets/social/social_6.jpg',
  '/assets/social/social_1.jpg',
  '/assets/social/social_2.jpg',
  '/assets/social/social_3.jpg',
  '/assets/social/social_4.jpg',
];

// Brand creatives (portrait 4:5): quotes, questions and family-first messages.
const BRAND_CREATIVES: { img: string; alt: string }[] = [
  { img: '/assets/social/brand_01.webp', alt: 'At a difficult time, a family needs presence, not logistics' },
  { img: '/assets/social/brand_02.webp', alt: 'अगर एक आम शाम लौटा सकते — तो कौन सी?' },
  { img: '/assets/social/brand_03.webp', alt: "Strength isn't carrying everything alone. Sometimes it's letting someone help" },
  { img: '/assets/social/brand_04.webp', alt: 'Ghar lautna — sabse purani khushi' },
  { img: '/assets/social/brand_05.webp', alt: "You grieve. We'll carry the rest" },
  { img: '/assets/social/brand_06.webp', alt: 'पहला श्लोक, एक दुःख से जन्मा था' },
  { img: '/assets/social/brand_07.webp', alt: 'Some lives leave behind more than memories. They leave behind a way of living' },
  { img: '/assets/social/brand_08.webp', alt: 'The days we miss most are rarely the biggest ones' },
  { img: '/assets/social/brand_09.webp', alt: 'Because I could not stop for Death — Emily Dickinson' },
  { img: '/assets/social/brand_10.webp', alt: 'Death is not extinguishing the light — Rabindranath Tagore' },
  { img: '/assets/social/brand_11.webp', alt: 'Though nothing can bring back the hour of splendour in the grass — William Wordsworth' },
  { img: '/assets/social/brand_12.webp', alt: 'अगर आप पीछे सिर्फ़ एक चिट्ठी छोड़ पाते — तो वो किसके नाम होती?' },
  { img: '/assets/social/brand_13.webp', alt: 'Dadu-dadi, nana-nani ki wo kaunsi yaad hai jo aaj tak aapke saath hai?' },
  { img: '/assets/social/brand_14.webp', alt: 'What is something you wish you had asked your father while you still could?' },
  { img: '/assets/social/brand_15.webp', alt: "Don't grieve. Anything you lose comes round in another form — Rumi" },
  { img: '/assets/social/brand_16.webp', alt: 'You stay with family. We carry the rest' },
  { img: '/assets/social/brand_17.webp', alt: 'मुश्किल समय में परिवार को साथ होना चाहिए, व्यवस्थाओं में उलझना नहीं' },
];

const SocialCarousel: React.FC = () => {
  const { t } = useTranslation('footer');
  const featuredAlts = t('social.featuredAlts', { returnObjects: true }) as string[];
  const stripAlts = t('social.stripAlts', { returnObjects: true }) as string[];
  const FEATURED = [...FEATURED_IMAGES.map((img, idx) => ({ img, alt: featuredAlts[idx] })), ...BRAND_CREATIVES];
  const STRIP = [...STRIP_IMAGES.map((img, idx) => ({ img, alt: stripAlts[idx] })), ...BRAND_CREATIVES];
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [stripPaused, setStripPaused] = useState(false);
  const n = FEATURED.length;
  const go = (d: number) => setI((p) => (p + d + n) % n);
  const loop = [...STRIP, ...STRIP];

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((p) => (p + 1) % n), 5200);
    return () => clearInterval(t);
  }, [paused, n]);

  return (
    <section className="bg-ivory border-t border-gold/15 py-20 md:py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="text-center mb-10 md:mb-14">
          <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold block mb-3">
            {t('social.kicker')}
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-semibold text-deep-brown leading-tight">
            {t('social.heading')}
          </h2>
        </div>

        {/* Featured ordered carousel */}
        <div
          className="relative mx-auto w-full max-w-[400px]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative overflow-hidden rounded-sm aspect-[4/5] bg-blush border border-gold/15 shadow-[0_30px_80px_rgba(58,54,47,0.18)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
              >
                <img src={FEATURED[i].img} alt={FEATURED[i].alt} className="w-full h-full object-cover" />
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            onClick={() => go(-1)}
            aria-label={t('social.prevAria')}
            className="absolute left-3 md:-left-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 backdrop-blur border border-gold/15 flex items-center justify-center text-deep-brown hover:bg-white hover:-translate-y-[calc(50%+2px)] transition-all shadow-sm cursor-pointer z-20"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => go(1)}
            aria-label={t('social.nextAria')}
            className="absolute right-3 md:-right-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 backdrop-blur border border-gold/15 flex items-center justify-center text-deep-brown hover:bg-white hover:-translate-y-[calc(50%+2px)] transition-all shadow-sm cursor-pointer z-20"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-4 mt-6 text-xs tracking-[0.2em] text-deep-brown/60 font-semibold" aria-live="polite">
            <span>{String(i + 1).padStart(2, '0')}</span>
            <span className="relative block h-px w-28 bg-deep-brown/15" aria-hidden="true">
              <span className="absolute inset-y-0 left-0 bg-gold h-px transition-all duration-500" style={{ width: `${((i + 1) / n) * 100}%` }} />
            </span>
            <span>{String(n).padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      {/* Drifting strip of the rest of the series */}
      <div
        className="soc-marquee relative mt-14 md:mt-16"
        onMouseEnter={() => setStripPaused(true)}
        onMouseLeave={() => setStripPaused(false)}
      >
        <div className={`soc-track flex w-max ${stripPaused ? 'is-paused' : ''}`}>
          {loop.map((s, idx) => (
            <div
              key={idx}
              className="shrink-0 mr-4 md:mr-5 w-[132px] sm:w-[150px] md:w-[168px] aspect-[4/5] rounded-sm overflow-hidden bg-blush border border-gold/15 shadow-[0_14px_36px_rgba(58,54,47,0.10)]"
            >
              <img src={s.img} alt={s.alt} className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-28 bg-gradient-to-r from-ivory to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-28 bg-gradient-to-l from-ivory to-transparent z-10" />
      </div>

      <div className="text-center mt-12">
        <a
          href="https://www.instagram.com/eternal.repos"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 py-2.5 text-xs uppercase tracking-[0.2em] font-semibold text-gold hover:text-deep-brown transition-colors"
        >
          {t('social.followStory')} <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
};

export const Footer: React.FC = () => {
  const isInstitutionsPage = useLocation().pathname.replace(/\/+$/, '') === '/institutions';
  const { t } = useTranslation('footer');
  return (
    <>
      <SocialCarousel />

      <footer className="bg-deep-brown text-ivory pt-20 md:pt-24 pb-10 relative overflow-hidden">
        <div className="footer-wm" aria-hidden="true" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

          {/* Grand, airy brand statement */}
          <div className="max-w-3xl mb-16 md:mb-24">
            <img
              src="/assets/logo-brand-v2.png"
              alt="Eternal Repos"
              className="h-20 md:h-28 w-auto object-contain mb-8"
            />
            <p className="font-serif text-2xl md:text-4xl font-light leading-[1.35] text-ivory/95">
              {t('brand.statement')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-10 pb-12 border-b border-white/10">

            {/* Explore */}
            <div className="md:col-span-4">
              <h4 className="text-[11px] uppercase tracking-[0.24em] text-gold font-semibold mb-6">
                {t('explore.heading')}
              </h4>
              <ul className="space-y-4 text-sm font-light">
                <li><Link to="/about" className="inline-block py-1.5 text-ivory/75 hover:text-gold transition-colors">{t('explore.links.about')}</Link></li>
                <li><Link to="/our-story" className="inline-block py-1.5 text-ivory/75 hover:text-gold transition-colors">{t('explore.links.ourStory')}</Link></li>
                <li><Link to="/services" className="inline-block py-1.5 text-ivory/75 hover:text-gold transition-colors">{t('explore.links.services')}</Link></li>
                {SHOW_VEHICLE && <li><Link to="/vehicle" className="inline-block py-1.5 text-ivory/75 hover:text-gold transition-colors">{t('explore.links.vehicle')}</Link></li>}
                <li><Link to="/institutions" className="inline-block py-1.5 text-ivory/75 hover:text-gold transition-colors">{t('explore.links.institutions')}</Link></li>
                <li><Link to="/vision" className="inline-block py-1.5 text-ivory/75 hover:text-gold transition-colors">{t('explore.links.vision')}</Link></li>
                <li><Link to="/faq" className="inline-block py-1.5 text-ivory/75 hover:text-gold transition-colors">{t('explore.links.faq')}</Link></li>
              </ul>
            </div>

            {/* Reach us */}
            <div className="md:col-span-4">
              <h4 className="text-[11px] uppercase tracking-[0.24em] text-gold font-semibold mb-6">
                {t('reachUs.heading')}
              </h4>
              <div className="space-y-4 text-sm font-light">
                <a href="tel:+918448661338" className="flex items-center gap-3 py-1.5 text-ivory/75 hover:text-gold transition-colors">
                  <Phone className="w-4 h-4 text-gold shrink-0" />
                  <span>+91 84486 61338</span>
                </a>
                <a href="mailto:care@eternalrepos.com" className="flex items-center gap-3 py-1.5 text-ivory/75 hover:text-gold transition-colors">
                  <Mail className="w-4 h-4 text-gold shrink-0" />
                  <span>care@eternalrepos.com</span>
                </a>
                {isInstitutionsPage && (
                  <a href="mailto:management@eternalrepos.com" className="flex items-center gap-3 py-1.5 text-ivory/75 hover:text-gold transition-colors">
                    <Mail className="w-4 h-4 text-gold shrink-0" />
                    <span>management@eternalrepos.com</span>
                  </a>
                )}
                <p className="text-ivory/50 text-sm pt-2 leading-relaxed">
                  {t('reachUs.tagline')}
                </p>
              </div>
            </div>

            {/* Follow */}
            <div className="md:col-span-4">
              <h4 className="text-[11px] uppercase tracking-[0.24em] text-gold font-semibold mb-6">
                {t('stayClose.heading')}
              </h4>
              <div className="flex flex-col gap-4 text-sm font-light">
                <a href="https://www.instagram.com/eternal.repos" target="_blank" rel="noreferrer" className="text-ivory/75 hover:text-gold flex items-center gap-1.5 py-1.5 transition-colors">{t('stayClose.instagram')} <ArrowUpRight className="w-3.5 h-3.5" /></a>
                <a href="https://www.linkedin.com/company/eternal-repos/" target="_blank" rel="noreferrer" className="text-ivory/75 hover:text-gold flex items-center gap-1.5 py-1.5 transition-colors">{t('stayClose.linkedin')} <ArrowUpRight className="w-3.5 h-3.5" /></a>
                <a href="https://www.facebook.com/share/1DPrR2xkX2/" target="_blank" rel="noreferrer" className="text-ivory/75 hover:text-gold flex items-center gap-1.5 py-1.5 transition-colors">{t('stayClose.facebook')} <ArrowUpRight className="w-3.5 h-3.5" /></a>
                <a href="https://wa.me/918448661338" target="_blank" rel="noreferrer" className="text-ivory/75 hover:text-gold flex items-center gap-1.5 py-1.5 transition-colors">{t('stayClose.whatsapp')} <ArrowUpRight className="w-3.5 h-3.5" /></a>
              </div>
            </div>
          </div>

          {/* Legal bar */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-[11px] text-ivory/50 gap-5">
            <p>{t('legal.copyright')}</p>
            <div className="flex flex-wrap items-center gap-6">
              <Link to="/privacy-policy" className="py-2 hover:text-gold transition-colors">{t('legal.privacyPolicy')}</Link>
              <Link to="/terms-of-use" className="py-2 hover:text-gold transition-colors">{t('legal.termsOfUse')}</Link>
              <div className="flex items-center gap-[6px] p-[4px_8px] border border-white/15 rounded-[6px] bg-white/5 backdrop-blur-xs">
                <a href="https://fabulousmedia.in" target="_blank" rel="noopener noreferrer" aria-label="FabulousMedia" className="relative flex items-center justify-center bg-white p-1 rounded-[4px] opacity-80 hover:opacity-100 transition-all cursor-pointer after:absolute after:-inset-2.5 after:content-['']">
                  <img src="/assets/sitecredit/fabulousmedia.svg" onError={(e) => { (e.target as HTMLImageElement).src = 'https://play.fabulousmedia.in/sitecredit/images/fabulousmedia.svg'; }} alt="FabulousMedia" className="h-[10px] w-auto block pointer-events-none" />
                </a>
                <div className="w-[1px] h-[10px] bg-white/20"></div>
                <a href="https://gocommercially.com" target="_blank" rel="noopener noreferrer" aria-label="GoCommercially" className="relative flex items-center justify-center bg-white p-1 rounded-[4px] opacity-80 hover:opacity-100 transition-all cursor-pointer after:absolute after:-inset-2.5 after:content-['']">
                  <img src="/assets/sitecredit/gocommercially.svg" onError={(e) => { (e.target as HTMLImageElement).src = 'https://play.fabulousmedia.in/sitecredit/images/gocommercially.svg'; }} alt="GoCommercially" className="h-[10px] w-auto block pointer-events-none" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
