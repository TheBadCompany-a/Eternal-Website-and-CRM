import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { updatePageSEO, setRobotsMeta } from '../utils/seo';

export const NotFoundView: React.FC = () => {
  const { t } = useTranslation('notFound');

  useEffect(() => {
    updatePageSEO(t('seo.title'), t('seo.description'));
    setRobotsMeta('noindex, follow');
    return () => setRobotsMeta(null);
  }, [t]);

  return (
    <div className="paper-light bg-ivory text-charcoal min-h-[80vh] flex items-center">
      <section className="pt-40 pb-24 md:pt-48 md:pb-32 px-6 md:px-12 w-full">
        <div className="max-w-xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <span className="text-[11px] uppercase tracking-[0.32em] text-gold font-semibold block mb-6">{t('eyebrow')}</span>
            <h1 className="font-serif text-5xl md:text-6xl font-semibold text-deep-brown leading-[1.1] mb-5">{t('code')}</h1>
            <p className="text-[17px] md:text-[19px] leading-[1.85] text-charcoal/70 font-light mb-10">
              {t('body')}
            </p>
          </motion.div>
          <span className="block w-16 h-px bg-gold/40 mx-auto mb-10" />
          <Link to="/" className="inline-flex items-center gap-3 px-8 py-4 bg-gold text-ivory font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-deep-brown transition-all duration-300 group">
            <span>{t('returnHome')}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default NotFoundView;
