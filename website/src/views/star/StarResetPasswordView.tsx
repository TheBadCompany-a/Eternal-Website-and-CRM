import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { updatePageSEO } from '../../utils/seo';
import { updatePassword } from '../../utils/bookedStars';
import { supabase } from '../../utils/supabaseClient';

const inputCls =
  'w-full px-4 py-3 bg-white border border-gold/25 rounded-xs text-sm text-deep-brown placeholder:text-charcoal/40 focus:outline-hidden focus:border-gold focus:ring-1 focus:ring-gold/40 transition-colors';
const labelCls = 'block text-[11px] uppercase tracking-[0.16em] font-semibold text-deep-brown mb-1.5';

type Ready = 'checking' | 'ready' | 'expired';
type Status = 'idle' | 'saving' | 'done' | 'error';

export const StarResetPasswordView: React.FC = () => {
  const { t } = useTranslation('bookStar');
  const navigate = useNavigate();
  const [ready, setReady] = useState<Ready>('checking');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    updatePageSEO(t('seo.loginTitle'), t('seo.loginDescription'));
  }, [t]);

  // A password-reset link signs the family into a short-lived recovery session automatically.
  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (alive && data.session) setReady('ready');
      else if (alive) setReady('expired');
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) setReady('ready');
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError('');
    if (password.length < 8) {
      setFieldError(t('request.fields.password.tooShort'));
      return;
    }
    if (password !== confirmPassword) {
      setFieldError(t('request.fields.confirmPassword.mismatch'));
      return;
    }
    setStatus('saving');
    try {
      await updatePassword(password);
      setStatus('done');
      setTimeout(() => navigate('/my-star', { replace: true }), 1500);
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 bg-ivory text-charcoal flex items-start justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Star className="w-7 h-7 text-gold mx-auto mb-4" fill="currentColor" aria-hidden="true" />
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-deep-brown leading-tight">{t('resetPassword.heading')}</h1>
          <p className="mt-3 text-sm text-charcoal/65 font-light leading-relaxed">{t('resetPassword.subheading')}</p>
        </div>

        {ready === 'checking' && <p className="text-center text-charcoal/60 font-light">{t('resetPassword.checking')}</p>}

        {ready === 'expired' && (
          <div className="text-center bg-white border border-gold/25 rounded-sm p-8 shadow-sm">
            <p className="text-sm text-charcoal/70 font-light leading-relaxed">{t('resetPassword.expired')}</p>
            <Link to="/my-star/login" className="inline-block mt-5 text-xs uppercase tracking-wider font-semibold text-gold border-b border-gold/40 pb-0.5 hover:text-deep-brown transition-colors">
              {t('login.backToRequest')}
            </Link>
          </div>
        )}

        {ready === 'ready' && (
          status === 'done' ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} role="status" className="text-center bg-white border border-gold/25 rounded-sm p-8 shadow-sm">
              <p className="text-sm text-charcoal/70 font-light leading-relaxed">{t('resetPassword.done')}</p>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={submit}
              className="bg-white border border-gold/25 rounded-sm p-6 sm:p-8 shadow-sm space-y-5"
            >
              <div>
                <label htmlFor="rp-password" className={labelCls}>{t('resetPassword.fields.newPassword.label')}</label>
                <input id="rp-password" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label htmlFor="rp-confirm-password" className={labelCls}>{t('resetPassword.fields.confirmNewPassword.label')}</label>
                <input id="rp-confirm-password" type="password" required minLength={8} autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputCls} />
              </div>

              {fieldError && <p role="alert" className="text-xs text-red-700">{fieldError}</p>}
              {status === 'error' && (
                <p role="alert" className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-xs px-4 py-3">{t('resetPassword.error')}</p>
              )}

              <button
                type="submit"
                disabled={status === 'saving'}
                className="w-full px-6 py-3.5 bg-deep-brown text-ivory font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-gold transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {status === 'saving' ? t('resetPassword.saving') : t('resetPassword.submit')}
              </button>
            </motion.form>
          )
        )}
      </div>
    </div>
  );
};

export default StarResetPasswordView;
