import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { updatePageSEO } from '../utils/seo';

const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-70px' },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
};

const SectionHead: React.FC<{ n: string; title: string }> = ({ n, title }) => (
  <motion.div {...fade} className="mb-8 md:mb-10">
    <span className="block text-gold font-serif text-2xl md:text-3xl italic mb-2">{n}</span>
    <h2 className="font-serif text-3xl md:text-4xl font-semibold text-deep-brown leading-tight">{title}</h2>
    <span className="block w-12 h-px bg-gold/40 mt-6" />
  </motion.div>
);

const P: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.p {...fade} className="text-[17px] md:text-[19px] leading-[1.85] text-charcoal/85 font-light mb-6">
    {children}
  </motion.p>
);

const Pull: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.blockquote {...fade} className="my-12 md:my-14 pl-6 md:pl-8 border-l-2 border-gold/50">
    <p className="font-serif text-[22px] md:text-[28px] leading-[1.4] text-deep-brown font-medium">{children}</p>
  </motion.blockquote>
);

interface FaithQuoteScript {
  script?: string;
  lang: string;
  dir?: 'rtl';
}

// Original-language scripture scripts — these stay in their source script regardless of site language.
const FAITH_SCRIPTS: FaithQuoteScript[] = [
  { script: 'न जायते म्रियते वा कदाचित्', lang: 'sa' },
  { script: 'إِنَّا لِلَّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ', lang: 'ar', dir: 'rtl' },
  { script: 'Requiem æternam dona eis, Domine', lang: 'la' },
  { script: 'ਜੋਤੀ ਜੋਤਿ ਸਮਾਣਿਆ', lang: 'pa' },
  { script: 'सब्बे सङ्खारा अनिच्चा', lang: 'pi' },
  { script: 'परस्परोपग्रहो जीवानाम्', lang: 'sa' },
];

