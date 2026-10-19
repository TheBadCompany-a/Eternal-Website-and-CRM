import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ETNOW_AWARD, isAwardPublishable } from '../data/awards';

// Quiet, below-the-fold recognition — reassurance, not triumph.
export const AwardBand: React.FC = () => {
  const { t } = useTranslation('components');
  const a = ETNOW_AWARD;
  if (!isAwardPublishable(a, new Date())) return null;

  return (
    <section className="px-6 md:px-12 py-14 md:py-16 bg-ivory border-t border-gold/10">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 bg-white border border-gold/15 rounded-sm px-7 py-7 md:px-10 md:py-8 shadow-[0_10px_40px_rgba(58,54,47,0.06)]">
          {/* Lockup on a solid white card in every theme */}
          <div className="shrink-0 bg-white rounded-xs flex items-center justify-center px-3 py-2">
            <img
              src={a.logo}
              alt={`${a.presenter} — ${a.event}, ${a.edition}`}
              className="h-14 md:h-[72px] w-auto object-contain"
              loading="lazy"
            />
          </div>
          <div className="text-center md:text-left">
            <span className="text-[11px] uppercase tracking-[0.24em] text-gold font-semibold block mb-2">{t('awardBand.kicker')}</span>
            <p className="font-serif text-[17px] md:text-xl text-deep-brown/90 leading-relaxed">
              {t('awardBand.recognitionPrefix', { presenter: a.presenter })} <span className="italic">{a.title}</span> {t('awardBand.recognitionSuffix')}
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 justify-center md:justify-start">
              {a.noteHref && (
                <Link to={a.noteHref} className="py-2 text-[12px] uppercase tracking-wider font-semibold text-gold hover:text-deep-brown inline-flex items-center gap-1 transition-colors">
                  {t('awardBand.readNote')} <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              )}
              <a href={a.url} target="_blank" rel="noreferrer" className="py-2 text-[11px] text-charcoal/45 hover:text-charcoal/70 inline-flex items-center gap-1 transition-colors">
                {a.presenter}, {a.edition}, {t('awardBand.dateSuffix')} <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default AwardBand;
