import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { updatePageSEO } from '../utils/seo';
import { getApprovedTribute, photoUrl, type Tribute } from '../utils/tributes';

type Load = { status: 'loading' } | { status: 'missing' } | { status: 'ready'; tribute: Tribute };

export const StarTributeView: React.FC = () => {
  const { t } = useTranslation('starTribute');
  const { slug = '' } = useParams();
  const [load, setLoad] = useState<Load>({ status: 'loading' });

  useEffect(() => {
    let alive = true;
    setLoad({ status: 'loading' });
    getApprovedTribute(slug)
      .then((t) => alive && setLoad(t ? { status: 'ready', tribute: t } : { status: 'missing' }))
      .catch(() => alive && setLoad({ status: 'missing' }));
    return () => {
      alive = false;
    };
  }, [slug]);

  // Tributes are personal: keep them out of search engines.
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    updatePageSEO(
      load.status === 'ready' ? t('seo.titleReady', { name: load.tribute.name }) : t('seo.titleDefault'),
      t('seo.description')
    );
  }, [load, t]);

  const tr = load.status === 'ready' ? load.tribute : null;
  const years = tr && (tr.born_year || tr.passed_year) ? [tr.born_year, tr.passed_year].filter(Boolean).join(' – ') : '';

  return (
    <div
      className="min-h-screen pt-32 pb-24 px-6 text-ivory"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #3a4034 0%, #262a22 50%, #171914 100%)' }}
    >
      <div className="max-w-xl mx-auto text-center">
        {load.status === 'loading' && <p className="font-serif text-xl text-ivory/70">{t('loading')}</p>}

        {load.status === 'missing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Star className="w-8 h-8 mx-auto text-[#D9C6A1]" aria-hidden="true" />
            <h1 className="mt-6 font-serif text-3xl md:text-4xl">{t('missing.heading')}</h1>
            <p className="mt-4 text-ivory/65 font-light">{t('missing.body')}</p>
          </motion.div>
        )}

        {tr && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
            <span
              className="mx-auto w-44 h-44 md:w-56 md:h-56 rounded-full overflow-hidden border border-[#D9C6A1]/70 flex items-center justify-center bg-[#3a4034]"
              style={{ boxShadow: '0 0 40px 12px rgba(217,198,161,0.28)' }}
            >
              {tr.photo_path ? (
                <img src={photoUrl(tr.photo_path)} alt={t('photoAlt', { name: tr.name })} className="w-full h-full object-cover" />
              ) : (
                <Star className="w-1/3 h-1/3 text-[#D9C6A1]" fill="currentColor" aria-hidden="true" />
              )}
            </span>
            <h1 className="mt-10 font-serif text-4xl md:text-5xl font-semibold leading-tight">{tr.name}</h1>
            {years && <p className="mt-3 text-[#D9C6A1] tracking-[0.2em] text-sm">{years}</p>}
            {tr.message && <p className="mt-9 font-serif italic text-xl md:text-2xl text-ivory/85 leading-relaxed">&ldquo;{tr.message}&rdquo;</p>}
          </motion.div>
        )}

        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-x-8 gap-y-4 text-xs uppercase tracking-[0.18em] font-semibold">
          <Link to="/asthi-visarjan#star" className="text-ivory/80 border-b border-[#D9C6A1]/60 pb-1 hover:text-white transition-colors">{t('returnToSky')}</Link>
          <Link to="/asthi-visarjan#star" className="text-ivory/60 hover:text-white transition-colors">{t('nameAStar')}</Link>
        </div>
      </div>
    </div>
  );
};

export default StarTributeView;
