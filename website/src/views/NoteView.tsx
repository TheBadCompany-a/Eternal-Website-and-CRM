import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { updatePageSEO } from '../utils/seo';
import { ETNOW_AWARD } from '../data/awards';

const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-70px' },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
};

const P: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.p {...fade} className="text-[17px] md:text-[19px] leading-[1.85] text-charcoal/85 font-light mb-6">{children}</motion.p>
);

export const NoteView: React.FC = () => {
  const { t } = useTranslation('note');

  useEffect(() => {
    updatePageSEO(t('seo.title'), t('seo.description'));
  }, [t]);
  const a = ETNOW_AWARD;

  return (
    <div className="paper-light bg-ivory text-charcoal">
      <section className="pt-40 pb-10 md:pt-48 md:pb-12 px-6 md:px-12">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <span className="text-[11px] uppercase tracking-[0.32em] text-gold font-semibold block mb-6">{t('hero.eyebrow')}</span>
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-deep-brown leading-[1.1] mb-5">{t('hero.heading')}</h1>
            <p className="font-serif italic text-base md:text-lg text-charcoal/65">{t('hero.subheading')}</p>
          </motion.div>
          <span className="block w-16 h-px bg-gold/40 mx-auto mt-10" />
        </div>
      </section>

      <article className="px-6 md:px-12 pb-4">
        <div className="max-w-2xl mx-auto">
          <P>{t('article.p1')}</P>
          <P>{t('article.p2Before')}<span className="italic">{t('article.p2Italic')}</span>{t('article.p2After')}</P>
          <P>{t('article.p3')}</P>
          <P>{t('article.p4')}</P>
          <P>{t('article.p5a')} <span className="italic">{t('article.p5CaredWord')}</span>, {t('article.p5Middle')} <span className="italic">{t('article.p5ServedWord')}</span>. {t('article.p5b')}</P>
          <motion.p {...fade} className="font-serif text-xl md:text-2xl italic text-deep-brown/90 leading-relaxed my-8">{t('article.pullQuote')}</motion.p>
          <P>{t('article.p6')}</P>
          <P>{t('article.p7')}</P>
          <P>{t('article.p8')}</P>
          <P>{t('article.p9')}</P>
          <P>{t('article.p10')}</P>
        </div>
      </article>

      {/* Signature */}
      <section className="px-6 md:px-12 pb-10">
        <div className="max-w-2xl mx-auto border-t border-gold/20 pt-8">
          <p className="font-serif text-2xl md:text-3xl text-deep-brown mb-1">{t('signature.name')}</p>
          <p className="text-[11px] uppercase tracking-[0.24em] text-gold font-semibold">{t('signature.title')}</p>
        </div>
      </section>

      {/* Recognition lockup + source */}
      <section className="px-6 md:px-12 pb-24 md:pb-32">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-5 bg-white border border-gold/15 rounded-sm px-7 py-6 shadow-[0_10px_40px_rgba(58,54,47,0.05)]">
            <div className="shrink-0 bg-white rounded-xs flex items-center justify-center px-3 py-2">
              <img src={a.logo} alt={`${a.presenter} — ${a.event}, ${a.edition}`} className="h-12 md:h-14 w-auto object-contain" loading="lazy" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-[13px] text-charcoal/75 leading-relaxed">{t('recognition.recognisedForBefore')} <span className="italic">{a.title}</span> {t('recognition.recognisedForAfter', { event: a.event, edition: a.edition })}</p>
              <a href={a.url} target="_blank" rel="noreferrer" className="text-[11px] uppercase tracking-wider font-semibold text-gold hover:text-deep-brown inline-flex items-center gap-1 mt-1.5">{t('recognition.readAnnouncement')} <ArrowUpRight className="w-3.5 h-3.5" /></a>
            </div>
          </div>
          {/* A moment from the evening — quiet, opt-in, no autoplay */}
          <figure className="mt-8">
            <div className="rounded-sm overflow-hidden border border-gold/15 bg-black shadow-[0_10px_40px_rgba(58,54,47,0.06)]">
              <video
                className="w-full h-auto block"
                controls
                preload="none"
                playsInline
                poster="/assets/etnow-conclave-2026-poster.jpg"
              >
                <source src="/assets/etnow-conclave-2026.mp4" type="video/mp4" />
              </video>
            </div>
            <figcaption className="text-center text-[12px] text-charcoal/55 mt-3">{t('recognition.videoCaption', { event: a.event, edition: a.edition })}</figcaption>
          </figure>

          <div className="text-center mt-12">
            <Link to="/contact" className="inline-flex items-center gap-3 px-8 py-4 bg-gold text-ivory font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-deep-brown transition-all duration-300 group">
              <span>{t('recognition.talkToUs')}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NoteView;
