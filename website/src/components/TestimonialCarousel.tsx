import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Testimonial } from '../data/testimonials';

type Item = Testimonial & { i: number };

// One testimonial at a time, auto-advancing, with arrows and dots.
export const TestimonialCarousel: React.FC<{ items: Item[] }> = ({ items }) => {
  const { t } = useTranslation('home');
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = items.length;
  const go = (d: number) => setIdx((p) => (p + d + n) % n);

  useEffect(() => {
    if (paused || n < 2) return;
    const id = setInterval(() => setIdx((p) => (p + 1) % n), 7000);
    return () => clearInterval(id);
  }, [paused, n]);

  if (!n) return null;
  const s = items[idx];
  const initials = s.n.replace(/Dr\.\s*/, '').split(' ').map((w) => w[0]).join('').slice(0, 2);

  return (
    <div
      className="relative max-w-3xl mx-auto"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative bg-white border border-gold/12 rounded-sm px-8 md:px-16 py-12 md:py-16 shadow-[0_10px_40px_rgba(58,54,47,0.05)] min-h-[360px] md:min-h-[340px] flex items-center">
        <AnimatePresence mode="wait">
          <motion.figure
            key={idx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full text-center"
          >
            <span className="font-serif text-6xl text-gold/40 leading-none block mb-2" aria-hidden="true">&ldquo;</span>
            <blockquote className="font-serif text-xl md:text-2xl italic text-charcoal/85 leading-relaxed">
              {t(`testimonials.items.${s.i}.quote`, { defaultValue: s.q })}
            </blockquote>
            <figcaption className="mt-8 flex items-center justify-center gap-3.5">
              <span className="w-11 h-11 rounded-full bg-blush border border-gold/25 flex items-center justify-center font-serif text-gold text-sm shrink-0" aria-hidden="true">
                {s.story && !s.n ? <Heart className="w-4 h-4" /> : initials}
              </span>
              <span className="text-left">
                <span className="font-serif text-base text-deep-brown block">
                  {s.story ? (s.n || t('testimonials.storyTag', { defaultValue: 'A story of care' })) : t(`testimonials.items.${s.i}.name`, { defaultValue: s.n })}
                </span>
                <span className="text-[11px] text-gold/90 uppercase tracking-wider">
                  {s.story ? t('testimonials.storyTag', { defaultValue: 'A story of care' }) : t('testimonials.captionTag')}
                </span>
              </span>
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>

      <button
        onClick={() => go(-1)}
        aria-label="Previous testimonial"
        className="absolute left-2 md:-left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white border border-gold/20 flex items-center justify-center text-deep-brown hover:bg-blush transition-colors cursor-pointer shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => go(1)}
        aria-label="Next testimonial"
        className="absolute right-2 md:-right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white border border-gold/20 flex items-center justify-center text-deep-brown hover:bg-blush transition-colors cursor-pointer shadow-sm"
      >
        <ArrowRight className="w-4 h-4" />
      </button>

      <div className="flex items-center justify-center gap-2 mt-8">
        {items.map((_, d) => (
          <button
            key={d}
            onClick={() => setIdx(d)}
            aria-label={`Testimonial ${d + 1}`}
            className="p-2 -m-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-gold rounded-full"
          >
            <span className={`block h-1.5 rounded-full transition-all duration-300 ${d === idx ? 'w-8 bg-gold' : 'w-1.5 bg-deep-brown/20 hover:bg-deep-brown/40'}`} />
          </button>
        ))}
      </div>
    </div>
  );
};
