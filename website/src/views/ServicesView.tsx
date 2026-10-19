import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  PhoneCall,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Globe2,
  FileCheck2,
  Truck,
  Sparkles,
  Building2,
  Utensils,
  Flower2,
  PenTool,
  Heart,
  Car,
  MapPin,
  Clock,
  HelpCircle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { updatePageSEO, setStructuredData, clearStructuredData } from '../utils/seo';
import {
  SERVICE_AREAS,
  SERVICES_FAQS,
  HOW_IT_WORKS_STEPS,
  ServiceStatus,
  FAREWELL_PACKAGES,
} from '../data/servicesData';
import { Verse } from '../components/Verse';
import { VoiceFAQ } from '../components/VoiceFAQ';
import { GalaxySection } from '../components/GalaxySection';
import { CustomPackage } from '../components/CustomPackage';

interface ServicesViewProps {
  onOpenConcierge: (serviceTitle?: string) => void;
}

// Warm care-tone ramp (sage -> clay), echoing the homepage timeline nodes
const SOC_TINTS = ['#5E6B54', '#78805B', '#94906C', '#AE8C6C', '#B98C71'];
// Node anchor points as % of the arc viewBox (1000 x 320), sitting on the cradle thread
const SOC_POS = [
  { x: 10, y: 34.4 },
  { x: 30, y: 47.3 },
  { x: 50, y: 51.6 },
  { x: 70, y: 47.3 },
  { x: 90, y: 34.4 },
];

const SOC_ITEMS = [
  { id: 'immediate-relief-transport', num: '01', title: 'Immediate Transport', path: '/services/immediate-relief-transport', icon: Truck },
  { id: 'serene-gatherings-remembrance', num: '02', title: 'Prayer Hall & Flowers', path: '/services/serene-gatherings-remembrance', icon: Flower2 },
  { id: 'empathic-care-keepsakes', num: '03', title: 'Family Support', path: '/services/empathic-care-keepsakes', icon: Heart },
  { id: 'reassuring-peace-of-mind', num: '04', title: 'Pre-Planning', path: '/services/reassuring-peace-of-mind', icon: ShieldCheck },
  { id: 'specialised-services', num: '05', title: 'Special Assistance', path: '/services/specialised-services', icon: Globe2 },
];

const PATHWAYS = [
  {
    kicker: 'AVAILABLE 24×7 ACROSS DELHI NCR',
    title: 'Immediate Help & Ceremonial Transport',
    description:
      'Clean, air-conditioned vehicle from hospital or home to the cremation ground. Includes complete help with hospital paperwork, gate passes, and an extra car for family members.',
    path: '/services/immediate-relief-transport',
    icon: Truck,
  },
  {
    kicker: 'PRAYER MEETINGS & GATHERINGS',
    title: 'Prayer Hall & Floral Services',
    description:
      'Arranging quiet prayer halls (Shok Sabha), flower decorations, simple tea and snacks for guests, and heartfelt obituary messages with trusted local partners.',
    path: '/services/serene-gatherings-remembrance',
    icon: Flower2,
  },
  {
    kicker: 'CARING FOR YOUR FAMILY',
    title: 'Family Support',
    description:
      'Simple step-by-step guidance for Asthi Visarjan (Haridwar, Garhmukteshwar, and sacred rivers) with comfortable cars and caring emotional support whenever you need.',
    path: '/services/empathic-care-keepsakes',
    icon: Heart,
  },
  {
    kicker: 'PEACE OF MIND FOR TOMORROW',
    title: 'Pre-Planning',
    description:
      'Thoughtful advance plans being developed to arrange services ahead of time, ensuring clarity and protecting your family from sudden stress.',
    path: '/services/reassuring-peace-of-mind',
    icon: ShieldCheck,
  },
  {
    kicker: 'OUTSTATION & REPATRIATION',
    title: 'Special Assistance',
    description:
      'Help when taking your loved one to a hometown outside Delhi NCR, including interstate travel permits, police and hospital clearances, and international repatriation support.',
    path: '/services/specialised-services',
    icon: Globe2,
  },
];

