import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { listApprovedTributes, photoUrl, SkyUnavailableError, type Tribute } from '../utils/tributes';
import { NameAStar } from './NameAStar';

export type SkyState =
  | { status: 'loading' }
  | { status: 'unavailable' }
  | { status: 'ready'; tributes: Tribute[] };

// Small seeded generator so the background stars are the same on every visit.
const mulberry = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const BACKDROP = (() => {
  const r = mulberry(11);
  return Array.from({ length: 90 }, () => ({ x: r() * 100, y: r() * 100, s: r() * 1.7 + 0.6, d: r() * 5, o: 0.25 + r() * 0.5 }));
})();

// Golden-angle spiral: gives a galaxy-like sweep and keeps neighbouring stars apart.
const place = (i: number, n: number) => {
  const r = Math.sqrt((i + 0.6) / (n + 0.6));
  const a = i * 2.399963;
  return { x: 50 + Math.cos(a) * r * 42, y: 50 + Math.sin(a) * r * 36 };
};

export const Sky: React.FC<{ state: SkyState }> = ({ state }) => {
  const { t: tr } = useTranslation('components');
  const tributes = state.status === 'ready' ? state.tributes : [];
  const size = Math.max(34, Math.min(60, 62 - tributes.length * 0.7));
  return (
    <div
      className="relative h-[480px] md:h-[580px] rounded-sm overflow-hidden shadow-lg"
      style={{ background: 'radial-gradient(ellipse at 50% 45%, #3a4034 0%, #262a22 45%, #171914 100%)' }}
      aria-label={tr('starSky.skyAriaLabel')}
    >
      {/* soft glow at the heart of the galaxy */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, rgba(217,198,161,0.55), transparent 65%)' }} aria-hidden="true" />
      {BACKDROP.map((s, i) => (
        <span
          key={i}
          className="star-twinkle absolute rounded-full bg-[#F4ECDA]"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, opacity: s.o, animationDelay: `${s.d}s` }}
          aria-hidden="true"
        />
      ))}

      {state.status === 'ready' &&
        tributes.map((t, i) => {
          const { x, y } = place(i, tributes.length);
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: Math.min(i * 0.08, 1.2), ease: [0.16, 1, 0.3, 1] }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <Link
                to={`/asthi-visarjan/star/${t.slug}`}
                aria-label={tr('starSky.starLinkAria', { name: t.name })}
                className="group flex flex-col items-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D9C6A1] rounded-full"
              >
                <span
                  className="relative rounded-full overflow-hidden border border-[#D9C6A1]/70 bg-[#3a4034] flex items-center justify-center transition-transform duration-500 group-hover:scale-125 group-focus-visible:scale-125"
                  style={{ width: size, height: size, boxShadow: '0 0 18px 4px rgba(217,198,161,0.32)' }}
                >
                  {t.photo_path ? (
                    <img src={photoUrl(t.photo_path)} alt={tr('starSky.photoAlt', { name: t.name })} loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <Star className="w-1/2 h-1/2 text-[#D9C6A1]" fill="currentColor" aria-hidden="true" />
                  )}
                </span>
                <span className="mt-2 max-w-[96px] text-center font-serif text-[12px] leading-tight text-ivory/90 truncate transition-colors group-hover:text-white">{t.name}</span>
              </Link>
            </motion.div>
          );
        })}

      {state.status !== 'ready' && (
        <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
          <p className="font-serif text-xl md:text-2xl text-ivory/80 leading-relaxed max-w-md">
            {state.status === 'loading' ? tr('starSky.loading') : tr('starSky.unavailable')}
          </p>
        </div>
      )}
      {state.status === 'ready' && tributes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
          <p className="font-serif text-xl md:text-2xl text-ivory/80 leading-relaxed max-w-md">{tr('starSky.empty')}</p>
        </div>
      )}
    </div>
  );
};

/** The whole "A star for them" section: heading, sky, and the gentle way to add a star. */
export const StarSky: React.FC<{ onOpenConcierge: () => void }> = ({ onOpenConcierge }) => {
  const { t } = useTranslation('components');
  const [state, setState] = useState<SkyState>({ status: 'loading' });
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    listApprovedTributes()
      .then((tributes) => alive && setState({ status: 'ready', tributes }))
      .catch((e) => {
        if (!(e instanceof SkyUnavailableError)) console.error(e);
        if (alive) setState({ status: 'unavailable' });
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section id="star" className="px-6 md:px-12 py-16 md:py-24 bg-ivory border-t border-gold/15">
      <div className="max-w-4xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="font-serif text-3xl md:text-5xl font-semibold text-deep-brown leading-tight">{t('starSky.heading')}</h2>
          <p className="mt-5 text-base md:text-lg text-charcoal/65 font-light leading-relaxed">
            {t('starSky.subheading')}
          </p>
        </div>

        <Sky state={state} />

        <div className="mt-10 text-center">
          {state.status === 'ready' && !formOpen && (
            <button
              onClick={() => setFormOpen(true)}
              className="text-xs uppercase tracking-[0.18em] font-semibold text-deep-brown border-b border-gold/60 pb-1 hover:text-gold transition-colors cursor-pointer"
            >
              {t('starSky.nameAStarCta')}
            </button>
          )}
          {state.status === 'unavailable' && (
            <p className="text-sm md:text-[15px] text-charcoal/60 font-light leading-relaxed max-w-md mx-auto">
              {t('starSky.unavailableNotice')}{' '}
              <button onClick={onOpenConcierge} className="underline decoration-gold/60 underline-offset-4 hover:text-gold transition-colors cursor-pointer">{t('starSky.writeToUs')}</button>.
            </p>
          )}
        </div>

        {state.status === 'ready' && formOpen && <NameAStar />}
      </div>
    </section>
  );
};

export default StarSky;
