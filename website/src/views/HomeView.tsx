import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TESTIMONIALS } from '../data/testimonials';
import { TestimonialCarousel } from '../components/TestimonialCarousel';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { AwardBand } from '../components/AwardBand';
import { ArrowRight, ShieldCheck, ChevronRight, ChevronLeft, Eye, Wind, Layers, Camera, HeartHandshake, Flower2, Heart, Stethoscope, Building2, Landmark, Users, Truck, Globe2, Check } from 'lucide-react';
import { updatePageSEO } from '../utils/seo';
import { ArrangeServiceWizard } from '../components/services/arrange-wizard/ArrangeServiceWizard';
import { SHOW_VEHICLE } from '../config/features';
import { JOURNEY_STEPS, COMPARE_ROWS, TAG_LABEL, type ServiceTag } from '../data/homeServices';

const FIRST_DAY_BEATS = [
  { time: 'The call', title: 'A voice answers', desc: 'Whatever the hour — calm, unhurried, already moving.', color: '#5E6B54', to: '#7F8A63', icon: 'icon_c1', chips: [] as string[] },
  { time: 'Without delay', title: 'We come to you', desc: 'We bring them home, gently, so nothing waits on you.', color: '#7F8A63', to: '#9E8A6E', icon: 'icon_c2', chips: [] as string[] },
  { time: 'The same day', title: 'The weight lifts', desc: 'Everything a farewell asks for — arranged in your tradition:', color: '#9E8A6E', to: '#B98C71', icon: 'icon_c3', chips: ['the transport', 'the papers', 'the coordination', 'the flowers', 'the hall', 'the permissions', 'the relatives'] },
  { time: 'By evening', title: 'You are together', desc: 'While we hold the rest, your family simply grieves.', color: '#B98C71', to: null, icon: 'icon_c4', chips: [] as string[] },
];

const CARE_ARC = [
  { label: 'Bringing them home' },
  { label: 'A farewell in your tradition' },
  { label: 'Flowers & tributes' },
  { label: 'The vehicle', veh: true },
  { label: 'Grief & remembrance' },
  { label: 'Keepsakes & memory' },
  { label: 'Documentation guidance' },
];

const SERVICES_LIST = [
  {
    title: 'Transport & Documentation Support',
    btnLabel: 'TRANSPORT & DOCUMENTATION SUPPORT',
    category: 'Immediate Help',
    path: '/services/detail/transport-and-documentation-support',
    img: '/assets/services/transport_support.jpg',
  },
  {
    title: 'Pre & Post Funeral Service Coordination',
    btnLabel: 'PRE & POST FUNERAL SERVICE COORDINATION',
    category: 'Immediate Help',
    path: '/services/detail/funeral-service-coordination',
    img: '/assets/services/funeral_coordination.jpg',
  },
  {
    title: 'Prayer Hall Booking',
    btnLabel: 'PRAYER HALL BOOKING',
    category: 'Prayer & Remembrance',
    path: '/services/detail/prayer-hall-booking',
    img: '/assets/services/prayer_hall_booking.jpg',
  },
  {
    title: 'Hall Decoration',
    btnLabel: 'HALL DECORATION',
    category: 'Prayer & Remembrance',
    path: '/services/detail/hall-decoration',
    img: '/assets/services/hall_decoration.jpg',
  },
  {
    title: 'Catering',
    btnLabel: 'CATERING',
    category: 'Prayer & Remembrance',
    path: '/services/detail/catering',
    img: '/assets/services/funeral_catering.jpg',
  },
  {
    title: 'Obituary Writing',
    btnLabel: 'OBITUARY WRITING',
    category: 'Prayer & Remembrance',
    path: '/services/detail/obituary-writing',
    img: '/assets/services/obituary_writing.jpg',
  },
  {
    title: 'Memorial Service & Memory Mementos',
    btnLabel: 'MEMORIAL SERVICE & MEMORY MEMENTOS',
    category: 'Prayer & Remembrance',
    path: '/services/detail/memorial-service-and-memory-mementos',
    img: '/assets/services/memorial_mementos.jpg',
  },
  {
    title: 'Funeral Flower Decor',
    btnLabel: 'FUNERAL FLOWER DECOR',
    category: 'Prayer & Remembrance',
    path: '/services/detail/funeral-flower-decor',
    img: '/assets/services/memorial_floral_hall.jpg',
  },
  {
    title: 'Asthi Visarjan',
    btnLabel: 'ASTHI VISARJAN',
    category: 'Family Support',
    path: '/asthi-visarjan',
    img: '/assets/services/asthi_visarjan.jpg',
  },
  {
    title: 'Grief Counselling',
    btnLabel: 'GRIEF COUNSELLING',
    category: 'Family Support',
    path: '/services/detail/grief-counselling',
    img: '/assets/services/grief_counselling.jpg',
  },
  {
    title: 'Subscription / Pre-Booking Plans',
    btnLabel: 'SUBSCRIPTION / PRE-BOOKING PLANS',
    category: 'Peace of Mind',
    path: '/services/detail/subscription-pre-booking-plans',
    img: '/assets/services/financial_preplanning.jpg',
  },
  {
    title: 'Insurance Company Tie-Ups',
    btnLabel: 'INSURANCE COMPANY TIE-UPS',
    category: 'Peace of Mind',
    path: '/services/detail/insurance-company-tie-ups',
    img: '/assets/services/insurance_tieups.jpg',
  },
  {
    title: 'International Repatriation',
    btnLabel: 'INTERNATIONAL REPATRIATION',
    category: 'Special Assistance',
    path: '/services/detail/international-repatriation',
    img: '/assets/services/international_repatriation.jpg',
  },
  {
    title: 'End-to-End Documentation Assistance',
    btnLabel: 'END-TO-END DOCUMENTATION ASSISTANCE',
    category: 'Special Assistance',
    path: '/services/detail/end-to-end-documentation-assistance-intercity-international',
    img: '/assets/services/documentation_assistance.jpg',
  },
];