// Reusable dignified status badge component
const StatusBadge: React.FC<{ status: ServiceStatus | string; className?: string }> = ({
  status,
  className = '',
}) => {
  const normalized = status.toUpperCase();

  let style = 'bg-[#5E6B54]/10 text-[#45503d] border-[#5E6B54]/30';
  let dotColor = 'bg-[#5E6B54]';

  if (normalized.includes('LIVE')) {
    style = 'bg-[#5E6B54]/15 text-[#3a4433] border-[#5E6B54]/40 font-semibold';
    dotColor = 'bg-[#5E6B54]';
  } else if (normalized.includes('PARTNER')) {
    style = 'bg-[#94906C]/15 text-[#635f42] border-[#94906C]/35 font-medium';
    dotColor = 'bg-[#94906C]';
  } else if (normalized.includes('ON REQUEST')) {
    style = 'bg-[#AE8C6C]/15 text-[#6f5641] border-[#AE8C6C]/35 font-medium';
    dotColor = 'bg-[#AE8C6C]';
  } else if (normalized.includes('REFERRAL')) {
    style = 'bg-[#B98C71]/15 text-[#735340] border-[#B98C71]/35 font-medium';
    dotColor = 'bg-[#B98C71]';
  } else if (normalized.includes('COMING SOON')) {
    style = 'bg-charcoal/10 text-charcoal/70 border-charcoal/20 font-medium';
    dotColor = 'bg-charcoal/50';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] tracking-wider uppercase border ${style} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} />
      <span>{status}</span>
    </span>
  );
};

