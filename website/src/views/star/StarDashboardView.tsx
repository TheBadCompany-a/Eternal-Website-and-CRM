import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ImagePlus, LogOut, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { updatePageSEO } from '../../utils/seo';
import { preparePhoto } from '../../utils/tributes';
import {
  bookedStarPhotoUrl,
  getMyStars,
  signOut,
  updateMyStar,
  uploadOwnedStarPhoto,
  type MyStar,
} from '../../utils/bookedStars';
import { supabase } from '../../utils/supabaseClient';

const inputCls =
  'w-full px-4 py-3 bg-white border border-gold/25 rounded-xs text-sm text-deep-brown placeholder:text-charcoal/40 focus:outline-hidden focus:border-gold focus:ring-1 focus:ring-gold/40 transition-colors';
const labelCls = 'block text-[11px] uppercase tracking-[0.16em] font-semibold text-deep-brown mb-1.5';

// Demo mode (/my-star?demo=1): a sample active star held in memory only. No sign-in and no
// backend calls, so it can be shown without a real account.
const DEMO_STAR: MyStar = {
  id: 'demo-star',
  slug: null,
  owner_email: 'demo@eternalrepos.com',
  name: 'Raman',
  relationship: 'Father',
  about: 'A gentle soul whose kindness is still felt by everyone he met.',
  birth_date: '1950-03-12',
  death_date: '2026-10-15',
  photo_path: null,
  status: 'active',
  created_at: '2026-10-15T00:00:00Z',
  updated_at: '2026-10-15T00:00:00Z',
};

