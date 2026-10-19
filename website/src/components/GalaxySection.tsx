import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles, Flame, X, ChevronRight, Crown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NightSkyBackdrop } from './NightSkyBackdrop';
import { DIYA_PRICE, useUpiQr } from '../utils/publicUpi';
import { listSkyStars, type SkyStar } from '../utils/crmBooking';
import { listApprovedTributes, photoUrl, type Tribute } from '../utils/tributes';

/** ₹20 UPI QR for offering a diya, made from the company UPI ID so the amount is always right. */
const DiyaQr: React.FC = () => {
  const qr = useUpiQr(DIYA_PRICE, 'Diya offering');
  return qr ? (
    <img src={qr} alt="Scan and pay ₹20 with any UPI app" className="mx-auto w-52 rounded-xs bg-white p-1" />
  ) : (
    <div className="mx-auto w-52 h-52 rounded-xs bg-white/10" aria-hidden />
  );
};

export interface CelestialStar {
  id: string;
  name: string;
  years?: string;
  addedAt?: string; // ISO timestamp the tribute was lit in the sky
  category?: 'Guiding Elder' | 'Beloved Parent' | 'Gentle Soul' | 'Community Pillar';
  memory: string;
  photo?: string;
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  size: number;
  glowColor?: string;
  tributeSlug?: string;
}

// Exemplar stars reflecting timeless remembrance across families
const FOUNDING_STARS: CelestialStar[] = [
  {
    id: 'star-1',
    name: 'Brij Mohan Sharma',
    years: '1942 – 2021',
    addedAt: '2026-03-08',
    category: 'Guiding Elder',
    memory: 'A lifelong teacher whose quiet wisdom and warm patience shaped three generations.',
    x: 48,
    y: 34,
    size: 26,
    glowColor: 'rgba(217, 198, 161, 0.95)',
  },
  {
    id: 'star-2',
    name: 'Savitri Devi',
    years: '1946 – 2023',
    addedAt: '2026-04-19',
    category: 'Beloved Parent',
    memory: 'Her home was always open, her hands always giving, her silent blessing always felt.',
    x: 28,
    y: 42,
    size: 22,
    glowColor: 'rgba(244, 236, 218, 0.9)',
  },
  {
    id: 'star-3',
    name: 'Col. Vikram Malhotra',
    years: '1951 – 2022',
    addedAt: '2026-05-27',
    category: 'Community Pillar',
    memory: 'A guardian of duty, honour, and unshakeable grace through every trial of life.',
    x: 72,
    y: 36,
    size: 24,
    glowColor: 'rgba(217, 198, 161, 0.9)',
  },
  {
    id: 'star-4',
    name: 'Dr. Ramesh K. Varma',
    years: '1939 – 2024',
    addedAt: '2026-06-14',
    category: 'Guiding Elder',
    memory: 'Dedicated fifty years to healing others with boundless empathy and humble devotion.',
    x: 38,
    y: 63,
    size: 20,
    glowColor: 'rgba(244, 236, 218, 0.85)',
  },
  {
    id: 'star-5',
    name: 'Ananya Sen',
    years: '1988 – 2020',
    addedAt: '2026-07-02',
    category: 'Gentle Soul',
    memory: 'Her laughter brought dawn into every room. An artist whose colors remain eternal.',
    x: 62,
    y: 60,
    size: 22,
    glowColor: 'rgba(217, 198, 161, 0.9)',
  },
  {
    id: 'star-6',
    name: 'Gurcharan Singh',
    years: '1947 – 2022',
    addedAt: '2026-07-30',
    category: 'Community Pillar',
    memory: 'A pillar of selfless seva, gentle humor, and unwavering courage in every storm.',
    x: 20,
    y: 26,
    size: 19,
    glowColor: 'rgba(244, 236, 218, 0.8)',
  },
  {
    id: 'star-7',
    name: 'Padma Venkataraman',
    years: '1955 – 2024',
    addedAt: '2026-08-21',
    category: 'Gentle Soul',
    memory: 'Taught us that love is never measured in years, but in kindness given freely.',
    x: 82,
    y: 54,
    size: 21,
    glowColor: 'rgba(217, 198, 161, 0.85)',
  },
  {
    id: 'star-8',
    name: 'Prof. Harish Chandra',
    years: '1944 – 2023',
    addedAt: '2026-09-14',
    category: 'Guiding Elder',
    memory: 'A thinker who believed that knowledge is sacred when shared with humility and love.',
    x: 68,
    y: 18,
    size: 20,
    glowColor: 'rgba(244, 236, 218, 0.8)',
  },
];

