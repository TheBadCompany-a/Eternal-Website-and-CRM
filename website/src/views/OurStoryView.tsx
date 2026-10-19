import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { updatePageSEO } from '../utils/seo';
import { Verse } from '../components/Verse';

export const OurStoryView: React.FC = () => {
  const { t } = useTranslation('ourStory');

  useEffect(() => {
    updatePageSEO(
      t('seo.title'),
      t('seo.description')
    );
  }, [t]);

  const promises = t('promise.items', { returnObjects: true }) as string[];

  return (
    <div className="pt-36 md:pt-44 pb-0 bg-ivory text-charcoal">
      {/* 1. NARRATIVE HERO STORY SECTION */}
      <section className="py-16 md:py-24 px-6 md:px-12 bg-ivory">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 space-y-3"
          >
            <span className="text-[11px] uppercase tracking-[0.25em] text-gold font-semibold block">
              {t('hero.eyebrow')}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-deep-brown leading-tight">
              {t('hero.heading')}
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-6 text-charcoal/85 text-base md:text-lg font-light leading-relaxed bg-white border border-gold/15 p-8 sm:p-12 md:p-16 rounded-sm shadow-[0_20px_60px_rgba(58,54,47,0.06)]"
          >
            <p className="font-serif text-xl sm:text-2xl text-deep-brown leading-relaxed">
              {t('narrative.opening')}
            </p>

            <p>
              {t('narrative.paragraph1')}
            </p>

            <p>
              {t('narrative.paragraph2')}
            </p>

            <p>
              {t('narrative.paragraph3')}
            </p>

            <p>
              {t('narrative.paragraph4')}
            </p>

            <p className="font-serif text-lg sm:text-xl text-deep-brown italic">
              {t('narrative.stayedWithUs')}
            </p>

            <div className="py-8 px-6 sm:px-10 text-center my-8 border-y border-gold/30 space-y-3 bg-blush/30 rounded-xs">
              <span className="text-[11px] uppercase tracking-[0.25em] text-gold font-semibold block">
                {t('narrative.questionPrompt.eyebrow')}
              </span>
              <p className="font-serif italic text-xl sm:text-2xl md:text-3xl text-deep-brown leading-snug">
                {t('narrative.questionPrompt.quote')}
              </p>
              <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold pt-1">
                {t('narrative.questionPrompt.caption')}
              </p>
            </div>

            <p>
              {t('narrative.paragraph5')}
            </p>

            <p>
              {t('narrative.paragraph6')}
            </p>

            <p className="font-serif text-lg sm:text-xl text-deep-brown">
              {t('narrative.roleIntro')}
            </p>

            <div className="my-6 p-6 sm:p-8 bg-blush/40 border-l-2 border-gold rounded-r-xs space-y-4">
              <p className="font-serif text-lg sm:text-xl text-deep-brown italic">
                {t('narrative.responsibilities.intro')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-white/90 border border-gold/20 p-4 rounded-xs">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-semibold block mb-1">{t('narrative.responsibilities.honour.label')}</span>
                  <p className="font-serif text-base sm:text-lg font-semibold text-deep-brown">{t('narrative.responsibilities.honour.value')}</p>
                </div>
                <div className="bg-white/90 border border-gold/20 p-4 rounded-xs">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-semibold block mb-1">{t('narrative.responsibilities.support.label')}</span>
                  <p className="font-serif text-base sm:text-lg font-semibold text-deep-brown">{t('narrative.responsibilities.support.value')}</p>
                </div>
              </div>
            </div>

            <p>
              {t('narrative.paragraph7')}
            </p>

            <p>
              {t('narrative.paragraph8')}
            </p>

            <blockquote className="my-6 pl-6 border-l-2 border-gold italic text-deep-brown font-serif text-xl sm:text-2xl bg-blush/60 py-4 pr-4 rounded-r-xs font-semibold">
              {t('narrative.quote')}
            </blockquote>

            <p className="font-serif text-lg sm:text-xl text-deep-brown">
              {t('narrative.paragraph9')}
            </p>

            <div className="mt-12 pt-8 border-t border-gold/30 text-center">
              <p className="font-serif text-xl md:text-2xl font-bold text-deep-brown tracking-wide leading-snug">
                {t('narrative.closing')}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. OUR PROMISE SECTION */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-blush/30 border-t border-gold/20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 space-y-2"
          >
            <span className="text-[11px] uppercase tracking-[0.25em] text-gold font-semibold block">
              {t('promise.eyebrow')}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-deep-brown">
              {t('promise.heading')}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {promises.map((promise, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`p-6 bg-white border border-gold/20 rounded-xs shadow-xs flex items-start gap-4 eternal-card ${
                  index === 4 ? 'md:col-span-2 md:max-w-xl md:mx-auto w-full' : ''
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-blush flex items-center justify-center shrink-0 border border-gold/30 mt-0.5 text-gold">
                  <CheckCircle2 className="w-5 h-5 text-gold" />
                </div>
                <p className="font-serif text-lg text-deep-brown font-semibold leading-snug pt-1">
                  {promise}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Verse text={t('verse.text')} attr={t('verse.attr')} />
    </div>
  );
};

export default OurStoryView;
