import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AwardBand } from '../components/AwardBand';
import { ArrowRight, ShieldCheck, ChevronLeft, ChevronRight, Eye, Wind, Layers, Camera, HeartHandshake, Flower2, Heart, Stethoscope, Building2, Landmark, Users } from 'lucide-react';
import { updatePageSEO } from '../utils/seo';
import { SERVICES_DATA } from '../data/servicesData';
import { SERVICE_TILES } from '../data/serviceTiles';

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

const ETHOS = [
  { t: 'A person, at any hour', d: 'Never a menu, never "call back in the morning." A real voice, whenever you call.' },
  { t: 'A response you can rely on', d: 'We set out without delay, and we tell you what to expect — so nothing is left to guesswork.' },
  { t: 'A written standard of care', d: 'Our conduct and hygiene are published in full, so you can read them before you trust us.' },
  { t: 'Nothing asked twice', d: 'What a family tells us once is recorded and carried throughout — no name, no detail, repeated in grief.' },
  { t: 'Nothing sold in that hour', d: 'No options put to a family least able to refuse them. Arrangements are settled with care, never upsold.' },
  { t: 'Reverence as a discipline', d: 'Not a temperament we hope for, but a standard we train, assess and hold our team to.' },
  { t: 'Present in the weeks that follow', d: 'The care does not end when the vehicle leaves — we stay for what comes after.' },
];

const NEEDS = [
  { q: 'Someone has just died and we need help right now.', to: 0 },
  { q: 'We need a space, floral decor, or catering for the gathering.', to: 1 },
  { q: 'We need support, obituaries, or guidance in the days after.', to: 2 },
  { q: 'We want to plan ahead, or arrange financial cover.', to: 3 },
  { q: 'We need intercity transfer or international repatriation.', to: 4 },
];

const TESTIMONIALS = [
  { q: "When my father passed away late at night, we felt completely helpless. Eternal stepped in with such gentle care — never a transaction, only quiet reverence, standing beside us the whole way.", n: "Arjun Sharma" },
  { q: "They took care of the hospital paperwork, the transport, the priest — so my mother and I could just sit together in peace. Having someone truly care during our hardest hour made all the difference.", n: "Meera Rastogi" },
  { q: "In a moment of overwhelming grief, Eternal gave us a calm sanctuary and gentle guidance through every step. We felt genuine warmth exactly when we needed it most.", n: "Dr. V. K. Malhotra" },
];

const EAQS = [
  { q: 'Which areas do you serve?', a: 'We are based at ATS Bouquet, Sector 132, Noida, and serve families across Delhi NCR — including Noida, Delhi and Gurugram.' },
  { q: 'How quickly can you respond?', a: 'We are built for the moments that cannot wait. Call the concierge and our team responds promptly, day or night, and sets out without delay.' },
  { q: 'Do you work with all communities and faiths?', a: 'Yes. We serve families of every community and faith, adapting arrangements to the rites and wishes that matter to you.' },
  { q: 'How do I reach you?', a: 'Call the concierge at +91 84486 61338, email care@eternalrepos.com, or use the contact page — and we will guide you gently from there.' },
];

const HERO_SLIDES = [
  { title: 'Immediate transport, without delay', line: 'A calm, private vehicle and a trained crew — we bring your loved one home gently, whatever the hour.', img: '/assets/eternal_ceremonial_exterior_1.png', href: '/services/immediate-relief-transport', cta: 'Immediate help' },
  { title: 'A farewell in your tradition', line: 'The hall, the flowers, the pandit, the permissions — every part of the rite arranged in your custom, at your pace.', img: '/assets/photos/gallery_ceremony.jpg', href: '/services/serene-gatherings-remembrance', cta: 'Explore gatherings' },
  { title: 'Care that stays, after', line: 'Grief support, keepsakes and the practical affairs — we remain beside your family in the weeks that follow.', img: '/assets/gallery_respectful_service.png', href: '/services/empathic-care-keepsakes', cta: 'See how we care' },
];

interface HomeViewV2Props {
  onOpenConcierge: () => void;
  heroImage?: string;
}