// Seeded pseudorandom generator for deterministic background stars
const seededRandom = (seed: number) => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

const BACKGROUND_STARS = (() => {
  const rand = seededRandom(42);
  return Array.from({ length: 22 }, (_, i) => ({
    id: i,
    x: rand() * 100,
    y: rand() * 100,
    size: rand() * 2 + 0.8,
    opacity: 0.2 + rand() * 0.65,
    delay: rand() * 6,
    duration: 3 + rand() * 4,
    color: rand() > 0.35 ? '#F4ECDA' : '#D9C6A1',
  }));
})();

// Constellation lines connecting kindred stars in the sky
const CONSTELLATION_EDGES: [string, string][] = [
  ['star-6', 'star-2'],
  ['star-2', 'star-1'],
  ['star-1', 'star-3'],
  ['star-3', 'star-8'],
  ['star-2', 'star-4'],
  ['star-4', 'star-5'],
  ['star-5', 'star-3'],
  ['star-5', 'star-7'],
];

// Each star needs room for its orb and name label. Distances are measured on an
// ellipse (labels are wide and short) so no two stars or labels overlap.
const CLEAR_X = 19; // % of canvas width
const CLEAR_Y = 14; // % of canvas height

const findFreeSpot = (placed: { x: number; y: number }[], seed: number) => {
  const clearance = (x: number, y: number) =>
    placed.reduce((min, p) => Math.min(min, Math.hypot((x - p.x) / CLEAR_X, (y - p.y) / CLEAR_Y)), Infinity);
  let best = { x: 50, y: 50 };
  let bestScore = -1;
  for (let i = 0; i < 400; i++) {
    const angle = (seed + i) * 2.399963;
    const radius = Math.sqrt((i + 1) / 400);
    const x = 50 + Math.cos(angle) * radius * 41;
    const y = 50 + Math.sin(angle) * radius * 36;
    if (x < 9 || x > 91 || y < 11 || y > 87) continue;
    const score = clearance(x, y);
    if (score >= 1) return { x, y };
    if (score > bestScore) {
      bestScore = score;
      best = { x, y };
    }
  }
  return best;
};

interface GalaxySectionProps {
  onOpenConcierge?: () => void;
}