export const ServicesView: React.FC<ServicesViewProps> = ({ onOpenConcierge }) => {
  const { t } = useTranslation('services');
  const { t: tData } = useTranslation('servicesData');
  const socRef = useRef<HTMLDivElement>(null);
  const socIn = useInView(socRef, { once: true, margin: '-80px' });

  const socItemsT = SOC_ITEMS.map((item, i) => ({
    ...item,
    title: t(`fiveCircles.items.${i}.title`, { defaultValue: item.title }),
  }));
  const pathwaysT = PATHWAYS.map((p, i) => ({
    ...p,
    kicker: t(`pathways.items.${i}.kicker`, { defaultValue: p.kicker }),
    title: t(`pathways.items.${i}.title`, { defaultValue: p.title }),
    description: t(`pathways.items.${i}.description`, { defaultValue: p.description }),
  }));
  const howItWorksT = HOW_IT_WORKS_STEPS.map((item, i) => ({
    ...item,
    title: tData(`howItWorks.${i}.title`, { defaultValue: item.title }),
    description: tData(`howItWorks.${i}.description`, { defaultValue: item.description }),
  }));
  const serviceAreasT = SERVICE_AREAS.map((area, i) => ({
    name: tData(`serviceAreas.${i}.name`, { defaultValue: area.name }),
    sectors: tData(`serviceAreas.${i}.sectors`, { defaultValue: area.sectors }),
  }));
  const servicesFaqsT = SERVICES_FAQS.map((faq, i) => ({
    question: tData(`faqs.${i}.question`, { defaultValue: faq.question }),
    answer: tData(`faqs.${i}.answer`, { defaultValue: faq.answer }),
  }));
  const farewellPackagesT = FAREWELL_PACKAGES.map((pkg) => ({
    ...pkg,
    rawName: pkg.name,
    name: tData(`packages.${pkg.id}.name`, { defaultValue: pkg.name }),
    tagline: tData(`packages.${pkg.id}.tagline`, { defaultValue: pkg.tagline }),
    features: pkg.features.map((feat, fIdx) => ({
      ...feat,
      name: tData(`packages.${pkg.id}.features.${fIdx}.name`, { defaultValue: feat.name }),
    })),
  }));

  useEffect(() => {
    // 1. Update Title and Meta Description per SEO specification
    updatePageSEO(
      t('seo.title', { defaultValue: 'Funeral Transport & Coordination Services in Delhi NCR | Eternal Repos' }),
      t('seo.description', { defaultValue: 'Eternal Repos provides 24×7 dignified funeral transport, documentation support, funeral coordination and specialised assistance across Delhi NCR.' })
    );

    // 2. Structured Data injection for Services
    const serviceSchema = {
      '@context': 'https://schema.org',
      '@type': 'FuneralHome',
      name: 'Eternal Repos',
      url: 'https://eternalrepos.com/services',
      description:
        '24×7 dignified ceremonial transport, hospital body-release documentation guidance, funeral coordination and specialised repatriation assistance across Delhi NCR.',
      telephone: '+918448661338',
      areaServed: [
        { '@type': 'City', name: 'Delhi' },
        { '@type': 'City', name: 'Gurgaon' },
        { '@type': 'City', name: 'Noida' },
        { '@type': 'City', name: 'Ghaziabad' },
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Eternal Repos Ceremonial Mobility & Coordination Services',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Transport & Documentation Support inclusive of extra transport for family',
              description:
                'Dignified transport from a hospital, home or institution to the cremation or burial ground, supported by documentation coordination and extra transport for family.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Pre & Post Funeral Service Coordination',
              description:
                'One coordinated team manages the moving parts of the case so the family does not have to deal with multiple vendors independently.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'International Repatriation Coordination',
              description:
                'Case-by-case coordination when a final journey needs to cross international borders.',
            },
          },
        ],
      },
    };

    setStructuredData('services-page', serviceSchema);
    return () => clearStructuredData('services-page');
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const helplineNumber = '+918448661338';
  const whatsappUrl =
    'https://wa.me/918448661338?text=Hello%20Eternal%20Team%2C%20I%20would%20like%20to%20enquire%20about%20your%20services.';

  return (
    <div className="bg-ivory text-charcoal min-h-screen selection:bg-gold selection:text-white pb-20 md:pb-0">

      {/* ========================================================= */}
      {/* 1. MAIN SERVICE PAGE HERO                                 */}
      {/* ========================================================= */}
      <section className="relative pt-40 pb-20 md:pt-48 md:pb-28 px-6 md:px-12 bg-ivory border-b border-gold/15 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 text-left z-10"
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-3 mb-6">
              <span className="w-8 h-[1px] bg-gold/60 inline-block" />
              <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold">
                {t('hero.eyebrow', { defaultValue: 'Support across Delhi NCR' })}
              </span>
            </div>

            {/* Heading */}
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-semibold text-deep-brown leading-[1.12] mb-6 tracking-tight">
              {t('hero.title', { defaultValue: "Complete care and support for your loved one's final journey." })}
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg md:text-xl text-charcoal/75 font-light leading-relaxed max-w-xl mb-8">
              {t('hero.description', { defaultValue: 'In difficult moments, your family should not have to face confusion or run around for arrangements. We assist you gently with everything — respectful ceremonial transport, hospital clearance, crematorium entry, flowers, and prayer meetings. Our team stays with you with complete warmth and care.' })}
            </p>

            {/* Action CTA */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => onOpenConcierge('General Service Enquiry')}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gold text-ivory font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-deep-brown transition-all duration-300 group cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <span>{t('hero.talkCta', { defaultValue: 'Talk to us — anytime' })}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => scrollToSection('packages')}
                className="inline-flex items-center gap-2 px-6 py-4 bg-transparent border border-gold/40 text-deep-brown hover:bg-gold/10 hover:border-gold font-semibold text-xs uppercase tracking-wider rounded-xs transition-all duration-300 cursor-pointer"
              >
                <span>{t('hero.viewPackagesCta', { defaultValue: 'View Packages & Pricing' })}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>

          {/* Right: Full Uncropped Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 relative"
          >
            <div className="relative rounded-sm overflow-hidden shadow-[0_20px_50px_rgba(58,54,47,0.12)] border border-gold/25 bg-white">
              <img
                src="/assets/services_hero.jpg"
                alt={t('hero.imageAlt', { defaultValue: 'Eternal Repos tribute vehicle and ceremonial care team standing beside a family' })}
                className="w-full h-auto block aspect-[1024/682] object-contain"
              />
            </div>

            {/* Subtle decorative gold accent frame behind */}
            <div className="absolute -bottom-3 -right-3 -z-10 hidden sm:block w-full h-full border border-gold/25 rounded-sm pointer-events-none" />
          </motion.div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. THE FIVE CIRCLES OF CARE — HOW WE HELP                 */}
      {/* ========================================================= */}
      <section id="how-we-help" className="py-20 md:py-32 px-6 md:px-12 bg-blush/30 border-b border-gold/15 scroll-mt-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-2xl mx-auto mb-14 md:mb-16"
          >
            <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold block mb-4">
              {t('fiveCircles.eyebrow', { defaultValue: 'How we help your family' })}
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-semibold text-deep-brown leading-tight mb-5">
              {t('fiveCircles.title', { defaultValue: 'Five ways we stand beside you.' })}
            </h2>
            <p className="text-base md:text-lg text-charcoal/70 font-light leading-relaxed">
              {t('fiveCircles.description', { defaultValue: 'From the very first call to the days following the farewell, we are here to support your family step by step with gentle, respectful care.' })}
            </p>
          </motion.div>

          {/* SIGNATURE INFOGRAPHIC — the five circles, held on one thread */}
          <div ref={socRef} className={`soc relative w-full mb-12 hidden md:block ${socIn ? 'play' : ''}`}>
            <div className="relative w-full max-w-4xl mx-auto" style={{ aspectRatio: '1000 / 320' }}>
              <svg viewBox="0 0 1000 320" className="absolute inset-0 w-full h-full" fill="none" aria-hidden="true">
                <path
                  className="soc-thread"
                  d="M100,110 Q500,220 900,110"
                  stroke="url(#socGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="socGrad" x1="0" y1="0" x2="1000" y2="0" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#5E6B54" />
                    <stop offset="0.5" stopColor="#94906C" />
                    <stop offset="1" stopColor="#B98C71" />
                  </linearGradient>
                </defs>
              </svg>

              {socItemsT.map((item, i) => {
                const CatIcon = item.icon;
                const pos = SOC_POS[i];
                const tint = SOC_TINTS[i];
                return (
                  <div
                    key={item.id}
                    className="soc-node absolute"
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  >
                    <Link
                      to={item.path}
                      className="soc-pop group flex flex-col items-center text-center"
                      style={{ animationDelay: `${0.25 + i * 0.14}s` }}
                    >
                      <span
                        className="soc-disc flex items-center justify-center rounded-full text-ivory shadow-[0_10px_28px_rgba(58,54,47,0.16)] transition-transform duration-300"
                        style={{ width: 60, height: 60, background: tint }}
                      >
                        <CatIcon className="w-6 h-6" strokeWidth={1.5} />
                      </span>
                      <span className="soc-num mt-3 text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: tint }}>
                        {item.num}
                      </span>
                      <span className="soc-label mt-1 font-serif text-[15px] leading-snug text-deep-brown/90 max-w-[150px] group-hover:text-gold transition-colors duration-300">
                        {item.title}
                      </span>
                    </Link>
                  </div>
                );
              })}
            </div>
            <p className="text-center text-sm md:text-[15px] text-charcoal/55 font-light italic max-w-xl mx-auto -mt-2">
              {t('fiveCircles.caption', { defaultValue: 'Five circles of care, held on a single thread — from the first call to the days long after.' })}
            </p>
          </div>

          {/* Mobile view for the 5 circles */}
          <div className="md:hidden grid grid-cols-2 gap-3 pb-4">
            {socItemsT.map((item, i) => {
              const CatIcon = item.icon;
              const tint = SOC_TINTS[i];
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`bg-white border border-gold/25 p-4 rounded-xs flex flex-col items-center text-center group shadow-xs ${i === 4 ? 'col-span-2 max-w-xs mx-auto w-full' : ''}`}
                >
                  <span
                    className="w-12 h-12 rounded-full flex items-center justify-center text-ivory shadow-sm mb-2.5"
                    style={{ background: tint }}
                  >
                    <CatIcon className="w-5 h-5" strokeWidth={1.5} />
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: tint }}>
                    {item.num}
                  </span>
                  <span className="font-serif text-sm font-semibold text-deep-brown group-hover:text-gold transition-colors leading-snug">
                    {item.title}
                  </span>
                </Link>
              );
            })}
            <p className="col-span-2 text-center text-xs text-charcoal/60 font-light italic pt-2">
              {t('fiveCircles.caption', { defaultValue: 'Five circles of care, held on a single thread — from the first call to the days long after.' })}
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. QUICK SERVICE NAVIGATION SECTION                        */}
      {/* ========================================================= */}
      <section id="pathways" className="py-20 md:py-28 px-6 md:px-12 bg-ivory scroll-mt-24 border-b border-gold/15">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-xl mx-auto mb-14 md:mb-16">
            <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold block mb-3">
              {t('pathways.eyebrow', { defaultValue: 'SERVICE CATEGORIES' })}
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-semibold text-deep-brown leading-tight">
              {t('pathways.title', { defaultValue: 'How can we help?' })}
            </h2>
          </div>

          {/* Pathways Row List matching Image 2 design */}
          <div className="divide-y divide-gold/20 border-t border-b border-gold/20">
            {pathwaysT.map((pathway, idx) => {
              const IconComponent = pathway.icon;
              return (
                <motion.div
                  key={pathway.path}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    to={pathway.path}
                    className="w-full text-left group block py-9 md:py-11 cursor-pointer focus:outline-hidden transition-colors"
                  >
                    <div className="flex items-start gap-5 sm:gap-7 md:gap-8">
                      {/* Left Circle Icon */}
                      <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full border border-charcoal/25 bg-ivory flex items-center justify-center text-charcoal/80 group-hover:border-gold group-hover:bg-gold/5 group-hover:text-gold transition-all duration-300 shrink-0 mt-0.5 shadow-xs">
                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.3} />
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4 mb-2">
                          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.24em] text-gold font-semibold truncate">
                            {pathway.kicker}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] font-semibold text-charcoal/70 group-hover:text-gold transition-colors shrink-0">
                            <span>{t('pathways.exploreLabel', { defaultValue: 'EXPLORE' })}</span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                          </span>
                        </div>

                        <h3 className="font-serif text-2xl sm:text-3xl md:text-[34px] font-medium text-deep-brown mb-2.5 leading-snug group-hover:text-gold transition-colors duration-300">
                          {pathway.title}
                        </h3>

                        <p className="text-[15px] md:text-base text-charcoal/75 font-light leading-relaxed max-w-3xl">
                          {pathway.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3.5 TRANSPARENT FAREWELL PACKAGES (VIP, MEDIUM, VEHICLE)  */}
      {/* ========================================================= */}
      <section id="packages" className="py-24 md:py-32 px-6 md:px-12 bg-blush/25 border-b border-gold/15 scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-3xl mx-auto mb-16 md:mb-20"
          >
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="w-8 h-[1px] bg-gold/60 inline-block" />
              <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold">
                {t('packagesSection.eyebrow', { defaultValue: 'Care Plans' })}
              </span>
              <span className="w-8 h-[1px] bg-gold/60 inline-block" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-deep-brown leading-tight mb-5">
              {t('packagesSection.title', { defaultValue: 'Farewell Care Packages' })}
            </h2>
            <p className="text-base md:text-lg text-charcoal/75 font-light leading-relaxed max-w-2xl mx-auto">
              {t('packagesSection.description', { defaultValue: 'Every detail itemized and clearly explained, so your family knows exactly what to expect with no hidden surprises.' })}
            </p>
          </motion.div>

          {/* 3 Package Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-12">
            {farewellPackagesT.map((pkg, idx) => {
              const isVIP = pkg.id === 'vip';
              const isMedium = pkg.id === 'medium';
              const isVehicle = pkg.id === 'vehicle';

              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative flex flex-col rounded-sm transition-all duration-300 ${
                    isMedium
                      ? 'bg-white border-2 border-gold shadow-[0_20px_50px_rgba(185,140,113,0.18)]'
                      : isVIP
                      ? 'bg-[#2A241F] text-ivory border border-gold/40 shadow-[0_20px_50px_rgba(42,36,31,0.25)]'
                      : 'bg-white border border-gold/25 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="p-7 sm:p-8 flex flex-col flex-grow">
                    {/* Header */}
                    <div className="border-b pb-6 mb-6 border-gold/20">
                      <div className="mb-2">
                        <span className={`text-[10px] uppercase tracking-[0.24em] font-semibold ${
                          isVIP ? 'text-gold-light' : 'text-gold'
                        }`}>
                          {isVehicle
                            ? t('packagesSection.vehicleLabel', { defaultValue: 'Vehicle Care' })
                            : isMedium
                            ? t('packagesSection.mediumLabel', { defaultValue: 'Complete Ceremonial Care' })
                            : t('packagesSection.vipLabel', { defaultValue: 'Signature VIP Care' })}
                        </span>
                      </div>

                      <h3 className={`font-serif text-2xl sm:text-3xl font-semibold mb-2 ${
                        isVIP ? 'text-ivory' : 'text-deep-brown'
                      }`}>
                        {pkg.name}
                      </h3>

                      <p className={`text-xs sm:text-[13px] font-light leading-relaxed min-h-[38px] ${
                        isVIP ? 'text-ivory/70' : 'text-charcoal/70'
                      }`}>
                        {pkg.tagline}
                      </p>
                    </div>

                    {/* Itemized Inclusions List */}
                    <div className="space-y-3 flex-grow mb-8">
                      <span className={`text-[10px] uppercase tracking-[0.2em] font-semibold block mb-3 ${
                        isVIP ? 'text-ivory/60' : 'text-charcoal/50'
                      }`}>
                        {t('packagesSection.whatsIncluded', { defaultValue: "What's Included" })}
                      </span>

                      <ul className="space-y-2.5 text-xs sm:text-[13px]">
                        {pkg.features.map((feat, fIdx) => (
                          <li
                            key={fIdx}
                            className={`flex items-start gap-2.5 py-1.5 border-b last:border-b-0 ${
                              isVIP ? 'border-ivory/10' : 'border-gold/10'
                            }`}
                          >
                            <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${
                              isVIP ? 'text-gold-light' : 'text-gold'
                            }`} />
                            <span className={`font-light leading-snug ${
                              isVIP ? 'text-ivory/90' : 'text-charcoal/85'
                            }`}>
                              {feat.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => onOpenConcierge(`${pkg.rawName} Enquiry`)}
                      className={`w-full py-3.5 px-5 text-xs uppercase tracking-wider font-bold rounded-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:shadow-md ${
                        isVIP
                          ? 'bg-gold text-ivory hover:bg-gold-light hover:text-deep-brown'
                          : isMedium
                          ? 'bg-deep-brown text-ivory hover:bg-gold hover:text-ivory'
                          : 'bg-blush border border-gold/40 text-deep-brown hover:bg-gold hover:text-ivory'
                      }`}
                    >
                      <span>{t('packagesSection.chooseCta', { name: pkg.name, defaultValue: `Choose ${pkg.name}` })}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <CustomPackage items={farewellPackagesT.flatMap((p) => p.features.map((f) => ({ name: f.name, price: f.price ?? 0 })))} />

          {/* Footnotes & Advisory Note */}
          <div className="bg-white border border-gold/20 p-6 sm:p-8 rounded-sm max-w-4xl mx-auto shadow-xs text-center space-y-3">
            <p className="text-xs sm:text-sm text-charcoal/80 font-light leading-relaxed">
              {t('packagesSection.footnote', { defaultValue: "Every farewell is sacred and personal. All packages can be customised according to your family's religious customs, priest traditions, and specific floral preferences." })}
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-deep-brown">
              <span>{t('packagesSection.needHelp', { defaultValue: 'Need help deciding?' })}</span>
              <a
                href="tel:+918448661338"
                className="inline-flex items-center gap-1.5 text-gold hover:underline"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{t('packagesSection.callLine', { defaultValue: 'Call 24×7: +91 84486 61338' })}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3.6 GALAXY & CELESTIAL STARS REMEMBRANCE SECTION           */}
      {/* ========================================================= */}
      <GalaxySection onOpenConcierge={onOpenConcierge} />

      {/* ========================================================= */}
      {/* 4. HOW IT WORKS — 5-STEP JOURNEY                          */}
      {/* ========================================================= */}
      <section id="how-it-works" className="py-20 md:py-28 px-6 md:px-12 bg-ivory border-t border-gold/15 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold block mb-3">
              {t('howItWorksSection.eyebrow', { defaultValue: 'SIMPLE 5-STEP PROCESS' })}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-deep-brown leading-tight mb-4">
              {t('howItWorksSection.title', { defaultValue: 'What happens when you call us?' })}
            </h2>
            <p className="text-sm md:text-base text-charcoal/70 font-light leading-relaxed">
              {t('howItWorksSection.description', { defaultValue: 'We handle every arrangement step by step with quiet care, so your family does not have to worry about running around.' })}
            </p>
          </div>

          <div className="relative">
            {/* Connecting line for desktop */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-[1.5px] bg-gold/25 -translate-y-8 pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 relative z-10">
              {howItWorksT.map((item, idx) => (
                <div
                  key={item.step}
                  className="bg-white border border-gold/25 p-6 rounded-xs shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-10 h-10 rounded-full bg-blush border border-gold/40 flex items-center justify-center text-xs font-bold text-deep-brown mb-5 group-hover:bg-gold group-hover:text-ivory transition-colors shadow-xs">
                      {item.step}
                    </div>
                    <h3 className="font-serif text-lg font-bold text-deep-brown mb-2.5 leading-snug group-hover:text-gold transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-charcoal/75 font-light leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-gold/10 text-[10px] uppercase tracking-wider text-gold font-semibold">
                    {t('howItWorksSection.stepOf', { n: idx + 1, total: 5, defaultValue: `Step ${idx + 1} of 5` })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. VOICE FAQ — read and listen                            */}
      {/* ========================================================= */}
      <VoiceFAQ faqs={servicesFaqsT} />

      {/* ========================================================= */}
      {/* 6. SERVICE AREAS (SHIFTED ONE FOLD DOWN)                  */}
      {/* ========================================================= */}
      <section className="py-20 md:py-24 px-6 md:px-12 bg-blush/35 border-t border-gold/15">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold block mb-2">
              {t('areasSection.eyebrow', { defaultValue: 'ACROSS DELHI NCR' })}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-deep-brown mb-4">
              {t('areasSection.title', { defaultValue: 'Where our team serves' })}
            </h2>
            <p className="text-sm md:text-base text-charcoal/75 font-light leading-relaxed">
              {t('areasSection.description', { defaultValue: 'Our team and clean ceremonial vehicles are active 24×7 across Delhi, Gurgaon, Noida, Greater Noida, Ghaziabad, and Faridabad to reach your location promptly with courteous support.' })}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {serviceAreasT.map((area, idx) => (
              <div
                key={idx}
                className="bg-white border border-gold/25 p-5 rounded-xs shadow-xs text-center space-y-2 eternal-card"
              >
                <div className="w-8 h-8 rounded-full bg-blush border border-gold/30 flex items-center justify-center text-gold mx-auto mb-2">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-lg font-bold text-deep-brown">
                  {area.name}
                </h3>
                <p className="text-[11px] text-charcoal/65 font-light leading-relaxed">
                  {area.sectors}
                </p>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-charcoal/60 font-light italic max-w-xl mx-auto">
            {t('areasSection.footnote', { defaultValue: 'Intercity transfers beyond Delhi NCR and international repatriation logistics are coordinated on a case-by-case basis.' })}
          </p>
        </div>
      </section>

      {/* Brand Verse */}
      <Verse text={t('verse.text', { defaultValue: 'We cannot make the weight lighter — only carry it with you.' })} attr={t('verse.attr', { defaultValue: 'Eternal Repos' })} />

      {/* ========================================================= */}
      {/* 14. STICKY MOBILE CTA BAR                                 */}
      {/* ========================================================= */}
      <aside
        aria-label={t('mobileBar.ariaLabel', { defaultValue: 'Mobile Immediate Assistance Bar' })}
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-deep-brown/95 backdrop-blur-md border-t border-gold/30 px-4 py-3 shadow-[0_-10px_25px_rgba(0,0,0,0.3)] pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]"
      >
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
          <a
            href={`tel:${helplineNumber}`}
            className="w-full py-2.5 px-3 bg-gold text-ivory font-bold text-[11px] uppercase tracking-wider rounded-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-transform"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{t('mobileBar.call', { defaultValue: 'Call 24×7' })}</span>
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-3 bg-[#25D366] text-white font-bold text-[11px] uppercase tracking-wider rounded-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-transform"
          >
            <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.705 1.754zm6.097-4.901l.36.213c1.558.925 3.344 1.413 5.163 1.414 5.418 0 9.824-4.406 9.827-9.824.001-2.628-1.021-5.1-2.876-6.956-1.854-1.855-4.327-2.877-6.958-2.877-5.417 0-9.823 4.406-9.825 9.824-.001 1.884.526 3.722 1.523 5.328l.235.378-1.009 3.688 3.759-.984zm11.23-7.534c-.308-.154-1.821-.898-2.103-1.001-.282-.102-.488-.153-.694.154-.205.307-.796 1.001-.976 1.206-.18.206-.359.231-.667.077-.308-.154-1.299-.478-2.474-1.527-.914-.816-1.531-1.824-1.71-2.132-.18-.308-.019-.474.135-.627.139-.138.308-.359.462-.538.154-.18.205-.308.308-.513.103-.205.051-.385-.026-.538-.077-.154-.694-1.668-.95-2.284-.25-.6-.504-.518-.694-.528l-.59-.01c-.205 0-.538.077-.821.385-.283.308-1.078 1.052-1.078 2.566 0 1.514 1.103 2.977 1.257 3.183.154.205 2.17 3.313 5.257 4.646.734.317 1.307.507 1.754.649.737.234 1.408.201 1.939.122.592-.089 1.821-.744 2.077-1.463.256-.719.256-1.334.18-1.463-.077-.13-.282-.206-.59-.36z" />
            </svg>
            <span>{t('mobileBar.whatsapp', { defaultValue: 'WhatsApp' })}</span>
          </a>
        </div>
      </aside>

    </div>
  );
};

export default ServicesView;
