import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PhoneCall, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { updatePageSEO } from '../utils/seo';

interface AsthiVisarjanViewProps {
  onOpenConcierge: () => void;
}

interface StepItem { title: string; text: string }

const fade = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
};

export const AsthiVisarjanView: React.FC<AsthiVisarjanViewProps> = ({ onOpenConcierge }) => {
  const { t, i18n } = useTranslation('asthiVisarjan');
  const STEPS = t('steps.items', { returnObjects: true }) as StepItem[];

  useEffect(() => {
    updatePageSEO(t('seo.title'), t('seo.description'));
  }, [t]);

  return (
    <div className="pt-28 bg-ivory text-charcoal">
      {/* Breadcrumb Navigation */}
      <div className="max-w-4xl mx-auto px-6 pt-6 flex items-center gap-2 text-xs text-charcoal/60 tracking-wider uppercase">
        <Link to="/" className="py-1 hover:text-gold transition-colors">{t('breadcrumb.home')}</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gold" />
        <Link to="/services" className="py-1 hover:text-gold transition-colors">{t('breadcrumb.services')}</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gold" />
        <Link to="/services/empathic-care-keepsakes" className="py-1 hover:text-gold transition-colors">{t('breadcrumb.familySupport')}</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gold" />
        <span className="text-gold font-semibold truncate">{t('breadcrumb.current')}</span>
      </div>

      {/* Opening */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blush/60 via-ivory to-ivory px-6 md:px-12 pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="pointer-events-none absolute right-[-80px] top-1/2 -translate-y-1/2 w-[420px] h-[420px] opacity-[0.05] bg-[url('/assets/logo-emblem-sage.png')] bg-center bg-contain bg-no-repeat" aria-hidden="true" />
        <div className="relative max-w-2xl mx-auto text-center">
          <motion.div {...fade}>
            <h1 className="font-serif text-5xl md:text-7xl font-semibold text-deep-brown leading-[1.05]">{t('hero.heading')}</h1>
            <p lang={i18n.language === 'hi' ? 'en' : 'hi'} className="mt-3 text-xl md:text-2xl text-deep-brown/55 font-light">{t('hero.gloss')}</p>
            <p className="mt-9 text-lg md:text-2xl text-charcoal/75 font-light leading-relaxed">
              {t('hero.body')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* What it is */}
      <section className="px-6 md:px-12 pb-16 md:pb-24">
        <motion.p {...fade} className="max-w-xl mx-auto text-center text-base md:text-lg text-charcoal/70 font-light leading-[1.9]">
          <em>{t('whatItIs.asthiTerm')}</em> {t('whatItIs.asthiDef')} <em>{t('whatItIs.visarjanTerm')}</em> {t('whatItIs.visarjanDef')}{' '}
          {t('whatItIs.body')}
        </motion.p>
      </section>

      {/* How it unfolds */}
      <section className="px-6 md:px-12 pb-16 md:pb-24">
        <div className="max-w-xl mx-auto">
          <ol className="relative space-y-9">
            <span className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-gold/0 via-gold/35 to-gold/0" aria-hidden="true" />
            {STEPS.map((s, i) => (
              <motion.li key={s.title} {...fade} className="relative flex gap-6">
                <span className="relative z-10 shrink-0 w-8 h-8 rounded-full bg-ivory border border-gold/45 text-gold font-serif text-base flex items-center justify-center">{i + 1}</span>
                <div>
                  <h2 className="font-serif text-2xl text-deep-brown leading-tight">{s.title}</h2>
                  <p className="mt-1 text-[15px] md:text-base text-charcoal/65 font-light leading-relaxed">{s.text}</p>
                </div>
              </motion.li>
            ))}
          </ol>
          <motion.p {...fade} className="mt-12 text-center text-sm md:text-[15px] text-charcoal/55 font-light italic leading-relaxed">
            {t('steps.note')}
          </motion.p>
        </div>
      </section>


      {/* A gentle close */}
      <section className="px-6 md:px-12 py-16 md:py-20 bg-blush/40 border-t border-gold/15">
        <motion.div {...fade} className="max-w-xl mx-auto text-center">
          <p className="font-serif text-2xl md:text-3xl text-deep-brown leading-relaxed">
            {t('close.body')}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-x-8 gap-y-4">
            <button onClick={onOpenConcierge} className="text-xs uppercase tracking-[0.18em] font-semibold text-deep-brown border-b border-gold/60 py-2.5 hover:text-gold transition-colors cursor-pointer">
              {t('close.writeToUs')}
            </button>
            <a href="tel:+918448661338" className="inline-flex items-center gap-2 py-2.5 text-sm text-charcoal/70 hover:text-gold transition-colors">
              <PhoneCall className="w-4 h-4" aria-hidden="true" />
              +91 84486 61338
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default AsthiVisarjanView;