const PARTNERS = [
  {
    tab: 'Hospitals',
    title: 'In Partnership with Hospitals & Hospices',
    badge: 'Official Hospital Partner Network',
    desc: 'We are in official partnership with leading hospitals across Delhi NCR. When a patient passes away, our empanelled team takes over at the ward door — handling all post-life transfers, mortuary coordination, documentation assistance, and compassionate family guidance so medical teams can stay focused on clinical care.',
    lifts: [
      'Empanelled 24×7 hospital transfer protocol',
      'Immediate ward & mortuary clearance coordination',
      'Hospital death slip & clearance documentation guidance',
      'Zero logistics burden on hospital doctors & nursing staff',
      'Compassionate, respectful bedside handholding for families',
    ],
  },
  { tab: 'Care homes', title: 'Care & retirement homes', desc: "A familiar, gentle presence for residents' final journey — handled with the tenderness of people you've trusted with your families for years, and with respect for the relationships you've built.", lifts: ['Dignified departure from the home', 'Family coordination', 'Continuity of the care you gave'] },
  { tab: 'Faith', title: 'Faith institutions & communities', desc: 'We honour the rites of every tradition — coordinating with priests, temples, mosques, churches and gurudwaras so the farewell follows custom exactly, and nothing feels unfamiliar or rushed.', lifts: ['Ritual & multi-faith coordination', 'Timing to custom', 'Community trust, upheld'] },
  { tab: 'Civic', title: 'Civic bodies & trusts', desc: 'Dignified handling at scale — for communities, welfare programmes and the moments that ask for quiet public responsibility, delivered with the same respect we give every single family.', lifts: ['Respectful handling at scale', 'Clear protocol & reporting', 'Public duty, done quietly'] },
];

const TAG_CLASS: Record<ServiceTag, string> = {
  live: 'bg-[#5E6B54]/10 text-[#45503d] border-[#5E6B54]/30',
  request: 'bg-transparent text-charcoal/70 border-charcoal/20',
  partner: 'bg-transparent text-charcoal/70 border-charcoal/20',
  soon: 'bg-[#B98C71]/15 text-[#8a5a3f] border-[#B98C71]/40',
};

const StatusTag: React.FC<{ tag: ServiceTag }> = ({ tag }) => (
  <span className={`shrink-0 text-[10px] uppercase tracking-[0.12em] font-semibold px-2 py-0.5 rounded-full border ${TAG_CLASS[tag]}`}>{TAG_LABEL[tag]}</span>
);

// "Bringing them *home*" -> bolds the *word* segments.
const kw = (text: string) =>
  text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith('*') && part.endsWith('*') ? (
      <strong key={i} className="font-semibold text-deep-brown">
        {part.slice(1, -1)}
      </strong>
    ) : (
      part
    )
  );

const HERO_SLIDES = [
  {
    id: 'hero-1',
    img: '/assets/hero/hero_slide_1.jpg',
    kicker: 'Standing beside families',
    titleLine1: 'Goodbye is heavy.',
    titleLine2: "You're not alone in it.",
    desc: "From the first call to the final rites, we stay beside your family — arranging all that a farewell asks for, gently and with dignity, so you can simply be with the one you've lost.",
    primaryCta: 'Talk to us — anytime',
    secondaryCta: 'How we can help',
    secondaryLink: '/services',
  },
  {
    id: 'hero-2',
    img: '/assets/hero/hero_slide_2.jpg',
    kicker: 'A Sacred Promise',
    titleLine1: 'A peaceful sanctuary',
    titleLine2: 'for every memory.',
    desc: 'Purpose-built ceremonial mobility and respectful coordination across Delhi NCR — giving your loved one the dignified, peaceful farewell they deserve.',
    primaryCta: 'Talk to us — anytime',
    secondaryCta: 'Our Vehicles & Fleet',
    secondaryLink: SHOW_VEHICLE ? '/vehicle' : '/services',
  },
  {
    id: 'hero-3',
    img: '/assets/hero/hero_slide_3.jpg',
    kicker: 'Tradition & Reverence',
    titleLine1: 'Sacred rituals upheld,',
    titleLine2: 'in your own tradition.',
    desc: 'From pure floral tributes and serene prayer halls to sacred Asthi Visarjan waters, our team guides you through every ritual with heartfelt warmth.',
    primaryCta: 'Talk to us — anytime',
    secondaryCta: 'Ritual & Family Care',
    secondaryLink: '/asthi-visarjan',
  },
  {
    id: 'hero-4',
    img: '/assets/hero/hero_slide_4.jpg',
    kicker: 'Care That Stays',
    titleLine1: 'A gentle presence,',
    titleLine2: 'in the days that follow.',
    desc: 'Our care does not end at the crematorium. We remain beside your family for grief support, paperwork assistance, and lasting remembrance.',
    primaryCta: 'Talk to us — anytime',
    secondaryCta: 'Explore Support',
    secondaryLink: '/services',
  },
];

const JOURNEY_STEPS_HOME = [
  { title: 'The call' },
  { title: 'Bringing them home' },
  { title: 'The gathering' },
  { title: 'The last rites' },
  { title: 'The days after' },
];

