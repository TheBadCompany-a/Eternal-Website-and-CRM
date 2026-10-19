import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { updatePageSEO } from '../../utils/seo';
import { getPublicBookedStar, bookedStarPhotoUrl, type PublicBookedStar } from '../../utils/bookedStars';

type Load = { status: 'loading' } | { status: 'missing' } | { status: 'ready'; star: PublicBookedStar };

const formatDate = (iso: string, locale: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

export const BookedStarProfileView: React.FC = () => {
  const { t, i18n } = useTranslation('bookStar');
  const { slug = '' } = useParams();
  const [load, setLoad] = useState<Load>({ status: 'loading' });

  useEffect(() => {
    let alive = true;
    setLoad({ status: 'loading' });
    getPublicBookedStar(slug)
      .then((s) => alive && setLoad(s ? { status: 'ready', star: s } : { status: 'missing' }))
      .catch(() => alive && setLoad({ status: 'missing' }));
    return () => {
      alive = false;
    };
  }, [slug]);

  useEffect(() => {
    updatePageSEO(
      load.status === 'ready' ? t('seo.profileTitleReady', { name: load.star.name }) : t('seo.profileTitleDefault'),
      t('seo.profileDescription')
    );
  }, [load, t]);

  const star = load.status === 'ready' ? load.star : null;
  const dates = star && (star.birth_date || star.death_date)
    ? [star.birth_date, star.death_date].filter(Boolean).map((d) => formatDate(d as string, i18n.language)).join(' – ')
    : '';

  return (
    <div
      className="min-h-screen pt-32 pb-24 px-6 text-ivory"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #3a4034 0%, #262a22 50%, #171914 100%)' }}
    >
      <div className="max-w-xl mx-auto text-center">
        {load.status === 'loading' && <p className="font-serif text-xl text-ivory/70">{t('profile.loading')}</p>}

        {load.status === 'missing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Star className="w-8 h-8 mx-auto text-[#D9C6A1]" aria-hidden="true" />
            <h1 className="mt-6 font-serif text-3xl md:text-4xl">{t('profile.missing.heading')}</h1>
            <p className="mt-4 text-ivory/65 font-light">{t('profile.missing.body')}</p>
          </motion.div>
        )}

        {star && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/40 mb-8">
              <Crown className="w-3.5 h-3.5 text-[#D9C6A1]" />
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#D9C6A1] font-semibold">{t('profile.vipBadge')}</span>
            </div>

            <span
              className="mx-auto w-44 h-44 md:w-56 md:h-56 rounded-full overflow-hidden border border-[#D9C6A1]/70 flex items-center justify-center bg-[#3a4034]"
              style={{ boxShadow: '0 0 40px 12px rgba(217,198,161,0.28)' }}
            >
              {star.photo_path ? (
                <img src={bookedStarPhotoUrl(star.photo_path)} alt={t('profile.photoAlt', { name: star.name })} className="w-full h-full object-cover" />
              ) : (
                <Star className="w-1/3 h-1/3 text-[#D9C6A1]" fill="currentColor" aria-hidden="true" />
              )}
            </span>

            <h1 className="mt-10 font-serif text-4xl md:text-5xl font-semibold leading-tight">{star.name}</h1>
            {star.relationship && <p className="mt-2 text-ivory/60 text-sm">{star.relationship}</p>}
            {dates && <p className="mt-3 text-[#D9C6A1] tracking-[0.2em] text-sm">{dates}</p>}
            {star.about && <p className="mt-9 font-serif italic text-xl md:text-2xl text-ivory/85 leading-relaxed whitespace-pre-line">&ldquo;{star.about}&rdquo;</p>}
          </motion.div>
        )}

        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-x-8 gap-y-4 text-xs uppercase tracking-[0.18em] font-semibold">
          <Link to="/services#galaxy-sky" className="text-ivory/80 border-b border-[#D9C6A1]/60 pb-1 hover:text-white transition-colors">{t('profile.returnToGalaxy')}</Link>
        </div>
      </div>
    </div>
  );
};

export default BookedStarProfileView;