export const GalaxySection: React.FC<GalaxySectionProps> = ({ onOpenConcierge }) => {
  const { t } = useTranslation('galaxy');
  const [activeStar, setActiveStar] = useState<CelestialStar | null>(null);
  const [tributes, setTributes] = useState<Tribute[]>([]);
  const [bookedStars, setBookedStars] = useState<SkyStar[]>([]);
  const [diyaCounts, setDiyaCounts] = useState<Record<string, number>>({});
  const [hasOfferedDiya, setHasOfferedDiya] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let alive = true;
    listSkyStars()
      .then((rows) => alive && Array.isArray(rows) && setBookedStars(rows))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    listApprovedTributes()
      .then((data) => {
        if (alive && data?.length) setTributes(data);
      })
      .catch(() => {
        // Quietly fallback to curated galaxy stars
      });
    return () => {
      alive = false;
    };
  }, []);

  // Merge live tributes with curated constellation stars
  const allStars: CelestialStar[] = useMemo(() => {
    const list: CelestialStar[] = [...FOUNDING_STARS];

    tributes.forEach((t, idx) => {
      const { x, y } = findFreeSpot(list, idx * 7 + 3);

      list.push({
        id: `tribute-${t.id}`,
        name: t.name,
        years:
          t.born_year || t.passed_year
            ? [t.born_year, t.passed_year].filter(Boolean).join(' – ')
            : undefined,
        addedAt: t.created_at,
        category: 'Gentle Soul',
        memory: t.message || 'Resting peacefully in the eternal celestial sky, forever cherished.',
        photo: t.photo_path ? photoUrl(t.photo_path) : undefined,
        x,
        y,
        size: 24,
        glowColor: 'rgba(217, 198, 161, 1)',
        tributeSlug: t.slug,
      });
    });

    // Stars booked through "Book a Star" appear as soon as they are requested.
    bookedStars.forEach((b, idx) => {
      const { x, y } = findFreeSpot(list, (idx + tributes.length) * 7 + 5);
      list.push({
        id: `booked-${b.id}`,
        name: b.name,
        years: b.birth_year || b.death_year ? [b.birth_year, b.death_year].filter(Boolean).join(' – ') : undefined,
        addedAt: b.created_at,
        category: 'Gentle Soul',
        memory: b.about || 'Resting peacefully in the eternal celestial sky, forever cherished.',
        x,
        y,
        size: 24,
        glowColor: 'rgba(217, 198, 161, 1)',
      });
    });

    return list;
  }, [tributes, bookedStars]);

  // Offer a Diya: the panel shows the disclaimer and a UPI QR for the ₹20 contribution.
  const [diyaPanelFor, setDiyaPanelFor] = useState<string | null>(null);

  const handleOfferDiya = (starId: string) => {
    if (hasOfferedDiya[starId]) return;
    setDiyaCounts((prev) => ({ ...prev, [starId]: (prev[starId] || 0) + 1 }));
    setHasOfferedDiya((prev) => ({ ...prev, [starId]: true }));
  };

  return (
    <section id="galaxy-sky" className="relative py-20 md:py-32 bg-ivory text-deep-brown overflow-hidden border-t border-gold/20">
      <div className="relative max-w-6xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/60 border border-gold/40"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span className="text-[11px] uppercase tracking-[0.25em] text-gold font-semibold">
              {t('header.eyebrowSuffix')}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/40 ml-2"
          >
            <Crown className="w-3.5 h-3.5 text-gold" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-gold font-semibold">
              {t('header.vipBadge')}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-deep-brown tracking-tight leading-tight"
          >
            {t('header.heading')}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-charcoal/80 font-light leading-relaxed max-w-2xl mx-auto"
          >
            {t('header.body')}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-xs sm:text-sm text-charcoal/70 font-light italic"
          >
            {t('header.vipNote')}{' '}
            <a href="#packages" className="underline decoration-gold/50 underline-offset-2 hover:text-deep-brown font-medium not-italic">
              {t('header.vipPackageLink')}
            </a>{t('header.vipSuffix')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3 pt-2"
          >
            <Link
              to="/book-a-star"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-ivory font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-deep-brown transition-all duration-300"
            >
              <Crown className="w-3.5 h-3.5" />
              {t('header.bookStarCta')}
            </Link>
            <Link
              to="/my-star/login"
              className="text-xs uppercase tracking-wider font-semibold text-charcoal/80 border-b border-charcoal/30 pb-1 hover:text-deep-brown hover:border-deep-brown/60 transition-colors"
            >
              {t('header.familyLoginCta')}
            </Link>
          </motion.div>
        </div>

        {/* Galaxy Interactive Sky Canvas */}
        <div
          className="relative w-full h-[540px] sm:h-[620px] md:h-[680px] rounded-sm overflow-hidden border border-gold/30 shadow-[0_25px_70px_rgba(0,0,0,0.85)]"
          style={{ background: '#030405' }}
          aria-label={t('canvas.ariaLabel')}
        >
          <NightSkyBackdrop />

          {/* Constellation threads (SVG Overlay) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-15" aria-hidden="true">
            {CONSTELLATION_EDGES.map(([idA, idB], idx) => {
              const starA = allStars.find((s) => s.id === idA);
              const starB = allStars.find((s) => s.id === idB);
              if (!starA || !starB) return null;
              return (
                <line
                  key={idx}
                  x1={`${starA.x}%`}
                  y1={`${starA.y}%`}
                  x2={`${starB.x}%`}
                  y2={`${starB.y}%`}
                  stroke="#cfd9f0"
                  strokeWidth="0.6"
                  strokeDasharray="1 5"
                />
              );
            })}
          </svg>

          {/* Seeded Background Twinkling Stars */}
          {BACKGROUND_STARS.map((s) => (
            <span
              key={s.id}
              className="star-twinkle absolute rounded-full pointer-events-none"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                backgroundColor: s.color,
                opacity: s.opacity,
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.duration}s`,
              }}
              aria-hidden="true"
            />
          ))}

          {/* Celestial Named Memorial Stars */}
          {allStars.map((star, idx) => {
            const isSelected = activeStar?.id === star.id;
            return (
              <motion.div
                key={star.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: Math.min(idx * 0.06, 1), ease: [0.16, 1, 0.3, 1] }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
                style={{ left: `${star.x}%`, top: `${star.y}%` }}
                onClick={() => setActiveStar(isSelected ? null : star)}
              >
                <div className="group relative flex flex-col items-center">
                  {/* Soft gold glowing orb */}
                  <div
                    className="relative flex items-center justify-center transition-transform duration-500 group-hover:scale-125"
                    style={{ width: 64, height: 64, transform: isSelected ? 'scale(1.3)' : undefined }}
                  >
                    <span
                      className="absolute rounded-full pointer-events-none star-twinkle"
                      style={{
                        inset: 0,
                        background:
                          'radial-gradient(circle, rgba(255,255,255,0.38) 0%, rgba(235,240,255,0.14) 38%, rgba(220,230,255,0) 72%)',
                        animationDuration: `${5 + (idx % 5)}s`,
                        animationDelay: `${(idx % 7) * 0.7}s`,
                      }}
                      aria-hidden="true"
                    />
                    {star.photo ? (
                      <img
                        src={star.photo}
                        alt={star.name}
                        className="relative w-10 h-10 object-cover rounded-full border-2 border-white shadow-[0_0_18px_5px_rgba(255,255,255,0.4)]"
                      />
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        width={isSelected ? 30 : 24}
                        height={isSelected ? 30 : 24}
                        className="relative"
                        style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.9)) drop-shadow(0 0 12px rgba(255,255,255,0.45))' }}
                        aria-hidden="true"
                      >
                        <polygon
                          points="12,1.5 14.9,8.6 22.5,9.2 16.7,14.2 18.5,21.6 12,17.6 5.5,21.6 7.3,14.2 1.5,9.2 9.1,8.6"
                          fill="#ffffff"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Name Label Below Star */}
                  <div
                    className={`-mt-1 px-2.5 py-0.5 rounded-full bg-black/35 text-[12.5px] sm:text-[14px] font-serif tracking-[0.04em] whitespace-nowrap transition-colors duration-300 pointer-events-none [text-shadow:0_1px_8px_rgba(0,0,0,0.95)] ${
                      isSelected ? 'text-white' : 'text-ivory group-hover:text-white'
                    }`}
                  >
                    {star.name}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Helper Legend in Bottom Left */}
          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-20 pointer-events-none flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-[11px] text-ivory/70 font-light">
            <span className="w-2 h-2 rounded-full bg-gold-light animate-pulse" />
            <span>{t('canvas.legend')}</span>
          </div>

          {/* Interactive Star Remembrance Card (Popup / Drawer) */}
          <AnimatePresence>
            {activeStar && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="absolute z-30 bottom-6 right-6 left-6 sm:left-auto sm:max-w-sm bg-[#1A201A]/95 backdrop-blur-xl border border-gold/40 rounded-sm p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-ivory"
              >
                <button
                  onClick={() => setActiveStar(null)}
                  className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-ivory/70 hover:text-white transition-colors cursor-pointer"
                  aria-label={t('canvas.closeDetails')}
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-full border border-gold/60 flex items-center justify-center shrink-0 overflow-hidden bg-[#2D362B] shadow-[0_0_15px_rgba(217,198,161,0.3)]"
                  >
                    {activeStar.photo ? (
                      <img
                        src={activeStar.photo}
                        alt={activeStar.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Star className="w-6 h-6 text-gold-light" fill="currentColor" />
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gold-light font-semibold block mb-0.5">
                      {activeStar.category
                        ? t(`categories.${activeStar.category}`, { defaultValue: activeStar.category })
                        : t('canvas.defaultCategory')}
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-white leading-tight">
                      {activeStar.name}
                    </h3>
                    {activeStar.years && (
                      <p className="text-xs text-ivory/60 font-light mt-0.5">{activeStar.years}</p>
                    )}
                    {activeStar.addedAt && (
                      <p className="text-[11px] text-ivory/45 font-light mt-1">
                        {t('canvas.addedOn', { defaultValue: 'Lit in the sky on' })}{' '}
                        {new Date(activeStar.addedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>

                <blockquote className="italic font-serif text-sm sm:text-base text-ivory/90 leading-relaxed border-l-2 border-gold/50 pl-3.5 py-1 mb-5 bg-white/5 rounded-r-xs">
                  “{t(`stars.${activeStar.id}.memory`, { defaultValue: activeStar.memory })}”
                </blockquote>

                <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
                  <button
                    onClick={() => {
                      if (hasOfferedDiya[activeStar.id]) return;
                      setDiyaPanelFor(diyaPanelFor === activeStar.id ? null : activeStar.id);
                    }}
                    className={`inline-flex items-center gap-1.5 text-xs py-2 px-3 rounded-xs font-medium transition-all duration-300 cursor-pointer ${
                      hasOfferedDiya[activeStar.id]
                        ? 'bg-gold/30 text-gold-light border border-gold/40'
                        : 'bg-white/10 hover:bg-gold/20 text-ivory hover:text-gold-light border border-white/10'
                    }`}
                  >
                    <Flame
                      className={`w-3.5 h-3.5 ${
                        hasOfferedDiya[activeStar.id] ? 'text-amber-400 fill-amber-400' : 'text-gold-light'
                      }`}
                    />
                    <span>
                      {hasOfferedDiya[activeStar.id] ? t('canvas.diyaOffered') : t('canvas.diyaOffer')}
                      {diyaCounts[activeStar.id] ? ` (${diyaCounts[activeStar.id]})` : ''}
                    </span>
                  </button>

                  {activeStar.tributeSlug && (
                    <a
                      href={`/asthi-visarjan/star/${activeStar.tributeSlug}`}
                      className="inline-flex items-center gap-1 text-xs text-gold-light hover:underline font-light"
                    >
                      <span>{t('canvas.fullMemorial')}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {diyaPanelFor === activeStar.id && !hasOfferedDiya[activeStar.id] && (
                  <div className="mt-3 rounded-xs border border-gold/30 bg-white/5 p-3.5 space-y-3 text-center">
                    <p className="text-xs text-ivory/80 font-light leading-relaxed">
                      {t('canvas.diyaDisclaimer')}
                    </p>
                    <DiyaQr />
                    <button
                      onClick={() => setDiyaPanelFor(null)}
                      className="text-xs py-1.5 px-3 text-ivory/60 hover:text-ivory cursor-pointer"
                    >
                      {t('canvas.diyaCancel')}
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Gentle Narrative Footnote */}
        <div className="mt-12 text-center max-w-xl mx-auto space-y-3">
          <p className="text-xs sm:text-sm text-ivory/60 font-light leading-relaxed">
            {t('footnote.body')}
          </p>
          <div className="pt-2">
            <button
              onClick={() => onOpenConcierge?.()}
              className="text-xs uppercase tracking-[0.2em] font-semibold text-gold-light hover:text-ivory border-b border-gold-light/40 pb-0.5 transition-colors cursor-pointer"
            >
              {t('footnote.concierge')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GalaxySection;