interface HomeViewProps {
  onOpenConcierge: () => void;
  heroImage?: string;
}

export const HomeView: React.FC<HomeViewProps> = ({ onOpenConcierge, heroImage }) => {
  const { t } = useTranslation('home');

  useEffect(() => {
    updatePageSEO(t('seo.title'), t('seo.description'));
  }, []);

  const firstDayRef = useRef<HTMLDivElement>(null);
  const firstDayInView = useInView(firstDayRef, { once: true, margin: '-100px' });
  const bloomRef = useRef<SVGSVGElement>(null);
  const bloomInView = useInView(bloomRef, { once: true, margin: '-80px' });
  const fifthRef = useRef<HTMLDivElement>(null);
  const fifthInView = useInView(fifthRef, { once: true, margin: '-100px' });
  const partnersRef = useRef<HTMLDivElement>(null);
  const partnersInView = useInView(partnersRef, { once: true, margin: '-100px' });
  const [activePartner, setActivePartner] = useState(0);

  const [heroSlide, setHeroSlide] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  useEffect(() => {
    if (isHeroHovered) return;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const interval = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [isHeroHovered]);

  return (
    <div className="space-y-0">
      {/* 1. HERO CAROUSEL — Standing beside families */}
      <section
        aria-label={t('hero.ariaLabel')}
        className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-ivory"
        onMouseEnter={() => setIsHeroHovered(true)}
        onMouseLeave={() => setIsHeroHovered(false)}
      >
        {/* Background Images with smooth crossfade */}
        {HERO_SLIDES.map((slide, idx) => {
          const bgSrc = heroImage && idx === 0 ? heroImage : slide.img;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out pointer-events-none ${
                heroSlide === idx ? 'opacity-100 z-[1]' : 'opacity-0 z-0'
              }`}
            >
              <img
                src={bgSrc}
                alt=""
                aria-hidden="true"
                className={`absolute inset-0 w-full h-full object-cover object-right md:object-center opacity-50 transition-transform duration-[7000ms] ease-out ${
                  heroSlide === idx ? 'scale-105' : 'scale-100'
                }`}
              />
            </div>
          );
        })}

        {/* Main Hero Fold Content */}
        <div className="relative flex-1 flex items-end pt-28 md:pt-36 pb-12 md:pb-16 z-[3]">
          <div className="relative w-full max-w-5xl px-6 sm:px-10 md:px-16 lg:px-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={heroSlide}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative max-w-3xl"
              >
                <div className="inline-flex items-center gap-2.5 mb-6">
                  <span className="w-8 h-[1px] bg-gold/60 inline-block" />
                  <span className="text-[11px] uppercase tracking-[0.28em] font-semibold text-gold">
                    {t(`hero.slides.${heroSlide}.kicker`, { defaultValue: HERO_SLIDES[heroSlide].kicker })}
                  </span>
                </div>
                <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-semibold text-deep-brown tracking-tight leading-[1.05] mb-6">
                  {t(`hero.slides.${heroSlide}.titleLine1`, { defaultValue: HERO_SLIDES[heroSlide].titleLine1 })}
                  <br /> {t(`hero.slides.${heroSlide}.titleLine2`, { defaultValue: HERO_SLIDES[heroSlide].titleLine2 })}
                </h1>
                <p className="text-base md:text-xl text-charcoal/80 font-light leading-relaxed mb-10 max-w-2xl">
                  {t(`hero.slides.${heroSlide}.desc`, { defaultValue: HERO_SLIDES[heroSlide].desc })}
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
                  <button
                    onClick={onOpenConcierge}
                    className="px-8 py-4 bg-gold text-ivory font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-deep-brown transition-all duration-300 inline-flex items-center justify-center gap-2.5 group shadow-md hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>{t('common.ctaTalkAnytime', { defaultValue: HERO_SLIDES[heroSlide].primaryCta })}</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                  <Link
                    to={HERO_SLIDES[heroSlide].secondaryLink}
                    className="px-7 py-4 bg-white/70 backdrop-blur-xs border border-gold/60 text-deep-brown hover:bg-gold hover:text-ivory hover:border-gold font-semibold text-xs uppercase tracking-wider rounded-xs transition-all duration-300 inline-flex items-center justify-center gap-2.5 group hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>{t(`hero.slides.${heroSlide}.secondaryCta`, { defaultValue: HERO_SLIDES[heroSlide].secondaryCta })}</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>

          </div>
        </div>

        {/* Brand philosophy strip */}
        <div className="relative z-10 w-full bg-deep-brown text-ivory py-4 md:py-4.5 px-4 sm:px-8 md:px-12 border-t border-gold/20 shadow-inner flex items-center justify-center">
          <div className="max-w-7xl mx-auto text-center flex items-center justify-center gap-4">
            <span className="hidden xl:inline-block w-8 h-[1px] bg-gold/40 shrink-0" aria-hidden="true" />
            <p className="font-serif text-[13px] sm:text-[15px] md:text-[17px] lg:text-[19px] text-ivory/95 font-light tracking-wide md:whitespace-nowrap m-0 leading-normal">
              {t('hero.philosophy')}
            </p>
            <span className="hidden xl:inline-block w-8 h-[1px] bg-gold/40 shrink-0" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* 2. SERVICES — journey, categories with services, Eternal vs conventional */}
      <section id="services" className="py-20 md:py-28 px-6 md:px-12 bg-ivory border-t border-gold/10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header matching Image 2 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-2xl mx-auto mb-14 md:mb-16"
          >
            <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold block mb-3">
              {t('services.sectionLabel')}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-deep-brown leading-tight">
              {t('services.heading')}
            </h2>
          </motion.div>

          {/* A. The journey — what we do, step by step matching Image 2 */}
          <div className="mb-14 md:mb-16">
            <p className="text-center text-[11px] uppercase tracking-[0.24em] text-charcoal/60 font-semibold mb-8">
              {t('services.journeyLabel')}
            </p>
            <ol className="relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 md:gap-4">
              <div
                className="hidden md:block absolute top-[19px] left-[10%] right-[10%] h-px bg-gold/25"
                aria-hidden="true"
              />
              {JOURNEY_STEPS_HOME.map((st, i) => (
                <li
                  key={st.title}
                  className="relative flex items-center md:flex-col md:text-center gap-3.5 md:gap-0"
                >
                  <span className="relative z-10 shrink-0 w-10 h-10 rounded-full border border-gold/40 bg-ivory text-gold font-serif text-base flex items-center justify-center md:mb-3">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-serif text-sm sm:text-base text-deep-brown leading-tight">
                      {t(`services.journeySteps.${i}`, { defaultValue: st.title })}
                    </h3>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* B. All 14 services — Grid matching Image 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {SERVICES_LIST.map((s, idx) => {
              const isFeatured = idx < 2;
              return (
                <div
                  key={s.path}
                  className={`flex flex-col bg-white border border-gold/15 rounded-xs overflow-hidden shadow-xs hover:shadow-md hover:border-gold/30 transition-all duration-300 ${
                    isFeatured ? 'sm:col-span-2' : 'col-span-1'
                  }`}
                >
                  <Link
                    to={s.path}
                    className={`group relative block overflow-hidden ${
                      isFeatured ? 'h-52 sm:h-60 md:h-72' : 'h-44 sm:h-48'
                    }`}
                  >
                    {s.img && (
                      <img
                        src={s.img}
                        alt={t(`services.list.${idx}.title`, { defaultValue: s.title })}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                      />
                    )}
                  </Link>
                  <Link
                    to={s.path}
                    className="group px-4 sm:px-5 py-3 border-t border-gold/15 inline-flex items-center justify-between text-[11px] uppercase tracking-wider font-semibold text-deep-brown hover:text-gold transition-colors bg-white mt-auto"
                  >
                    <span className="truncate">{t(`services.list.${idx}.btnLabel`, { defaultValue: s.btnLabel })}</span>
                    <ArrowRight
                      className="w-3.5 h-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 3. LIFE-CIRCLE — TWO BLOOMS FROM ONE THREAD */}
      <section className="py-24 md:py-36 px-6 md:px-12 bg-blush/40 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold block mb-4">{t('lifeCircle.eyebrow')}</span>
            <h2 className="font-serif text-3xl md:text-5xl font-semibold text-deep-brown leading-[1.15]">
              {t('lifeCircle.heading')}
            </h2>
            <p className="mt-5 text-base md:text-lg text-charcoal/65 font-light leading-relaxed">{t('lifeCircle.subcopy')}</p>
          </motion.div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-4 lg:gap-8">
            {/* left legend — for the one who's gone */}
            <motion.div initial={{ opacity: 0, x: -14 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="order-2 md:order-1 w-full md:w-auto md:flex-1 md:max-w-[340px] md:text-right">
              <span className="text-[11px] uppercase tracking-[0.24em] text-gold font-semibold block mb-5 md:text-right">{t('lifeCircle.goneLabel')}</span>
              <ul className="space-y-4">
                {(t('lifeCircle.goneItems', { returnObjects: true }) as string[]).map((item) => (
                  <li key={item} className="flex items-center gap-3 md:justify-end whitespace-nowrap text-[19px] md:text-[17px] lg:text-[20px] text-charcoal/75 font-light"><span>{kw(item)}</span><span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" /></li>
                ))}
              </ul>
            </motion.div>

            {/* the bloom */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-70px" }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className="order-1 md:order-2 w-full max-w-[360px] md:max-w-[420px] md:flex-shrink-0">
              <svg ref={bloomRef} viewBox="0 0 440 300" className={`w-full h-auto bloom ${bloomInView ? 'play' : ''}`} role="img" aria-label={t('lifeCircle.bloomAriaLabel')}>
                <defs>
                  <radialGradient id="bloomMedallion">
                    <stop offset="0%" stopColor="#F7F1E7" stopOpacity="1" />
                    <stop offset="86%" stopColor="#F7F1E7" stopOpacity="1" />
                    <stop offset="100%" stopColor="#F7F1E7" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <line className="bloom-thread" x1="220" y1="4" x2="220" y2="62" stroke="currentColor" style={{ color: 'var(--color-gold)' }} strokeOpacity="0.3" strokeWidth="1" />
                <circle className="bloom-seed" cx="220" cy="4" r="1.6" fill="currentColor" style={{ color: 'var(--color-gold)' }} fillOpacity="0.4" />
                <g className="bloom-petals">
                <g style={{ color: 'var(--color-gold)' }}>
                  {[220, 250, 290, 320].map((a, i) => (
                    <path key={`l${i}`} className="bloom-petal" style={{ ['--p' as string]: i } as React.CSSProperties} d="M0 0 C 17 -20 29 -48 17 -74 C 10.5 -90 -10.5 -90 -17 -74 C -29 -48 -17 -20 0 0 Z" transform={`translate(220,150) rotate(${a})`} fill="currentColor" fillOpacity="0.13" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.1" />
                  ))}
                </g>
                <g style={{ color: '#B98C71' }}>
                  {[140, 110, 70, 40].map((a, i) => (
                    <path key={`r${i}`} className="bloom-petal" style={{ ['--p' as string]: i + 4 } as React.CSSProperties} d="M0 0 C 17 -20 29 -48 17 -74 C 10.5 -90 -10.5 -90 -17 -74 C -29 -48 -17 -20 0 0 Z" transform={`translate(220,150) rotate(${a})`} fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.1" />
                  ))}
                </g>
                </g>
                <g className="bloom-center">
                <circle cx="220" cy="150" r="62" fill="url(#bloomMedallion)" />
                <image className="emblem-sage" href="/assets/logo-emblem-sage.png" x="175" y="105" width="90" height="91" />
                <image className="emblem-gold" href="/assets/logo-emblem.png" x="175" y="105" width="90" height="91" />
                </g>
              </svg>
            </motion.div>

            {/* right legend — for the ones left behind */}
            <motion.div initial={{ opacity: 0, x: 14 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} className="order-3 w-full md:w-auto md:flex-1 md:max-w-[340px] md:text-left">
              <span className="text-[11px] uppercase tracking-[0.24em] font-semibold block mb-5 md:text-left" style={{ color: '#B98C71' }}>{t('lifeCircle.behindLabel')}</span>
              <ul className="space-y-4">
                {(t('lifeCircle.behindItems', { returnObjects: true }) as string[]).map((item) => (
                  <li key={item} className="flex items-center gap-3 md:justify-start whitespace-nowrap text-[19px] md:text-[17px] lg:text-[20px] text-charcoal/75 font-light"><span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#B98C71' }} /><span>{kw(item)}</span></li>
                ))}
              </ul>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="text-center mt-16 md:mt-20">
            <p className="font-serif text-2xl md:text-3xl italic text-deep-brown/80 mb-7">{t('lifeCircle.closingQuote')}</p>
            <Link to="/services" className="inline-flex items-center gap-3 px-7 py-4 bg-gold text-ivory font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-deep-brown transition-all duration-300 group">
              <span>{t('lifeCircle.cta')}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 3c. SERVICE QUALITY & DIFFERENTIATION */}
      <section id="quality" className="py-20 md:py-28 px-6 md:px-12 bg-ivory border-t border-gold/10">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="text-center max-w-2xl mx-auto mb-12 md:mb-14">
            <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold block mb-4">{t('quality.eyebrow')}</span>
            <h2 className="font-serif text-3xl md:text-5xl font-semibold text-deep-brown leading-tight">{t('quality.heading')}</h2>
            <p className="mt-4 text-base md:text-lg text-charcoal/70 font-light leading-relaxed">
              {t('quality.subcopy')}
            </p>
          </motion.div>

          {/* Eternal vs traditional funeral service providers — two paths around a central spine */}
          <div>
            <div className="hidden md:grid grid-cols-[1fr_210px_1fr] items-center mb-8">
              <div className="text-right pr-8 text-[11px] uppercase tracking-[0.22em] font-bold text-charcoal/45">{t('quality.regularLabel')}</div>
              <div />
              <div className="pl-8"><span className="inline-block px-5 py-2 rounded-full bg-deep-brown text-ivory text-[11px] uppercase tracking-[0.22em] font-bold shadow-sm">{t('quality.eternalLabel')}</span></div>
            </div>
            <div className="relative">
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-gold/0 via-gold/45 to-gold/0" aria-hidden="true" />
              <div className="space-y-6 md:space-y-5">
                {COMPARE_ROWS.map((r, idx) => (
                  <motion.div
                    key={r.aspect}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-40px" }}
                    className="group grid grid-cols-1 md:grid-cols-[1fr_210px_1fr] items-center gap-y-3"
                  >
                    <motion.p
                      variants={{ hidden: { opacity: 0, x: -24 }, show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } } }}
                      className="order-2 md:order-none text-center md:text-right md:pr-8 text-[15px] text-charcoal/50 font-light line-through decoration-charcoal/25"
                    >{t(`compare.${idx}.conventional`, { defaultValue: r.conventional })}</motion.p>
                    <motion.div
                      variants={{ hidden: { opacity: 0, scale: 0.85 }, show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } }}
                      className="order-1 md:order-none relative z-10 flex justify-center"
                    >
                      <span className="px-5 py-2 rounded-full bg-ivory border border-gold/40 font-serif text-[17px] text-deep-brown text-center leading-tight shadow-sm transition-all duration-500 group-hover:bg-gold group-hover:text-ivory group-hover:border-gold">{t(`compare.${idx}.aspect`, { defaultValue: r.aspect })}</span>
                    </motion.div>
                    <motion.div
                      variants={{ hidden: { opacity: 0, x: 24 }, show: { opacity: 1, x: 0, transition: { duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] } } }}
                      className="order-3 md:order-none md:pl-8"
                    >
                      <div className="flex items-start gap-3 py-1">
                        <span className="mt-0.5 w-5 h-5 rounded-full bg-gold text-ivory flex items-center justify-center shrink-0"><Check className="w-3 h-3" strokeWidth={3} aria-hidden="true" /></span>
                        <span className="text-[15px] text-deep-brown leading-snug">{t(`compare.${idx}.eternal`, { defaultValue: r.eternal })}</span>
                        {r.eternalTag && <StatusTag tag={r.eternalTag} />}
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={onOpenConcierge} className="px-8 py-4 bg-gold text-ivory font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-deep-brown transition-all duration-300 inline-flex items-center gap-2.5 group shadow-sm cursor-pointer">
              <span>{t('common.ctaTalkAnytime')}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <Link to="/services" className="px-7 py-4 border border-gold/60 text-deep-brown hover:bg-gold hover:text-ivory font-semibold text-xs uppercase tracking-wider rounded-xs transition-all duration-300 inline-flex items-center gap-2.5 group">
              <span>{t('quality.ctaServices')}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. ARRANGE A SERVICE — INLINE BOOKING WIZARD */}
      <ArrangeServiceWizard />

      {/* VERSE */}
      <div className="py-16 md:py-24 px-6 bg-ivory text-center overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="max-w-2xl mx-auto">
          <span className="block w-px h-8 bg-gold/35 mx-auto mb-6" />
          <p className="font-serif italic text-2xl md:text-[28px] leading-relaxed text-deep-brown/90">&ldquo;{t('verses.tagore.quote')}&rdquo;</p>
          <p className="mt-4 text-[11px] uppercase tracking-[0.22em] font-semibold" style={{ color: '#B98C71' }}>{t('verses.tagore.attribution')}</p>
        </motion.div>
      </div>

      {/* 4. THE FIRST DAY, HELD — timeline */}
      <section className="py-28 md:py-40 px-6 md:px-12 bg-ivory overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="text-center max-w-2xl mx-auto mb-14 md:mb-20">
            <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold block mb-4">{t('firstDay.eyebrow')}</span>
            <h2 className="font-serif text-3xl md:text-5xl font-semibold text-deep-brown leading-tight mb-5">{t('firstDay.heading')}</h2>
            <p className="text-base md:text-lg text-charcoal/70 font-light leading-relaxed">{t('firstDay.subcopy')}</p>
          </motion.div>

          <div ref={firstDayRef} className={`fd-timeline ${firstDayInView ? 'play' : ''}`}>
            {FIRST_DAY_BEATS.map((b, i) => (
              <div className="fd-beat" style={{ ['--b' as string]: i } as React.CSSProperties} key={b.title}>
                <div className="fd-time">{t(`firstDay.beats.${i}.time`, { defaultValue: b.time })}</div>
                <div className="fd-node">
                  <div className="fd-ring" style={{ ['--rc' as string]: b.color } as React.CSSProperties}>
                    <img src={`/assets/timeline/${b.icon}.png`} alt="" aria-hidden="true" />
                  </div>
                  {b.to && <div className="fd-conn" style={{ ['--from' as string]: b.color, ['--to' as string]: b.to } as React.CSSProperties} />}
                </div>
                <div className="fd-body">
                  <div className="fd-bt">{t(`firstDay.beats.${i}.title`, { defaultValue: b.title })}</div>
                  <div className="fd-bd">{t(`firstDay.beats.${i}.desc`, { defaultValue: b.desc })}</div>
                  {b.chips.length > 0 && (
                    <div className="fd-chips">
                      {b.chips.map((c, j) => (
                        <span className="fd-chip" style={{ ['--c' as string]: j } as React.CSSProperties} key={c}>{t(`firstDay.beats.${i}.chips.${j}`, { defaultValue: c })}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {SHOW_VEHICLE && (
        <>
      {/* 5. THE VEHICLE — one instrument among many */}
      <section className="relative py-28 md:py-40 px-6 md:px-12 bg-ivory overflow-hidden">
        <div className="ff-wm-clip"><div className="ff-watermark" /></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-14 md:gap-20 items-center">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
              <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold block mb-4">{t('vehicle.eyebrow')}</span>
              <h2 className="font-serif text-3xl md:text-5xl font-semibold text-deep-brown leading-[1.18] mb-5">{t('vehicle.headingLead')}<em className="text-gold italic">{t('vehicle.headingEmphasis')}</em></h2>
              <p className="text-base md:text-lg text-charcoal/75 font-light leading-relaxed max-w-md">{t('vehicle.body')}</p>
              <Link to="/vehicle" className="mt-8 inline-flex items-center gap-3 px-7 py-4 bg-gold text-ivory font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-deep-brown transition-all duration-300 group">
                <span>{t('vehicle.cta')}</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            <div ref={fifthRef} className={`ff-arc ${fifthInView ? 'play' : ''}`}>
              <div className="ff-cap">{t('vehicle.careArcCaption')}</div>
              {CARE_ARC.map((n, i) => (
                <div className="ff-row" style={{ ['--i' as string]: i } as React.CSSProperties} key={n.label}>
                  <div className="ff-dotwrap">
                    {n.veh ? (
                      <div className="ff-veh" tabIndex={0} role="button" aria-label={t('vehicle.vehAriaLabel')}>
                        <span className="ff-pulse" /><span className="ff-pulse d2" /><span className="ff-pulse d3" />
                        <img className="ff-thumb" src="/assets/photos/eternal_vehicle_interior.jpg" alt="" aria-hidden="true" />
                        <div className="ff-preview">
                          <img src="/assets/photos/eternal_vehicle_interior.jpg" alt={t('vehicle.previewAlt')} />
                          <span className="ff-pcap">{t('vehicle.previewCaption')}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="ff-dot" />
                    )}
                    {i < CARE_ARC.length - 1 && <span className="ff-conn" />}
                  </div>
                  {n.veh ? (
                    <span className="ff-veh-label">{t('vehicle.vehLabel')}<em>{t('vehicle.hoverHint')}</em></span>
                  ) : (
                    <span className="ff-label">{t(`vehicle.careArc.${i}.label`, { defaultValue: n.label })}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
        </>
      )}

      {/* VERSE */}
      <div className="py-16 md:py-24 px-6 bg-ivory text-center overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="max-w-2xl mx-auto">
          <span className="block w-px h-8 bg-gold/35 mx-auto mb-6" />
          <p className="font-serif italic text-2xl md:text-[28px] leading-relaxed text-deep-brown/90">&ldquo;{t('verses.remembrance.quote')}&rdquo;</p>
          <p className="mt-4 text-[11px] uppercase tracking-[0.22em] font-semibold" style={{ color: '#B98C71' }}>{t('verses.remembrance.attribution')}</p>
        </motion.div>
      </div>

      {/* 6. INDUSTRY — expertise numbers band */}
      <section className="paper-dark py-24 md:py-32 px-6 md:px-12 bg-deep-brown text-ivory">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <span className="text-[11px] uppercase tracking-[0.3em] font-semibold block mb-3" style={{ color: '#D9C6A1' }}>{t('stats.eyebrow')}</span>
            <h2 className="font-serif text-3xl md:text-5xl font-medium text-ivory mb-14 md:mb-16">{t('stats.heading')}</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6 max-w-4xl mx-auto">
            {[
              { n: '24/7', l: 'A real person answers' },
              { n: '6+', l: 'Faith traditions honoured' },
              { n: '100%', l: 'Privacy, always' },
              { n: '1', l: 'Family, held end to end' },
            ].map((s, i) => (
              <motion.div key={s.l} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }} className="text-center">
                <div className="font-serif text-4xl md:text-6xl font-semibold leading-none" style={{ color: '#E7D9BD' }}>{s.n}</div>
                <div className="text-[13px] md:text-sm text-ivory/60 font-light mt-3">{t(`stats.items.${i}.label`, { defaultValue: s.l })}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6b. INDUSTRY PARTNERS — animated hub */}
      <section id="institutions" className="py-28 md:py-40 px-6 md:px-12 bg-ivory overflow-hidden border-t border-gold/10">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="max-w-3xl mb-10 md:mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="w-10 h-[1px] bg-gold/60 inline-block" />
              <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold">{t('partners.eyebrow')}</span>
            </div>
            <h2 className="font-serif text-3xl md:text-5xl font-semibold text-deep-brown leading-[1.15]">
              {t('partners.heading')}
            </h2>
            <p className="mt-4 text-base md:text-lg text-charcoal/75 font-light leading-relaxed">
              {t('partners.body')}
            </p>
          </motion.div>

          <div className="flex flex-wrap gap-1.5 border-b border-gold/20">
            {PARTNERS.map((p, i) => (
              <button key={p.tab} onClick={() => setActivePartner(i)} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${activePartner === i ? 'text-gold border-gold' : 'text-charcoal/55 border-transparent hover:text-charcoal/80'}`}>{t(`partners.items.${i}.tab`, { defaultValue: p.tab })}</button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-10 md:gap-16 items-center mt-10">
            <div ref={partnersRef} className={`ph-hub ${partnersInView ? 'play' : ''}`}>
              <svg viewBox="0 0 320 320" aria-hidden="true">
                {([[160, 40], [280, 160], [160, 280], [40, 160]] as number[][]).map((pt, i) => (
                  <line key={i} className={`ph-th ph-th${i} ${activePartner === i ? 'on' : ''}`} x1="160" y1="160" x2={pt[0]} y2={pt[1]} />
                ))}
              </svg>
              <div className="ph-center">
                <img className="emblem-sage" src="/assets/logo-emblem-sage.png" alt="" aria-hidden="true" />
                <img className="emblem-gold" src="/assets/logo-emblem.png" alt="" aria-hidden="true" />
              </div>
              {[
                { cls: 'ph-n0', pos: { top: '12.5%', left: '50%' }, lpos: { top: '3%', left: '50%' }, label: 'Hospitals' },
                { cls: 'ph-n1', pos: { top: '50%', left: '87.5%' }, lpos: { top: '42%', left: '86%' }, label: 'Care homes' },
                { cls: 'ph-n2', pos: { top: '87.5%', left: '50%' }, lpos: { top: '96%', left: '50%' }, label: 'Faith' },
                { cls: 'ph-n3', pos: { top: '50%', left: '12.5%' }, lpos: { top: '42%', left: '14%' }, label: 'Civic' },
              ].map((nd, i) => (
                <React.Fragment key={i}>
                  <button className={`ph-node ${nd.cls} ${activePartner === i ? 'on' : ''}`} style={nd.pos as React.CSSProperties} onClick={() => setActivePartner(i)} aria-label={t(`partners.items.${i}.tab`, { defaultValue: nd.label })} />
                  <span className={`ph-nl ${activePartner === i ? 'on' : ''}`} style={nd.lpos as React.CSSProperties}>{t(`partners.items.${i}.tab`, { defaultValue: nd.label })}</span>
                </React.Fragment>
              ))}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h3 className="font-serif text-2xl md:text-3xl text-deep-brown">{t(`partners.items.${activePartner}.title`, { defaultValue: PARTNERS[activePartner].title })}</h3>
                {activePartner === 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold bg-gold/15 text-gold border border-gold/30">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{t('partners.officialPartnerBadge')}</span>
                  </span>
                )}
              </div>
              <p className="text-base text-charcoal/75 font-light leading-relaxed mb-6 max-w-xl">{t(`partners.items.${activePartner}.desc`, { defaultValue: PARTNERS[activePartner].desc })}</p>

              {activePartner === 0 && (
                <div className="mb-6 p-4 rounded-xs bg-blush/60 border border-gold/30 flex items-start gap-3.5 max-w-xl">
                  <div className="w-8 h-8 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0 mt-0.5">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-bold text-deep-brown mb-1">
                      {t('partners.networkHeading')}
                    </h4>
                    <p className="text-xs text-charcoal/80 font-light leading-relaxed">
                      {t('partners.networkDesc')}
                    </p>
                  </div>
                </div>
              )}

              <ul className="border-l-2 border-gold-light/60 pl-5 space-y-2.5">
                <li className="text-[10px] uppercase tracking-[0.24em] font-semibold list-none" style={{ color: '#B98C71' }}>{t('partners.weightWeLift')}</li>
                {PARTNERS[activePartner].lifts.map((x, liftIdx) => (
                  <li key={x} className="text-sm text-charcoal/80 font-light list-none flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold/60 shrink-0" />
                    <span>{t(`partners.items.${activePartner}.lifts.${liftIdx}`, { defaultValue: x })}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link to="/institutions" className="inline-flex items-center gap-3 px-7 py-4 bg-gold text-ivory font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-deep-brown transition-all duration-300 group">
                  <span>{t('partners.exploreCta')}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <a href="tel:+918448661338" className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-deep-brown hover:text-gold transition-colors py-3 px-2">
                  <span>{t('partners.helplineLabel')} +91 84486 61338</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. THE MAHAPRAYAAN COMMUNITY */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-ivory border-t border-gold/10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl mx-auto"
        >
          <a
            href="https://community.mahaprayaan.com/feed"
            target="_blank"
            rel="noreferrer"
            className="block group rounded-sm overflow-hidden border border-gold/12 shadow-[0_30px_80px_rgba(58,54,47,0.12)]"
          >
            <img
              src="/assets/mahaprayaan-community-banner.jpg"
              alt={t('community.bannerAlt')}
              className="w-full h-auto block transition-transform duration-[1200ms] ease-out group-hover:scale-[1.02]"
            />
          </a>
          <div className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://community.mahaprayaan.com/feed"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gold text-ivory font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-deep-brown transition-all duration-300 group"
            >
              <span>{t('community.joinCta')}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="https://hello.mahaprayaan.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 border border-gold text-deep-brown font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-gold hover:text-ivory transition-all duration-300 group"
            >
              <span>{t('community.shareCta')}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </motion.div>
      </section>

      {/* 6.4 RECOGNITION — quiet, below the fold (hidden until ready) */}
      <AwardBand />

      {/* 6.5 FAMILY GRATITUDE & TESTIMONIALS */}
      <section className="paper-light py-28 md:py-40 px-6 md:px-12 bg-blush/40">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
            <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold block mb-4">{t('testimonials.eyebrow')}</span>
            <h2 className="font-serif text-3xl md:text-5xl font-semibold text-deep-brown leading-tight mb-4">{t('testimonials.heading')}</h2>
            <p className="text-base text-charcoal/70 font-light leading-relaxed">{t('testimonials.subcopy')}</p>
          </motion.div>

          <TestimonialCarousel items={TESTIMONIALS.map((s, i) => ({ ...s, i })).filter((s) => s.approved)} />
        </div>
      </section>

      {/* VERSE */}
      <div className="py-16 md:py-24 px-6 bg-ivory text-center overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="max-w-2xl mx-auto">
          <span className="block w-px h-8 bg-gold/35 mx-auto mb-6" />
          <p className="font-serif italic text-2xl md:text-[28px] leading-relaxed text-deep-brown/90">&ldquo;{t('verses.closing.quote')}&rdquo;</p>
          <p className="mt-4 text-[11px] uppercase tracking-[0.22em] font-semibold" style={{ color: '#B98C71' }}>{t('verses.closing.attribution')}</p>
        </motion.div>
      </div>

      {/* 7. FINAL CTA SECTION */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-blush border-t border-gold/20 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto relative z-10">
          <span className="text-[11px] uppercase tracking-[0.25em] text-gold font-semibold block mb-3">
            {t('finalCta.eyebrow')}
          </span>
          <h2 className="font-serif text-4xl md:text-6xl font-bold text-deep-brown mb-6 leading-tight">
            {t('finalCta.heading')}
          </h2>
          <p className="text-base text-charcoal/80 font-light leading-relaxed mb-10 max-w-xl mx-auto">
            {t('finalCta.body')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onOpenConcierge}
              className="w-full sm:w-auto px-8 py-4 bg-deep-brown text-ivory font-bold text-xs uppercase tracking-widest rounded-xs hover:bg-deep-brown/90 transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg border border-gold/30 hover:shadow-gold-glow hover:-translate-y-0.5 cursor-pointer"
            >
              <span>{t('common.ctaTalkAnytime')}</span>
              <ArrowRight className="w-4 h-4 text-gold" />
            </button>
            <Link
              to="/contact"
              className="w-full sm:w-auto px-8 py-4 bg-white border border-gold text-deep-brown font-bold text-xs uppercase tracking-widest rounded-xs hover:bg-ivory transition-all duration-300 flex items-center justify-center gap-2.5 hover:-translate-y-0.5"
            >
              {t('finalCta.ctaContact')}
            </Link>
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 text-xs text-charcoal/70">
            <ShieldCheck className="w-4 h-4 text-gold shrink-0" />
            <span>{t('finalCta.supportLine')}</span>
          </div>
        </div>
      </section>
    </div>
  );
};

