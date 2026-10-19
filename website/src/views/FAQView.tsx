import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { updatePageSEO, setStructuredData, clearStructuredData } from '../utils/seo';

interface QA {
  q: string;
  a: string;
}

const FAQ_ITEM_KEYS = ['item1', 'item2', 'item3', 'item4', 'item5', 'item6', 'item7'] as const;

const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-70px' },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
};

export const FAQView: React.FC = () => {
  const { t } = useTranslation('faq');

  // Plain-text answers double as the source for FAQPage structured data,
  // so they are kept concise and self-contained (snippet-ready).
  const FAQS: QA[] = FAQ_ITEM_KEYS.map((key) => ({
    q: t(`page.items.${key}.q`),
    a: t(`page.items.${key}.a`),
  }));

  useEffect(() => {
    updatePageSEO(
      t('page.seo.title'),
      t('page.seo.description')
    );
    setStructuredData('faq', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQS.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
    return () => clearStructuredData('faq');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="paper-light bg-ivory text-charcoal">
      <section className="pt-40 pb-10 md:pt-48 md:pb-12 px-6 md:px-12">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <span className="text-[11px] uppercase tracking-[0.32em] text-gold font-semibold block mb-6">{t('page.hero.kicker')}</span>
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-deep-brown leading-[1.1] mb-5">{t('page.hero.title')}</h1>
            <p className="font-serif italic text-base md:text-lg text-charcoal/65">{t('page.hero.subtitle')}</p>
          </motion.div>
          <span className="block w-16 h-px bg-gold/40 mx-auto mt-10" />
        </div>
      </section>

      <section className="px-6 md:px-12 pb-20">
        <div className="max-w-2xl mx-auto divide-y divide-gold/15">
          {FAQS.map((f, i) => (
            <motion.div key={i} {...fade} className="py-7">
              <h2 className="font-serif text-xl md:text-2xl text-deep-brown mb-3 leading-snug">{f.q}</h2>
              <p className="text-[16px] md:text-[17px] leading-[1.8] text-charcoal/85 font-light">{f.a}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-12 pb-24 md:pb-32">
        <div className="max-w-2xl mx-auto text-center border-t border-gold/20 pt-12">
          <p className="font-serif text-2xl md:text-3xl text-deep-brown mb-6">{t('page.cta.question')}</p>
          <Link to="/contact" className="inline-flex items-center gap-3 px-8 py-4 bg-gold text-ivory font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-deep-brown transition-all duration-300 group">
            <span>{t('page.cta.button')}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default FAQView;