type SessionState = 'checking' | 'signed-out' | 'signed-in';
type StarsState = 'loading' | 'empty' | 'ready' | 'error';
type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const StarEditor: React.FC<{ star: MyStar; demo?: boolean }> = ({ star, demo }) => {
  const { t } = useTranslation('bookStar');
  const optional = <span className="text-charcoal/40 normal-case tracking-normal font-normal"> {t('request.optionalLabel')}</span>;
  const [form, setForm] = useState({
    name: star.name,
    relationship: star.relationship ?? '',
    about: star.about ?? '',
    birthDate: star.birth_date ?? '',
    deathDate: star.death_date ?? '',
  });
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(star.photo_path ? bookedStarPhotoUrl(star.photo_path) : null);
  const [photoError, setPhotoError] = useState('');
  const [save, setSave] = useState<SaveState>('idle');
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setSave('idle');
  };

  const pickPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPhotoError('');
    if (!file) return;
    try {
      const blob = await preparePhoto(file);
      setPhoto(blob);
      setPreview(URL.createObjectURL(blob));
      setSave('idle');
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : t('request.fields.photo.errorFallback'));
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSave('saving');
    if (demo) {
      setSave('saved');
      return;
    }
    try {
      let photoPath = star.photo_path ?? undefined;
      if (photo) photoPath = await uploadOwnedStarPhoto(star.id, photo);
      await updateMyStar(star.id, {
        name: form.name.trim(),
        relationship: form.relationship.trim() || null,
        about: form.about.trim() || null,
        birth_date: form.birthDate || null,
        death_date: form.deathDate || null,
        photo_path: photoPath ?? null,
      });
      setSave('saved');
    } catch (err) {
      console.error(err);
      setSave('error');
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={onSave}
      className="bg-white border border-gold/25 rounded-sm p-6 md:p-9 shadow-sm space-y-5"
    >
      {star.status === 'requested' && (
        <p className="text-sm text-charcoal/70 bg-blush/40 border border-gold/20 rounded-xs px-4 py-3">{t('dashboard.pendingNote')}</p>
      )}

      <div className="flex flex-col items-center gap-2 py-2" aria-hidden="true">
        <span
          className="w-24 h-24 rounded-full overflow-hidden border border-[#D9C6A1]/70 flex items-center justify-center"
          style={{ background: '#3a4034', boxShadow: '0 0 22px 6px rgba(217,198,161,0.3)' }}
        >
          {preview ? <img src={preview} alt="" className="w-full h-full object-cover" /> : <Star className="w-10 h-10 text-[#D9C6A1]" fill="currentColor" />}
        </span>
      </div>

      <div>
        <label htmlFor="sd-name" className={labelCls}>{t('dashboard.fields.name.label')} <span className="text-gold">*</span></label>
        <input id="sd-name" required maxLength={80} value={form.name} onChange={set('name')} className={inputCls} disabled={star.status !== 'active'} />
      </div>

      <div>
        <label htmlFor="sd-relationship" className={labelCls}>{t('dashboard.fields.relationship.label')}{optional}</label>
        <input id="sd-relationship" maxLength={60} value={form.relationship} onChange={set('relationship')} className={inputCls} disabled={star.status !== 'active'} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="sd-birth" className={labelCls}>{t('dashboard.fields.birthDate.label')}{optional}</label>
          <input id="sd-birth" type="date" value={form.birthDate} onChange={set('birthDate')} className={inputCls} disabled={star.status !== 'active'} />
        </div>
        <div>
          <label htmlFor="sd-death" className={labelCls}>{t('dashboard.fields.deathDate.label')}{optional}</label>
          <input id="sd-death" type="date" value={form.deathDate} onChange={set('deathDate')} className={inputCls} disabled={star.status !== 'active'} />
        </div>
      </div>

      <div>
        <label htmlFor="sd-about" className={labelCls}>{t('dashboard.fields.about.label')}{optional}</label>
        <textarea id="sd-about" rows={5} maxLength={2000} value={form.about} onChange={set('about')} className={`${inputCls} resize-none`} disabled={star.status !== 'active'} />
        <p className="mt-1 text-[11px] text-charcoal/40 text-right">{form.about.length}/2000</p>
      </div>

      <div>
        <span className={labelCls}>{t('dashboard.fields.photo.label')}{optional}</span>
        <input ref={fileRef} id="sd-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={pickPhoto} className="sr-only" disabled={star.status !== 'active'} />
        <label
          htmlFor="sd-photo"
          className={`inline-flex items-center gap-2.5 px-4 py-3 border border-dashed border-gold/50 rounded-xs text-sm text-deep-brown hover:bg-blush/50 cursor-pointer transition-colors focus-within:outline-2 focus-within:outline-gold ${star.status !== 'active' ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <ImagePlus className="w-4 h-4 text-gold" aria-hidden="true" />
          {t('dashboard.fields.photo.choose')}
        </label>
        {photoError && <p role="alert" className="mt-2 text-xs text-red-700">{photoError}</p>}
      </div>

      {star.slug && star.status === 'active' && (
        <Link to={`/star/${star.slug}`} target="_blank" rel="noreferrer" className="inline-block text-xs uppercase tracking-wider font-semibold text-gold border-b border-gold/40 pb-0.5 hover:text-deep-brown transition-colors">
          {t('dashboard.viewPublicLink')}
        </Link>
      )}

      {save === 'error' && (
        <p role="alert" className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-xs px-4 py-3">{t('dashboard.error')}</p>
      )}

      {star.status === 'active' && (
        <div className="text-center pt-1">
          <button
            type="submit"
            disabled={save === 'saving'}
            className="px-9 py-4 bg-deep-brown text-ivory font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-gold transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {save === 'saving' ? t('dashboard.saving') : save === 'saved' ? t('dashboard.saved') : t('dashboard.save')}
          </button>
        </div>
      )}
    </motion.form>
  );
};

export const StarDashboardView: React.FC = () => {
  const { t } = useTranslation('bookStar');
  const navigate = useNavigate();
  const demo = useSearchParams()[0].get('demo') === '1';
  const [session, setSession] = useState<SessionState>('checking');
  const [starsState, setStarsState] = useState<StarsState>('loading');
  const [stars, setStars] = useState<MyStar[]>([]);

  useEffect(() => {
    updatePageSEO(t('seo.dashboardTitle'), t('seo.dashboardDescription'));
  }, [t]);

  useEffect(() => {
    if (demo) {
      setSession('signed-in');
      setStars([DEMO_STAR]);
      setStarsState('ready');
      return;
    }
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      if (!data.session) {
        navigate('/my-star/login', { replace: true });
        return;
      }
      setSession('signed-in');
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!s) navigate('/my-star/login', { replace: true });
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate, demo]);

  useEffect(() => {
    if (demo || session !== 'signed-in') return;
    let alive = true;
    getMyStars()
      .then((rows) => {
        if (!alive) return;
        setStars(rows);
        setStarsState(rows.length ? 'ready' : 'empty');
      })
      .catch(() => alive && setStarsState('error'));
    return () => {
      alive = false;
    };
  }, [session, demo]);

  const onSignOut = async () => {
    if (!demo) await signOut();
    navigate('/', { replace: true });
  };

  if (session !== 'signed-in') {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 bg-ivory text-charcoal flex items-center justify-center">
        <p className="text-charcoal/60 font-light">{t('dashboard.loadingSession')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 bg-ivory text-charcoal">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-deep-brown leading-tight">{t('dashboard.heading')}</h1>
            <p className="mt-2 text-sm text-charcoal/65 font-light">{t('dashboard.subheading')}</p>
          </div>
          <button
            onClick={onSignOut}
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-charcoal/60 hover:text-deep-brown transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            {t('dashboard.signOut')}
          </button>
        </div>

        {starsState === 'loading' && <p className="text-charcoal/60 font-light">{t('dashboard.loadingStars')}</p>}

        {starsState === 'error' && (
          <p role="alert" className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-xs px-4 py-3">{t('dashboard.error')}</p>
        )}

        {starsState === 'empty' && (
          <div className="text-center bg-white border border-gold/25 rounded-sm p-8 md:p-10 shadow-sm">
            <Star className="w-7 h-7 text-gold mx-auto mb-4" fill="currentColor" aria-hidden="true" />
            <h2 className="font-serif text-xl text-deep-brown">{t('dashboard.noStars.heading')}</h2>
            <p className="mt-3 text-sm text-charcoal/65 font-light leading-relaxed">{t('dashboard.noStars.body')}</p>
            <Link to="/book-a-star" className="inline-block mt-5 text-xs uppercase tracking-wider font-semibold text-gold border-b border-gold/40 pb-0.5 hover:text-deep-brown transition-colors">
              {t('dashboard.noStars.ctaBook')}
            </Link>
          </div>
        )}

        {starsState === 'ready' && (
          <div className="space-y-8">
            {stars.map((star) => <StarEditor key={star.id} star={star} demo={demo} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default StarDashboardView;