export const HomeViewV2: React.FC<HomeViewV2Props> = ({ onOpenConcierge, heroImage = '/assets/hero_thread.jpg' }) => {
  const { t } = useTranslation('homeV2');
  const { t: tData } = useTranslation('servicesData');

  useEffect(() => {
    updatePageSEO(
      t('seo.title', { defaultValue: 'Eternal Repos — Purpose-Built Ceremonial Mobility' }),
      t('seo.description', { defaultValue: "Standing beside families through the last goodbye — a dignified farewell for the one you've lost, and gentle support for those left behind." })
    );
    const rb = document.createElement('meta'); rb.name = 'robots'; rb.content = 'noindex'; document.head.appendChild(rb);
    return () => { rb.remove(); };
  }, [t]);

  // Translated derivations of the module-level static arrays (ids/colors/icons/flags kept as-is)
  const heroSlidesT = HERO_SLIDES.map((s, i) => ({
    ...s,
    title: t(`hero.slides.${i}.title`, { defaultValue: s.title }),
    line: t(`hero.slides.${i}.line`, { defaultValue: s.line }),
    cta: t(`hero.slides.${i}.cta`, { defaultValue: s.cta }),
  }));
  const firstDayBeatsT = FIRST_DAY_BEATS.map((b, i) => ({
    ...b,
    time: t(`firstDay.beats.${i}.time`, { defaultValue: b.time }),
    title: t(`firstDay.beats.${i}.title`, { defaultValue: b.title }),
    desc: t(`firstDay.beats.${i}.desc`, { defaultValue: b.desc }),
    chips: b.chips.map((c, j) => t(`firstDay.beats.${i}.chips.${j}`, { defaultValue: c })),
  }));
  const careArcT = CARE_ARC.map((n, i) => ({
    ...n,
    label: t(`vehicleSection.careArc.${i}`, { defaultValue: n.label }),
  }));
  const partnersT = PARTNERS.map((p, i) => ({
    ...p,
    tab: t(`partners.items.${i}.tab`, { defaultValue: p.tab }),
    title: t(`partners.items.${i}.title`, { defaultValue: p.title }),
    badge: p.badge ? t(`partners.items.${i}.badge`, { defaultValue: p.badge }) : p.badge,
    desc: t(`partners.items.${i}.desc`, { defaultValue: p.desc }),
    lifts: p.lifts.map((l, j) => t(`partners.items.${i}.lifts.${j}`, { defaultValue: l })),
  }));
  const ethosT = ETHOS.map((e, i) => ({
    t: t(`ethos.items.${i}.title`, { defaultValue: e.t }),
    d: t(`ethos.items.${i}.desc`, { defaultValue: e.d }),
  }));
  const needsT = NEEDS.map((n, i) => ({
    ...n,
    q: t(`configurator.needs.${i}.q`, { defaultValue: n.q }),
  }));
  const eaqsT = EAQS.map((f, i) => ({
    q: t(`eaqs.items.${i}.q`, { defaultValue: f.q }),
    a: t(`eaqs.items.${i}.a`, { defaultValue: f.a }),
  }));
  const testimonialsT = TESTIMONIALS.map((s, i) => ({
    quote: t(`testimonials.items.${i}.quote`, { defaultValue: s.q }),
    name: t(`testimonials.items.${i}.name`, { defaultValue: s.n }),
    // initials are always derived from the original English name so avatar initials stay stable across languages
    initials: s.n.replace(/Dr\.\s*/, '').split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join(''),
  }));
  const serviceTilesT = SERVICE_TILES.map((tile, i) => ({
    ...tile,
    label: tData(`tiles.${i}.label`, { defaultValue: tile.label }),
  }));

  const firstDayRef = useRef<HTMLDivElement>(null);
  const firstDayInView = useInView(firstDayRef, { once: true, margin: '-100px' });
  const bloomRef = useRef<SVGSVGElement>(null);
  const bloomInView = useInView(bloomRef, { once: true, margin: '-80px' });
  const fifthRef = useRef<HTMLDivElement>(null);
  const fifthInView = useInView(fifthRef, { once: true, margin: '-100px' });
  const partnersRef = useRef<HTMLDivElement>(null);
  const partnersInView = useInView(partnersRef, { once: true, margin: '-100px' });
  const [activePartner, setActivePartner] = useState(0);
  const [needIdx, setNeedIdx] = useState<number | null>(null);
  const [slide, setSlide] = useState(0);
  const HERO_TOTAL = HERO_SLIDES.length + 1;
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setSlide((s) => (s + 1) % HERO_TOTAL), 6000);
    return () => clearInterval(id);
  }, [HERO_TOTAL]);

  return (
    <div className="space-y-0">
      {/* 1. HERO CAROUSEL — slide 1 unchanged, then service slides */}
      <section className="relative min-h-[88vh] md:min-h-[92vh] overflow-hidden bg-ivory">
        {/* Slide 1 — the hero, exactly as before */}
        <div className={`absolute inset-0 flex items-center pt-28 md:pt-32 transition-opacity duration-700 ease-out ${slide === 0 ? 'opacity-100 z-[2]' : 'opacity-0 z-0 pointer-events-none'}`}>
          <img src={heroImage} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover object-right" />
          <div className="absolute inset-0 bg-gradient-to-r from-ivory via-ivory/85 to-ivory/20 md:to-transparent"></div>
          <div className="hero-aura2 hidden md:block absolute pointer-events-none" aria-hidden="true"></div>
          <div className="relative z-10 w-full max-w-4xl px-6 sm:px-10 md:px-16 lg:px-20">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} className="inline-flex items-center gap-2.5 mb-6">
              <span className="w-8 h-[1px] bg-gold/50 inline-block"></span>
              <span className="text-[11px] uppercase tracking-[0.28em] font-semibold text-gold">{t('hero.eyebrow', { defaultValue: 'Standing beside families' })}</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }} className="font-serif text-4xl sm:text-5xl md:text-7xl font-semibold text-deep-brown tracking-tight leading-[1.05] mb-6">
              {t('hero.titleLine1', { defaultValue: 'Goodbye is heavy.' })}
              <br /> {t('hero.titleLine2', { defaultValue: "You're not alone in it." })}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }} className="text-base md:text-xl text-charcoal/80 font-light leading-relaxed mb-10 max-w-2xl">
              {t('hero.description', { defaultValue: "From the first call to the final rites, we stay beside your family — arranging all that a farewell asks for, gently and with dignity, so you can simply be with the one you've lost." })}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.65, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link to="/services" className="px-7 py-4 bg-gold text-ivory font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-deep-brown/90 transition-all duration-300 inline-flex items-center justify-center gap-2.5 group shadow-sm hover:-translate-y-0.5 cursor-pointer">
                <span>{t('hero.ctaPrimary', { defaultValue: 'How we can help' })}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <button onClick={onOpenConcierge} className="px-7 py-4 bg-transparent border border-gold/60 text-deep-brown hover:bg-gold hover:text-ivory hover:border-gold font-semibold text-xs uppercase tracking-wider rounded-xs transition-all duration-300 inline-flex items-center justify-center gap-2.5 group hover:-translate-y-0.5 cursor-pointer">
                <span>{t('hero.ctaSecondary', { defaultValue: 'Talk to us — anytime' })}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </motion.div>
          </div>
        </div>

        {/* Service slides */}
        {heroSlidesT.map((s, i) => (
          <div key={s.title} className={`absolute inset-0 flex items-center pt-28 md:pt-32 transition-opacity duration-700 ease-out ${slide === i + 1 ? 'opacity-100 z-[2]' : 'opacity-0 z-0 pointer-events-none'}`}>
            <img src={s.img} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-r from-deep-brown/90 via-deep-brown/70 to-deep-brown/30"></div>
            <div className="relative z-10 w-full max-w-4xl px-6 sm:px-10 md:px-16 lg:px-20">
              <div className="inline-flex items-center gap-2.5 mb-6">
                <span className="w-8 h-[1px] bg-gold inline-block"></span>
                <span className="text-[11px] uppercase tracking-[0.28em] font-semibold text-gold">{t('hero.slideEyebrow', { defaultValue: 'How we help' })}</span>
              </div>
              <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-semibold text-ivory tracking-tight leading-[1.08] mb-6">{s.title}</h2>
              <p className="text-base md:text-xl text-ivory/85 font-light leading-relaxed mb-10 max-w-2xl">{s.line}</p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link to={s.href} className="px-7 py-4 bg-gold text-ivory font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-ivory hover:text-deep-brown transition-all duration-300 inline-flex items-center justify-center gap-2.5 group shadow-sm hover:-translate-y-0.5">
                  <span>{s.cta}</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <button onClick={onOpenConcierge} className="px-7 py-4 bg-transparent border border-ivory/50 text-ivory hover:bg-ivory hover:text-deep-brown font-semibold text-xs uppercase tracking-wider rounded-xs transition-all duration-300 inline-flex items-center justify-center gap-2.5">
                  <span>{t('hero.ctaSecondary', { defaultValue: 'Talk to us — anytime' })}</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel controls */}
        <button aria-label={t('hero.prevSlideAria', { defaultValue: 'Previous slide' })} onClick={() => setSlide((s) => (s - 1 + HERO_TOTAL) % HERO_TOTAL)} className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-[3] w-10 h-10 rounded-full bg-deep-brown/25 hover:bg-deep-brown/60 text-ivory backdrop-blur-sm flex items-center justify-center transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button aria-label={t('hero.nextSlideAria', { defaultValue: 'Next slide' })} onClick={() => setSlide((s) => (s + 1) % HERO_TOTAL)} className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-[3] w-10 h-10 rounded-full bg-deep-brown/25 hover:bg-deep-brown/60 text-ivory backdrop-blur-sm flex items-center justify-center transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-[3] flex items-center gap-2.5">
          {Array.from({ length: HERO_TOTAL }).map((_, i) => (
            <button key={i} aria-label={t('hero.goToSlideAria', { n: i + 1, defaultValue: `Go to slide ${i + 1}` })} onClick={() => setSlide(i)} className={`h-2 rounded-full transition-all duration-300 ${slide === i ? 'w-7 bg-gold' : 'w-2 bg-deep-brown/30 hover:bg-deep-brown/50'}`} />
          ))}
        </div>
      </section>

      {/* 2a. SERVICES — second fold, image tiles */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-ivory border-t border-gold/10">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold block mb-4">{t('services.eyebrow', { defaultValue: 'Our services' })}</span>
            <h2 className="font-serif text-3xl md:text-5xl font-semibold text-deep-brown leading-tight mb-4">{t('services.title', { defaultValue: 'Everything a farewell asks for' })}</h2>
            <p className="text-base md:text-lg text-charcoal/70 font-light leading-relaxed">{t('services.description', { defaultValue: 'From the first call to the weeks that follow — every part of the farewell, carried with dignity.' })}</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {serviceTilesT.map((tile) => (
              <Link key={tile.href + tile.label} to={tile.href} className="group relative block aspect-[4/3] rounded-sm overflow-hidden border border-gold/15 shadow-sm hover:shadow-md transition-shadow duration-300">
                {tile.img ? (
                  <img src={tile.img} alt={tile.label} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(145deg, #3A362F 0%, #5E6B54 100%)' }}>
                    <img src="/assets/logo-emblem-ivory.png" alt="" aria-hidden="true" className="w-16 h-16 opacity-30 transition-transform duration-[900ms] group-hover:scale-110" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-deep-brown/85 via-deep-brown/25 to-transparent" />
                <span className="absolute left-4 right-4 bottom-3.5 font-serif text-base md:text-xl text-ivory leading-tight drop-shadow-sm">{tile.label}</span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10 md:mt-12">
            <Link to="/services" className="inline-flex items-center gap-3 px-7 py-4 bg-gold text-ivory font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-deep-brown transition-all duration-300 group">
              <span>{t('services.cta', { defaultValue: 'See all we do' })}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2b. ETERNAL PROMISE strip */}
      <section className="bg-deep-brown text-ivory py-14 md:py-16 px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-[11px] uppercase tracking-[0.3em] font-semibold block mb-4" style={{ color: '#D9C6A1' }}>{t('promise.eyebrow', { defaultValue: 'The Eternal promise' })}</span>
          <p className="font-serif text-2xl md:text-[32px] leading-[1.4] text-ivory">
            {t('promise.quotePart1', { defaultValue: 'The vehicle is our most visible promise of dignity —' })} <span style={{ color: '#E7D9BD' }}>{t('promise.quotePart2', { defaultValue: 'the care around it is our reason for being.' })}</span>
          </p>
          <p className="mt-5 text-sm md:text-base text-ivory/60 font-light max-w-xl mx-auto">{t('promise.description', { defaultValue: 'We are here for the ordinary floor of decency: someone answers, the weight is carried, and nothing is ever sold to a family in its hardest hour.' })}</p>
        </div>
      </section>

      {/* 3. LIFE-CIRCLE — TWO BLOOMS FROM ONE THREAD */}
      <section className="py-24 md:py-36 px-6 md:px-12 bg-blush/40 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold block mb-4">{t('lifeCircle.eyebrow', { defaultValue: 'Two people to care for' })}</span>
            <h2 className="font-serif text-4xl md:text-6xl font-bold text-deep-brown leading-[1.12]">
              <span className="text-gold">{t('lifeCircle.titleDignity', { defaultValue: 'Dignity' })}</span>{t('lifeCircle.titleMiddle', { defaultValue: " for the one who's gone. " })}<span className="text-gold">{t('lifeCircle.titleCare', { defaultValue: 'Care' })}</span>{t('lifeCircle.titleEnd', { defaultValue: ' for the ones still here.' })}
            </h2>
            <p className="mt-5 text-base md:text-lg text-charcoal/65 font-light leading-relaxed">{t('lifeCircle.description', { defaultValue: "From a single thread, our care blooms two ways — a farewell for the one you've lost, and a steady hand for the family that remains." })}</p>
          </motion.div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-4 lg:gap-8">
            {/* left legend — for the one who's gone */}
            <motion.div initial={{ opacity: 0, x: -14 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="order-2 md:order-1 w-full md:w-auto md:flex-1 md:max-w-[248px] md:text-right">
              <span className="text-[11px] uppercase tracking-[0.24em] text-gold font-semibold block mb-5 md:text-right">{t('lifeCircle.leftLegendLabel', { defaultValue: "For the one who's gone" })}</span>
              <ul className="space-y-3.5">
                {(t('lifeCircle.leftItems', { returnObjects: true, defaultValue: ['Bringing them home', 'A farewell in your tradition', 'Flowers & tributes', 'The final journey'] }) as string[]).map((label) => (
                  <li key={label} className="flex items-center gap-3 md:justify-end text-charcoal/75 font-light"><span>{label}</span><span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" /></li>
                ))}
              </ul>
            </motion.div>

            {/* the bloom */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-70px" }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className="order-1 md:order-2 w-full max-w-[360px] md:max-w-[420px] md:flex-shrink-0">
              <svg ref={bloomRef} viewBox="0 0 440 300" className={`w-full h-auto bloom ${bloomInView ? 'play' : ''}`} role="img" aria-label={t('lifeCircle.bloomAriaLabel', { defaultValue: 'Two blooms of care growing from one thread' })}>
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
            <motion.div initial={{ opacity: 0, x: 14 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} className="order-3 w-full md:w-auto md:flex-1 md:max-w-[248px] md:text-left">
              <span className="text-[11px] uppercase tracking-[0.24em] font-semibold block mb-5 md:text-left" style={{ color: '#B98C71' }}>{t('lifeCircle.rightLegendLabel', { defaultValue: 'For the ones left behind' })}</span>
              <ul className="space-y-3.5">
                {(t('lifeCircle.rightItems', { returnObjects: true, defaultValue: ['Grief support', 'Keepsakes & memory', 'Handling the affairs', 'Someone there, day or night'] }) as string[]).map((label) => (
                  <li key={label} className="flex items-center gap-3 md:justify-start text-charcoal/75 font-light"><span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#B98C71' }} /><span>{label}</span></li>
                ))}
              </ul>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="text-center mt-16 md:mt-20">
            <p className="font-serif text-2xl md:text-3xl italic text-deep-brown/80 mb-7">{t('lifeCircle.closingQuote', { defaultValue: "You grieve. We'll carry the rest." })}</p>
            <Link to="/services" className="inline-flex items-center gap-3 px-7 py-4 bg-gold text-ivory font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-deep-brown transition-all duration-300 group">
              <span>{t('lifeCircle.cta', { defaultValue: 'How we help' })}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* VERSE */}
      <div className="py-16 md:py-24 px-6 bg-ivory text-center overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="max-w-2xl mx-auto">
          <span className="block w-px h-8 bg-gold/35 mx-auto mb-6" />
          <p className="font-serif italic text-2xl md:text-[28px] leading-relaxed text-deep-brown/90">&ldquo;{t('verses.verse1', { defaultValue: 'Death is not extinguishing the light; it is only putting out the lamp because the dawn has come.' })}&rdquo;</p>
          <p className="mt-4 text-[11px] uppercase tracking-[0.22em] font-semibold" style={{ color: '#B98C71' }}>{t('verses.verse1Attr', { defaultValue: 'Rabindranath Tagore' })}</p>
        </motion.div>
      </div>

      {/* 4. THE FIRST DAY, HELD — timeline */}
      <section className="py-28 md:py-40 px-6 md:px-12 bg-ivory overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="text-center max-w-2xl mx-auto mb-14 md:mb-20">
            <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold block mb-4">{t('firstDay.eyebrow', { defaultValue: 'From the first call' })}</span>
            <h2 className="font-serif text-3xl md:text-5xl font-semibold text-deep-brown leading-tight mb-5">{t('firstDay.title', { defaultValue: 'How the hardest day unfolds — with us beside you' })}</h2>
            <p className="text-base md:text-lg text-charcoal/70 font-light leading-relaxed">{t('firstDay.description', { defaultValue: 'The shape of the day a family dreads — held, hour by hour, so they never face any of it alone.' })}</p>
          </motion.div>

          <div ref={firstDayRef} className={`fd-timeline ${firstDayInView ? 'play' : ''}`}>
            {firstDayBeatsT.map((b, i) => (
              <div className="fd-beat" style={{ ['--b' as string]: i } as React.CSSProperties} key={b.title}>
                <div className="fd-time">{b.time}</div>
                <div className="fd-node">
                  <div className="fd-ring" style={{ ['--rc' as string]: b.color } as React.CSSProperties}>
                    <img src={`/assets/timeline/${b.icon}.png`} alt="" aria-hidden="true" />
                  </div>
                  {b.to && <div className="fd-conn" style={{ ['--from' as string]: b.color, ['--to' as string]: b.to } as React.CSSProperties} />}
                </div>
                <div className="fd-body">
                  <div className="fd-bt">{b.title}</div>
                  <div className="fd-bd">{b.desc}</div>
                  {b.chips.length > 0 && (
                    <div className="fd-chips">
                      {b.chips.map((c, j) => (
                        <span className="fd-chip" style={{ ['--c' as string]: j } as React.CSSProperties} key={c}>{c}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4b. SEVEN ETHOS */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-blush/40">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="text-center max-w-2xl mx-auto mb-14 md:mb-16">
            <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold block mb-4">{t('ethos.eyebrow', { defaultValue: 'What we hold to' })}</span>
            <h2 className="font-serif text-3xl md:text-5xl font-semibold text-deep-brown leading-tight mb-5">{t('ethos.title', { defaultValue: 'Seven ethos' })}</h2>
            <p className="text-base md:text-lg text-charcoal/70 font-light leading-relaxed">{t('ethos.description', { defaultValue: 'The commitments we publish in advance — each one you can hold us to.' })}</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-x-14 gap-y-9">
            {ethosT.map((e, i) => (
              <motion.div key={e.t} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, delay: (i % 2) * 0.08, ease: [0.16, 1, 0.3, 1] }} className="flex gap-5 border-t border-gold/15 pt-6">
                <span className="font-serif text-2xl text-gold/70 leading-none shrink-0 w-8">{'0' + (i + 1)}</span>
                <div>
                  <h3 className="font-serif text-xl text-deep-brown mb-1.5">{e.t}</h3>
                  <p className="text-[15px] text-charcoal/75 font-light leading-relaxed">{e.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. THE VEHICLE — one instrument among many */}
      <section className="relative py-28 md:py-40 px-6 md:px-12 bg-ivory overflow-hidden">
        <div className="ff-wm-clip"><div className="ff-watermark" /></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-14 md:gap-20 items-center">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
              <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold block mb-4">{t('vehicleSection.eyebrow', { defaultValue: 'How we carry your loved one' })}</span>
              <h2 className="font-serif text-3xl md:text-5xl font-semibold text-deep-brown leading-[1.18] mb-5">{t('vehicleSection.titleMain', { defaultValue: 'The vehicle is the most visible part of our care — ' })}<em className="text-gold italic">{t('vehicleSection.titleEmphasis', { defaultValue: 'never the whole of it.' })}</em></h2>
              <p className="text-base md:text-lg text-charcoal/75 font-light leading-relaxed max-w-md">{t('vehicleSection.description', { defaultValue: "It carries the one you've lost with privacy and calm. But the real work is everything around it — the hands, the arrangements, the people who stay. The vehicle is simply where that care becomes something you can see." })}</p>
              <Link to="/vehicle" className="mt-8 inline-flex items-center gap-3 px-7 py-4 bg-gold text-ivory font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-deep-brown transition-all duration-300 group">
                <span>{t('vehicleSection.cta', { defaultValue: 'See the vehicle' })}</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            <div ref={fifthRef} className={`ff-arc ${fifthInView ? 'play' : ''}`}>
              <div className="ff-cap">{t('vehicleSection.arcCaption', { defaultValue: 'Everything we carry' })}</div>
              {careArcT.map((n, i) => (
                <div className="ff-row" style={{ ['--i' as string]: i } as React.CSSProperties} key={n.label}>
                  <div className="ff-dotwrap">
                    {n.veh ? (
                      <div className="ff-veh" tabIndex={0} role="button" aria-label={t('vehicleSection.vehicleAriaLabel', { defaultValue: 'The vehicle — look inside' })}>
                        <span className="ff-pulse" /><span className="ff-pulse d2" /><span className="ff-pulse d3" />
                        <img className="ff-thumb" src="/assets/photos/eternal_vehicle_interior.jpg" alt="" aria-hidden="true" />
                        <div className="ff-preview">
                          <img src="/assets/photos/eternal_vehicle_interior.jpg" alt={t('vehicleSection.vehiclePreviewAlt', { defaultValue: 'Inside the vehicle' })} />
                          <span className="ff-pcap">{t('vehicleSection.vehiclePreviewCaption', { defaultValue: 'A quiet, private space — soft light, room to travel alongside.' })}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="ff-dot" />
                    )}
                    {i < careArcT.length - 1 && <span className="ff-conn" />}
                  </div>
                  {n.veh ? (
                    <span className="ff-veh-label">{t('vehicleSection.vehicleLabel', { defaultValue: 'The vehicle' })}<em>{t('vehicleSection.vehicleHoverHint', { defaultValue: 'hover to look inside' })}</em></span>
                  ) : (
                    <span className="ff-label">{n.label}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* VERSE */}
      <div className="py-16 md:py-24 px-6 bg-ivory text-center overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="max-w-2xl mx-auto">
          <span className="block w-px h-8 bg-gold/35 mx-auto mb-6" />
          <p className="font-serif italic text-2xl md:text-[28px] leading-relaxed text-deep-brown/90">&ldquo;{t('verses.verse2', { defaultValue: 'The ones we love do not leave us — they become the light we carry.' })}&rdquo;</p>
          <p className="mt-4 text-[11px] uppercase tracking-[0.22em] font-semibold" style={{ color: '#B98C71' }}>{t('verses.verse2Attr', { defaultValue: 'A quiet remembrance' })}</p>
        </motion.div>
      </div>

      {/* 5c. SERVICE CONFIGURATOR */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-blush/40">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
            <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold block mb-4">{t('configurator.eyebrow', { defaultValue: 'Find the right care' })}</span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-deep-brown leading-tight mb-4">{t('configurator.title', { defaultValue: "Tell us where you are, and we'll point the way." })}</h2>
            <p className="text-base text-charcoal/70 font-light leading-relaxed">{t('configurator.description', { defaultValue: 'Choose what fits your moment — there is no wrong answer, and no obligation.' })}</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
            {needsT.map((n, i) => (
              <button key={n.q} onClick={() => setNeedIdx(i)} className={`text-left px-5 py-4 rounded-xs border text-[15px] font-light leading-snug transition-all duration-300 ${needIdx === i ? 'bg-deep-brown text-ivory border-deep-brown' : 'bg-white text-charcoal/80 border-gold/20 hover:border-gold hover:-translate-y-0.5'}`}>{n.q}</button>
            ))}
          </div>
          {needIdx !== null && (() => {
            const c = SERVICES_DATA[NEEDS[needIdx].to];
            const Icon = c.icon;
            const cTitle = tData(`categories.${c.id}.title`, { defaultValue: c.title });
            const cSummary = tData(`categories.${c.id}.summary`, { defaultValue: c.summary });
            return (
              <motion.div key={needIdx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="mt-6 max-w-2xl mx-auto bg-white border border-gold/20 rounded-sm p-8 shadow-md">
                <div className="flex items-start gap-4">
                  <span className="w-12 h-12 rounded-full bg-blush border border-gold/25 flex items-center justify-center shrink-0"><Icon className="w-5 h-5 text-gold" /></span>
                  <div className="flex-grow">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-gold font-semibold block mb-1">{t('configurator.resultLabel', { defaultValue: 'Where to begin' })}</span>
                    <h3 className="font-serif text-2xl text-deep-brown mb-2">{cTitle}</h3>
                    <p className="text-[15px] text-charcoal/75 font-light leading-relaxed mb-6">{cSummary}</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link to={c.path} className="px-6 py-3 bg-gold text-ivory font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-deep-brown transition-colors inline-flex items-center justify-center gap-2">{t('configurator.exploreCta', { defaultValue: 'Explore this care' })} <ArrowRight className="w-4 h-4" /></Link>
                      <button onClick={onOpenConcierge} className="px-6 py-3 bg-transparent border border-gold/50 text-deep-brown font-semibold text-xs uppercase tracking-wider rounded-xs hover:bg-gold hover:text-ivory transition-colors">{t('configurator.talkCta', { defaultValue: 'Talk to us' })}</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </div>
      </section>

      {/* 6. INDUSTRY — expertise numbers band */}
      <section className="paper-dark py-24 md:py-32 px-6 md:px-12 bg-deep-brown text-ivory">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <span className="text-[11px] uppercase tracking-[0.3em] font-semibold block mb-3" style={{ color: '#D9C6A1' }}>{t('industry.eyebrow', { defaultValue: 'Standing beside families' })}</span>
            <h2 className="font-serif text-3xl md:text-5xl font-medium text-ivory mb-14 md:mb-16">{t('industry.title', { defaultValue: 'The measure of our care' })}</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6 max-w-4xl mx-auto">
            {[
              { n: '24/7', l: t('industry.stats.0.label', { defaultValue: 'A real person answers' }) },
              { n: '6+', l: t('industry.stats.1.label', { defaultValue: 'Faith traditions honoured' }) },
              { n: '100%', l: t('industry.stats.2.label', { defaultValue: 'Privacy, always' }) },
              { n: '1', l: t('industry.stats.3.label', { defaultValue: 'Family, held end to end' }) },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }} className="text-center">
                <div className="font-serif text-4xl md:text-6xl font-semibold leading-none" style={{ color: '#E7D9BD' }}>{s.n}</div>
                <div className="text-[13px] md:text-sm text-ivory/60 font-light mt-3">{s.l}</div>
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
              <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold">{t('partners.eyebrow', { defaultValue: 'Institutions & Hospital Partnerships' })}</span>
            </div>
            <h2 className="font-serif text-3xl md:text-5xl font-semibold text-deep-brown leading-[1.15]">
              {t('partners.title', { defaultValue: 'In active partnership with hospitals — meeting families where the need begins.' })}
            </h2>
            <p className="mt-4 text-base md:text-lg text-charcoal/75 font-light leading-relaxed">
              {t('partners.description', { defaultValue: 'We work in direct partnership with hospitals, hospices, and care facilities across Delhi NCR — stepping in with dignity right at the ward door so doctors and nurses can focus on healing, while families receive immediate, compassionate care.' })}
            </p>
          </motion.div>

          <div className="flex flex-wrap gap-1.5 border-b border-gold/20">
            {partnersT.map((p, i) => (
              <button key={p.tab} onClick={() => setActivePartner(i)} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${activePartner === i ? 'text-gold border-gold' : 'text-charcoal/55 border-transparent hover:text-charcoal/80'}`}>{p.tab}</button>
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
                { cls: 'ph-n0', pos: { top: '12.5%', left: '50%' }, lpos: { top: '3%', left: '50%' } },
                { cls: 'ph-n1', pos: { top: '50%', left: '87.5%' }, lpos: { top: '42%', left: '86%' } },
                { cls: 'ph-n2', pos: { top: '87.5%', left: '50%' }, lpos: { top: '96%', left: '50%' } },
                { cls: 'ph-n3', pos: { top: '50%', left: '12.5%' }, lpos: { top: '42%', left: '14%' } },
              ].map((nd, i) => (
                <React.Fragment key={i}>
                  <button className={`ph-node ${nd.cls} ${activePartner === i ? 'on' : ''}`} style={nd.pos as React.CSSProperties} onClick={() => setActivePartner(i)} aria-label={partnersT[i].tab} />
                  <span className={`ph-nl ${activePartner === i ? 'on' : ''}`} style={nd.lpos as React.CSSProperties}>{partnersT[i].tab}</span>
                </React.Fragment>
              ))}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h3 className="font-serif text-2xl md:text-3xl text-deep-brown">{partnersT[activePartner].title}</h3>
                {activePartner === 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold bg-gold/15 text-gold border border-gold/30">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{t('partners.officialPartnerBadge', { defaultValue: 'Official Partner' })}</span>
                  </span>
                )}
              </div>
              <p className="text-base text-charcoal/75 font-light leading-relaxed mb-6 max-w-xl">{partnersT[activePartner].desc}</p>

              {activePartner === 0 && (
                <div className="mb-6 p-4 rounded-xs bg-blush/60 border border-gold/30 flex items-start gap-3.5 max-w-xl">
                  <div className="w-8 h-8 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0 mt-0.5">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-bold text-deep-brown mb-1">
                      {t('partners.hospitalNetworkHeading', { defaultValue: 'Hospital Partner Network · Delhi NCR' })}
                    </h4>
                    <p className="text-xs text-charcoal/80 font-light leading-relaxed">
                      {t('partners.hospitalNetworkDesc', { defaultValue: 'Empanelled with leading hospital networks, critical care centres, and mortuaries across Delhi, Noida, and Gurugram for prompt bedside clearance, death slip documentation guidance, and dignified transfer.' })}
                    </p>
                  </div>
                </div>
              )}

              <ul className="border-l-2 border-gold-light/60 pl-5 space-y-2.5">
                <li className="text-[10px] uppercase tracking-[0.24em] font-semibold list-none" style={{ color: '#B98C71' }}>{t('partners.liftsLabel', { defaultValue: 'The weight we lift' })}</li>
                {partnersT[activePartner].lifts.map((x) => (
                  <li key={x} className="text-sm text-charcoal/80 font-light list-none flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold/60 shrink-0" />
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
              <Link to="/institutions" className="mt-8 inline-flex items-center gap-3 px-7 py-4 bg-gold text-ivory font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-deep-brown transition-all duration-300 group">
                <span>{t('partners.cta', { defaultValue: 'Partner with us' })}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
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
          <div className="text-center max-w-2xl mx-auto mb-8 md:mb-10">
            <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold block mb-4">{t('mahaprayaan.eyebrow', { defaultValue: 'Mahaprayaan × Eternal Repos' })}</span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-deep-brown leading-tight">{t('mahaprayaan.title', { defaultValue: 'Grief is easier carried together.' })}</h2>
            <p className="mt-4 text-base text-charcoal/70 font-light leading-relaxed">{t('mahaprayaan.description', { defaultValue: "Mahaprayaan is a community initiative we stand beside — a gentle space for the conversations loss makes hard to start. Eternal carries the practical weight; Mahaprayaan holds the room to talk, remember and heal." })}</p>
          </div>
          <a
            href="https://community.mahaprayaan.com/feed"
            target="_blank"
            rel="noreferrer"
            className="block group rounded-sm overflow-hidden border border-gold/12 shadow-[0_30px_80px_rgba(58,54,47,0.12)]"
          >
            <img
              src="/assets/mahaprayaan-community-banner.jpg"
              alt={t('mahaprayaan.bannerAlt', { defaultValue: "Mahaprayaan, a community initiative — a space for the conversations we don't know how to start." })}
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
              <span>{t('mahaprayaan.joinCta', { defaultValue: 'Join the community' })}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="https://hello.mahaprayaan.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 border border-gold text-deep-brown font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-gold hover:text-ivory transition-all duration-300 group"
            >
              <span>{t('mahaprayaan.shareCta', { defaultValue: 'Share your experience' })}</span>
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
            <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold block mb-4">{t('testimonials.eyebrow', { defaultValue: 'In their words' })}</span>
            <h2 className="font-serif text-3xl md:text-5xl font-semibold text-deep-brown leading-tight mb-4">{t('testimonials.title', { defaultValue: 'Held, when it mattered most.' })}</h2>
            <p className="text-base text-charcoal/70 font-light leading-relaxed">{t('testimonials.description', { defaultValue: "Reflections from families we've stood beside, in their hardest hours." })}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {testimonialsT.map((s, i) => (
              <motion.figure
                key={s.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.8, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white border border-gold/12 rounded-sm p-9 md:p-10 flex flex-col justify-between shadow-[0_10px_40px_rgba(58,54,47,0.05)]"
              >
                <div>
                  <span className="font-serif text-5xl text-gold/40 leading-none block mb-3">&ldquo;</span>
                  <blockquote className="font-serif text-lg md:text-xl italic text-charcoal/85 leading-relaxed">{s.quote}</blockquote>
                </div>
                <figcaption className="pt-6 mt-6 border-t border-gold/12 flex items-center gap-3.5">
                  <span className="w-11 h-11 rounded-full bg-blush border border-gold/25 flex items-center justify-center font-serif text-gold text-sm shrink-0" aria-hidden="true">{s.initials}</span>
                  <span className="min-w-0">
                    <span className="font-serif text-base text-deep-brown block">{s.name}</span>
                    <span className="text-[11px] text-gold/90 uppercase tracking-wider">{t('testimonials.caption', { defaultValue: 'A family we stood beside' })}</span>
                  </span>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* VERSE */}
      <div className="py-16 md:py-24 px-6 bg-ivory text-center overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="max-w-2xl mx-auto">
          <span className="block w-px h-8 bg-gold/35 mx-auto mb-6" />
          <p className="font-serif italic text-2xl md:text-[28px] leading-relaxed text-deep-brown/90">&ldquo;{t('verses.verse3', { defaultValue: 'When words fail, we stay beside you.' })}&rdquo;</p>
          <p className="mt-4 text-[11px] uppercase tracking-[0.22em] font-semibold" style={{ color: '#B98C71' }}>{t('verses.verse3Attr', { defaultValue: 'Eternal Repos' })}</p>
        </motion.div>
      </div>

      {/* 6c. EAQs */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-ivory">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold block mb-4">{t('eaqs.eyebrow', { defaultValue: 'EAQs' })}</span>
            <h2 className="font-serif text-3xl md:text-5xl font-semibold text-deep-brown leading-tight mb-4">{t('eaqs.title', { defaultValue: 'Questions families ask' })}</h2>
            <p className="text-base text-charcoal/70 font-light leading-relaxed">{t('eaqs.description', { defaultValue: 'Straight answers to what most people want to know.' })}</p>
          </motion.div>
          <div className="divide-y divide-gold/15 border-t border-gold/15">
            {eaqsT.map((f) => (
              <div key={f.q} className="py-6">
                <h3 className="font-serif text-lg md:text-xl text-deep-brown mb-2">{f.q}</h3>
                <p className="text-[15px] text-charcoal/75 font-light leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/faq" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gold hover:text-deep-brown transition-colors">{t('eaqs.seeAll', { defaultValue: 'See all answers' })} <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA SECTION */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-blush border-t border-gold/20 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto relative z-10">
          <span className="text-[11px] uppercase tracking-[0.25em] text-gold font-semibold block mb-3">
            {t('finalCta.eyebrow', { defaultValue: 'WE ARE HERE TO HELP' })}
          </span>
          <h2 className="font-serif text-4xl md:text-6xl font-bold text-deep-brown mb-6 leading-tight">
            {t('finalCta.title', { defaultValue: 'Standing Beside You in Your Time of Need.' })}
          </h2>
          <p className="text-base text-charcoal/80 font-light leading-relaxed mb-10 max-w-xl mx-auto">
            {t('finalCta.description', { defaultValue: "Whenever you're ready — for gentle guidance, immediate help, or quiet pre-planning — we're only a call away." })}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onOpenConcierge}
              className="w-full sm:w-auto px-8 py-4 bg-deep-brown text-ivory font-bold text-xs uppercase tracking-widest rounded-xs hover:bg-deep-brown/90 transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg border border-gold/30 hover:shadow-gold-glow hover:-translate-y-0.5 cursor-pointer"
            >
              <span>{t('finalCta.talkCta', { defaultValue: 'Talk to us — anytime' })}</span>
              <ArrowRight className="w-4 h-4 text-gold" />
            </button>
            <Link
              to="/contact"
              className="w-full sm:w-auto px-8 py-4 bg-white border border-gold text-deep-brown font-bold text-xs uppercase tracking-widest rounded-xs hover:bg-ivory transition-all duration-300 flex items-center justify-center gap-2.5 hover:-translate-y-0.5"
            >
              {t('finalCta.contactCta', { defaultValue: 'Reach our team' })}
            </Link>
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 text-xs text-charcoal/70">
            <ShieldCheck className="w-4 h-4 text-gold shrink-0" />
            <span>{t('finalCta.supportLine', { defaultValue: '24/7 Compassionate Support · Standing Beside Families Across India' })}</span>
          </div>
        </div>
      </section>
    </div>
  );
};

