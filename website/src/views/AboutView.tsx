import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeartHandshake, ShieldCheck, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { updatePageSEO } from '../utils/seo';
import { Verse } from '../components/Verse';

export const AboutView: React.FC = () => {
  const { t } = useTranslation('about');

  useEffect(() => {
    updatePageSEO(
      t('seo.title'),
      t('seo.description')
    );
  }, [t]);

  const handsItems = t('hands.items', { returnObjects: true }) as { title: string; description: string }[];
  const icons = [Building2, ShieldCheck, HeartHandshake];

  return (
    <div className="bg-ivory text-charcoal">

      {/* 1. HERO — the founding truth */}
      <section className="pt-40 pb-20 md:pt-48 md:pb-28 px-6 md:px-12 bg-ivory overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <div className="inline-flex items-center gap-3 mb-6">
              <span className="w-10 h-[1px] bg-gold/60 inline-block"></span>
              <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold">{t('hero.eyebrow')}</span>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-semibold text-deep-brown leading-[1.1] mb-7">
              {t('hero.heading')}
            </h1>
            <p className="text-base md:text-lg text-charcoal/75 font-light leading-relaxed mb-5">
              {t('hero.paragraph1')}
            </p>
            <p className="text-base md:text-lg text-charcoal/75 font-light leading-relaxed">
              {t('hero.paragraph2')}
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="relative">
            <div className="rounded-sm overflow-hidden shadow-[0_20px_60px_rgba(58,54,47,0.10)]">
              <img src="/assets/about_eternal_care.jpg" alt={t('hero.imageAlt')} className="w-full h-auto block object-cover" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. PULL QUOTE */}
      <section className="py-24 md:py-36 px-6 md:px-12 bg-deep-brown text-ivory text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="max-w-4xl mx-auto">
          <blockquote className="font-serif text-3xl md:text-5xl font-light italic leading-[1.25] text-ivory">
            {t('pullQuote.quote')}
          </blockquote>
          <span className="text-[11px] uppercase tracking-[0.3em] text-gold font-semibold block pt-8">{t('pullQuote.attr')}</span>
        </motion.div>
      </section>

      {/* 3. VISION & MISSION */}
      <section className="py-24 md:py-36 px-6 md:px-12 bg-ivory">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
            <span className="text-[11px] uppercase tracking-[0.24em] text-gold font-semibold block mb-4">{t('visionMission.vision.eyebrow')}</span>
            <div className="w-10 h-[1.5px] bg-gold/60 mb-6"></div>
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-deep-brown mb-4 leading-snug">{t('visionMission.vision.heading')}</h2>
            <p className="text-base text-charcoal/70 font-light leading-relaxed">{t('visionMission.vision.body')}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}>
            <span className="text-[11px] uppercase tracking-[0.24em] text-gold font-semibold block mb-4">{t('visionMission.mission.eyebrow')}</span>
            <div className="w-10 h-[1.5px] bg-gold/60 mb-6"></div>
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-deep-brown mb-4 leading-snug">{t('visionMission.mission.heading')}</h2>
            <p className="text-base text-charcoal/70 font-light leading-relaxed">{t('visionMission.mission.body')}</p>
          </motion.div>
        </div>
      </section>

      {/* 4. THE HANDS BEHIND THE CARE */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-blush/30">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
            <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold block mb-4">{t('hands.eyebrow')}</span>
            <h2 className="font-serif text-3xl md:text-5xl font-semibold text-deep-brown leading-tight">{t('hands.heading')}</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14">
            {handsItems.map((s, i) => {
              const Icon = icons[i];
              return (
                <motion.div key={s.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }} className="text-center md:text-left group">
                  <div className="w-14 h-14 rounded-full border border-gold/40 flex items-center justify-center text-gold mb-6 mx-auto md:mx-0 transition-all duration-300 group-hover:bg-gold group-hover:text-ivory">
                    <Icon className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-serif text-xl md:text-2xl text-deep-brown mb-3">{s.title}</h3>
                  <p className="text-sm md:text-base text-charcoal/70 font-light leading-relaxed">{s.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <Verse text={t('verse.text')} attr={t('verse.attr')} />
    </div>
  );
};

export default AboutView;