export const VisionView: React.FC = () => {
  const { t } = useTranslation('vision');

  useEffect(() => {
    updatePageSEO(
      t('seo.title'),
      t('seo.description')
    );
  }, [t]);

  const stats = t('sections.scale.stats', { returnObjects: true }) as { value: string; label: string }[];
  const tableRows = t('sections.market.table.rows', { returnObjects: true }) as [string, string][];
  const gapItems = t('sections.gap.items', { returnObjects: true }) as { heading: string; body: string }[];
  const faithQuotes = t('faiths.quotes', { returnObjects: true }) as { faith: string; line: string }[];
  const holdSelvesItems = t('holdSelves.items', { returnObjects: true }) as { heading: string; body: string }[];

  return (
    <div className="paper-light bg-ivory text-charcoal">

      {/* HERO */}
      <section className="pt-40 pb-16 md:pt-48 md:pb-20 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <span className="text-[11px] uppercase tracking-[0.32em] text-gold font-semibold block mb-8">{t('hero.eyebrow')}</span>
            <h1 className="font-serif text-4xl md:text-6xl font-semibold text-deep-brown leading-[1.08] mb-6">
              {t('hero.heading')}
            </h1>
            <p className="text-[11px] uppercase tracking-[0.28em] text-charcoal/55 font-semibold">{t('hero.byline')}</p>
          </motion.div>

          <span className="block w-16 h-px bg-gold/40 mx-auto mt-12" />
        </div>
      </section>

      {/* INTRO */}
      <section className="pb-8 px-6 md:px-12">
        <div className="max-w-2xl mx-auto">
          <P>{t('intro.paragraph1')}</P>
          <P>{t('intro.paragraph2')}</P>
          <P>{t('intro.paragraph3')}</P>
          <motion.p {...fade} className="font-serif text-xl md:text-2xl italic text-deep-brown/90 leading-relaxed my-8">{t('intro.pullout')}</motion.p>
        </div>
      </section>

      {/* SECTIONS */}
      <article className="px-6 md:px-12">
        <div className="max-w-2xl mx-auto space-y-20 md:space-y-28 pb-8">

          <section>
            <SectionHead n={t('sections.hour.number')} title={t('sections.hour.title')} />
            <P>{t('sections.hour.p1')}</P>
            <P>{t('sections.hour.p2')}</P>
            <Pull>{t('sections.hour.pull')}</Pull>
            <P>{t('sections.hour.p3')}</P>
          </section>

          <section>
            <SectionHead n={t('sections.scale.number')} title={t('sections.scale.title')} />
            <P>{t('sections.scale.p1')}</P>
            <Pull>{t('sections.scale.pull')}</Pull>
            <P>{t('sections.scale.p2')}</P>
            <P>{t('sections.scale.p3')}</P>
            <motion.div {...fade} className="grid grid-cols-3 gap-3 md:gap-8 mt-12 border-t border-gold/20 pt-10">
              {stats.map((s, i) => (
                <div key={i} className="text-center">
                  <div className="font-serif text-4xl md:text-6xl font-semibold text-deep-brown leading-none mb-3">{s.value}</div>
                  <div className="text-[9px] md:text-[11px] uppercase tracking-[0.14em] text-charcoal/55 font-semibold leading-snug">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </section>

          <section>
            <SectionHead n={t('sections.market.number')} title={t('sections.market.title')} />
            <P>{t('sections.market.p1')}</P>
            <P>{t('sections.market.p2')}</P>
            <P>{t('sections.market.p3')}</P>

            {/* MARKET TABLE */}
            <motion.div {...fade} className="my-12 border border-gold/20 rounded-sm overflow-hidden bg-white/50">
              <div className="grid grid-cols-2">
                <div className="px-5 py-4 md:px-7 md:py-5 border-b border-r border-gold/20 bg-blush/40">
                  <span className="text-[10px] md:text-[11px] uppercase tracking-[0.18em] text-gold font-bold">{t('sections.market.table.headerLeft')}</span>
                </div>
                <div className="px-5 py-4 md:px-7 md:py-5 border-b border-gold/20 bg-deep-brown">
                  <span className="text-[10px] md:text-[11px] uppercase tracking-[0.18em] text-ivory font-bold">{t('sections.market.table.headerRight')}</span>
                </div>
                {tableRows.map(([l, r], i) => (
                  <React.Fragment key={i}>
                    <div className="px-5 py-4 md:px-7 md:py-5 border-b border-r border-gold/12 text-[15px] md:text-base text-charcoal/70 font-light">{l}</div>
                    <div className="px-5 py-4 md:px-7 md:py-5 border-b border-gold/12 text-[15px] md:text-base text-deep-brown font-normal">{r}</div>
                  </React.Fragment>
                ))}
              </div>
              <p className="px-5 py-3 md:px-7 text-[12px] text-charcoal/50 italic">{t('sections.market.table.footnote')}</p>
            </motion.div>
          </section>

          <section>
            <SectionHead n={t('sections.gap.number')} title={t('sections.gap.title')} />
            <P>{t('sections.gap.intro')}</P>
            {gapItems.map((item, i) => (
              <motion.p {...fade} key={i} className="text-[17px] md:text-[19px] leading-[1.85] text-charcoal/85 font-light mb-6">
                <span className="text-deep-brown font-semibold">{item.heading}</span> {item.body}
              </motion.p>
            ))}
          </section>

          <section>
            <SectionHead n={t('sections.thesis.number')} title={t('sections.thesis.title')} />
            <motion.p {...fade} className="font-serif text-xl md:text-2xl italic text-deep-brown/90 leading-relaxed mb-8">{t('sections.thesis.pullout')}</motion.p>
            <P>{t('sections.thesis.p1')}</P>
            <P>{t('sections.thesis.p2')}</P>
            <P>{t('sections.thesis.p3')}</P>
            <P>{t('sections.thesis.p4')}</P>
          </section>

          <section>
            <SectionHead n={t('sections.tradition.number')} title={t('sections.tradition.title')} />
            <P>{t('sections.tradition.p1')}</P>
            <P>{t('sections.tradition.p2')}</P>
            <Pull>{t('sections.tradition.pull')}</Pull>
            <P>{t('sections.tradition.p3')}</P>
          </section>

          {/* INTERLUDE — Across every faith we serve */}
          <section className="paper-light -mx-6 md:-mx-12 px-6 md:px-12 py-16 md:py-20 bg-blush/40 border-y border-gold/15">
            <motion.div {...fade} className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-[11px] uppercase tracking-[0.3em] text-gold font-semibold block mb-4">{t('faiths.eyebrow')}</span>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-deep-brown leading-tight">{t('faiths.heading')}</h2>
              <p className="mt-5 text-[16px] md:text-[17px] text-charcoal/70 font-light leading-relaxed">{t('faiths.body')}</p>
            </motion.div>
            <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {faithQuotes.map((q, i) => {
                const script = FAITH_SCRIPTS[i];
                return (
                  <motion.div {...fade} key={i} className="text-center md:text-left">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-semibold block mb-3">{q.faith}</span>
                    {script?.script && (
                      <p className="font-serif text-lg md:text-xl text-deep-brown/90 mb-2" lang={script.lang} dir={script.dir}>{script.script}</p>
                    )}
                    <p className="font-serif italic text-[18px] md:text-xl leading-[1.5] text-deep-brown/90">&ldquo;{q.line}&rdquo;</p>
                  </motion.div>
                );
              })}
            </div>
          </section>

          <section>
            <SectionHead n={t('holdSelves.number')} title={t('holdSelves.title')} />
            <div className="space-y-6 md:space-y-7">
              {holdSelvesItems.map((item, i) => (
                <motion.div {...fade} key={i} className="flex gap-5">
                  <span className="font-serif text-2xl md:text-3xl text-gold/70 leading-none pt-1 w-8 shrink-0">{i + 1}</span>
                  <p className="text-[17px] md:text-[19px] leading-[1.8] text-charcoal/85 font-light">
                    <span className="text-deep-brown font-semibold">{item.heading}</span> {item.body}
                  </p>
                </motion.div>
              ))}
            </div>
            <P><span className="block mt-10" />{t('holdSelves.limits')}</P>
          </section>

          <section>
            <SectionHead n={t('decade.number')} title={t('decade.title')} />
            <P>{t('decade.p1')}</P>
            <P>{t('decade.p2')}</P>
            <P>{t('decade.p3')}</P>
            <P>{t('decade.p4')}</P>
            <P>{t('decade.p5')}</P>
            <motion.p {...fade} className="font-serif text-xl md:text-2xl italic text-deep-brown/90 leading-relaxed mt-10">{t('decade.closing')}</motion.p>
          </section>

        </div>
      </article>

      {/* SIGNATURE */}
      <section className="px-6 md:px-12 pb-8">
        <div className="max-w-2xl mx-auto border-t border-gold/20 pt-10 flex items-center gap-5">
          <img
            src="/assets/shaily-sharma-founder.jpg"
            alt={t('signature.imageAlt')}
            className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border border-gold/25 shadow-[0_8px_24px_rgba(58,54,47,0.12)] shrink-0"
          />
          <div>
            <p className="font-serif text-2xl md:text-3xl text-deep-brown mb-1">{t('signature.name')}</p>
            <p className="text-[11px] uppercase tracking-[0.24em] text-gold font-semibold">{t('signature.role')}</p>
          </div>
        </div>
      </section>

      {/* NOTES */}
      <section className="px-6 md:px-12 pb-24 md:pb-32">
        <div className="max-w-2xl mx-auto space-y-8 text-charcoal/60">
          <div>
            <h3 className="text-[11px] uppercase tracking-[0.24em] text-gold font-semibold mb-3">{t('notes.thanks.heading')}</h3>
            <p className="text-sm md:text-[15px] leading-relaxed font-light italic">{t('notes.thanks.body')}</p>
          </div>
          <div>
            <h3 className="text-[11px] uppercase tracking-[0.24em] text-gold font-semibold mb-3">{t('notes.evidence.heading')}</h3>
            <p className="text-sm md:text-[15px] leading-relaxed font-light">{t('notes.evidence.body')}</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 pb-28 md:pb-36 text-center">
        <Link to="/services" className="inline-flex items-center gap-3 px-8 py-4 bg-gold text-ivory font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-deep-brown transition-all duration-300 group">
          <span>{t('cta.label')}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </section>

    </div>
  );
};

export default VisionView;
