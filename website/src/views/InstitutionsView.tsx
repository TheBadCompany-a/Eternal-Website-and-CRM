import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, ArrowRight, Stethoscope, Building2, Landmark, Users, Clock, HeartHandshake, ShieldCheck, PhoneCall } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { updatePageSEO } from '../utils/seo';
import { Verse } from '../components/Verse';

interface InstitutionsViewProps {
  onOpenConcierge: () => void;
}

export const InstitutionsView: React.FC<InstitutionsViewProps> = ({ onOpenConcierge }) => {
  const { t } = useTranslation('institutions');

  useEffect(() => {
    updatePageSEO(
      t('seo.title'),
      t('seo.description')
    );
  }, [t]);

  const sectorIcons = [Stethoscope, Building2, Landmark, Users];
  const sectorItems = t('sectors.items', { returnObjects: true }) as { title: string; description: string }[];
  const sectors = sectorItems.map((item, i) => ({ Icon: sectorIcons[i], t: item.title, d: item.description }));

  const promiseIcons = [Clock, HeartHandshake, ShieldCheck, PhoneCall];
  const promiseItems = t('promises.items', { returnObjects: true }) as { title: string; description: string }[];
  const promises = promiseItems.map((item, i) => ({ Icon: promiseIcons[i], t: item.title, d: item.description }));

  return (
    <div className="bg-ivory text-charcoal">

      {/* 1. HERO */}
      <section className="pt-40 pb-20 md:pt-48 md:pb-28 px-6 md:px-12 bg-ivory text-center">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="w-10 h-[1px] bg-gold/60 inline-block"></span>
            <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold">{t('hero.eyebrow')}</span>
            <span className="w-10 h-[1px] bg-gold/60 inline-block"></span>
          </div>
          <h1 className="font-serif text-4xl md:text-6xl font-semibold text-deep-brown leading-[1.1] mb-6">
            {t('hero.heading')}
          </h1>
          <p className="text-base md:text-xl text-charcoal/75 font-light leading-relaxed max-w-2xl mx-auto mb-10">
            {t('hero.body')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={onOpenConcierge} className="w-full sm:w-auto px-8 py-4 bg-gold text-ivory text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-deep-brown transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer">
              <span>{t('hero.ctaArrange')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="/downloads/Eternal-Repos-Hospital-Partnership.pdf"
              download="Eternal-Repos-Hospital-Partnership.pdf" className="w-full sm:w-auto px-8 py-4 bg-white border border-gold/50 text-deep-brown text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-blush transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-gold" />
              <span>{t('hero.ctaDownload')}</span>
            </a>
          </div>
        </motion.div>
      </section>

      {/* 2. WHO WE PARTNER WITH */}
      <section className="py-24 md:py-36 px-6 md:px-12 bg-blush/30">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="max-w-2xl mb-16 md:mb-20">
            <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold block mb-4">{t('sectors.eyebrow')}</span>
            <h2 className="font-serif text-3xl md:text-5xl font-semibold text-deep-brown leading-[1.15]">{t('sectors.heading')}</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 md:gap-y-14">
            {sectors.map((s, i) => (
              <motion.div key={s.t} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }} className="flex items-start gap-5 group">
                <div className="w-12 h-12 rounded-full border border-gold/40 flex items-center justify-center text-gold shrink-0 transition-all duration-300 group-hover:bg-gold group-hover:text-ivory">
                  <s.Icon className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-serif text-xl md:text-2xl text-deep-brown mb-2 leading-snug">{s.t}</h3>
                  <p className="text-sm md:text-base text-charcoal/70 font-light leading-relaxed">{s.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. HOW WE SHOW UP */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-ivory">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
            <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold block mb-4">{t('promises.eyebrow')}</span>
            <h2 className="font-serif text-3xl md:text-5xl font-semibold text-deep-brown leading-tight">{t('promises.heading')}</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">
            {promises.map((p, i) => (
              <motion.div key={p.t} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }} className="text-center md:text-left group">
                <div className="w-12 h-12 rounded-full border border-gold/40 flex items-center justify-center text-gold mb-5 mx-auto md:mx-0 transition-all duration-300 group-hover:bg-gold group-hover:text-ivory">
                  <p.Icon className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-lg md:text-xl text-deep-brown mb-2 leading-snug">{p.t}</h3>
                <p className="text-sm text-charcoal/70 font-light leading-relaxed">{p.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. GENTLE CLOSE & CONTACT */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-blush/40 border-t border-gold/15 text-center">
        <div className="max-w-xl mx-auto space-y-4">
          <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold block">
            {t('close.eyebrow')}
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-deep-brown">
            {t('close.heading')}
          </h2>
          <p className="text-sm md:text-base text-charcoal/75 font-light leading-relaxed max-w-md mx-auto">
            {t('close.body')}
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-x-8 gap-y-4">
            <button
              onClick={onOpenConcierge}
              className="px-8 py-3.5 bg-gold text-ivory text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-deep-brown transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>{t('close.ctaArrange')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="tel:+918448661338"
              className="inline-flex items-center gap-2 py-2.5 text-sm font-semibold text-deep-brown hover:text-gold transition-colors"
            >
              <PhoneCall className="w-4 h-4 text-gold" aria-hidden="true" />
              <span>{t('close.phoneLabel')}</span>
            </a>
          </div>
        </div>
      </section>
      <Verse text={t('verse.text')} attr={t('verse.attr')} />
    </div>
  );
};

export default InstitutionsView;
