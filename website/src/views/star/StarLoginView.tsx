import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { updatePageSEO } from '../../utils/seo';
import { signInWithPassword, requestPasswordReset } from '../../utils/bookedStars';
import { supabase } from '../../utils/supabaseClient';

const inputCls =
  'w-full px-4 py-3 bg-white border border-gold/25 rounded-xs text-sm text-deep-brown placeholder:text-charcoal/40 focus:outline-hidden focus:border-gold focus:ring-1 focus:ring-gold/40 transition-colors';
const labelCls = 'block text-[11px] uppercase tracking-[0.16em] font-semibold text-deep-brown mb-1.5';

type Status = 'idle' | 'sending' | 'error';
type ResetStatus = 'idle' | 'sending' | 'sent' | 'error';

export const StarLoginView: React.FC = () => {
  const { t } = useTranslation('bookStar');
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [showReset, setShowReset] = useState(false);
  const [resetStatus, setResetStatus] = useState<ResetStatus>('idle');

  useEffect(() => {
    updatePageSEO(t('seo.loginTitle'), t('seo.loginDescription'));
  }, [t]);

  // Already signed in? Go straight to the dashboard.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/my-star', { replace: true });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await signInWithPassword(email, password);
      navigate('/my-star', { replace: true });
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus('sending');
    try {
      await requestPasswordReset(email);
      setResetStatus('sent');
    } catch (err) {
      console.error(err);
      setResetStatus('error');
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 bg-ivory text-charcoal flex items-start justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Star className="w-7 h-7 text-gold mx-auto mb-4" fill="currentColor" aria-hidden="true" />
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-deep-brown leading-tight">{t('login.heading')}</h1>
          <p className="mt-3 text-sm text-charcoal/65 font-light leading-relaxed">{t('login.subheading')}</p>
        </div>

        {showReset ? (
          resetStatus === 'sent' ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} role="status" className="text-center bg-white border border-gold/25 rounded-sm p-8 shadow-sm">
              <Mail className="w-6 h-6 text-gold mx-auto mb-3" aria-hidden="true" />
              <h2 className="font-serif text-xl text-deep-brown">{t('login.reset.sentState.heading')}</h2>
              <p className="mt-2 text-sm text-charcoal/65 font-light leading-relaxed">{t('login.reset.sentState.message', { email })}</p>
              <button
                onClick={() => { setShowReset(false); setResetStatus('idle'); }}
                className="mt-5 text-xs uppercase tracking-wider font-semibold text-gold border-b border-gold/40 pb-0.5 hover:text-deep-brown transition-colors cursor-pointer"
              >
                {t('login.reset.backToSignIn')}
              </button>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={submitReset}
              className="bg-white border border-gold/25 rounded-sm p-6 sm:p-8 shadow-sm space-y-5"
            >
              <p className="text-sm text-charcoal/65 font-light leading-relaxed">{t('login.reset.intro')}</p>
              <div>
                <label htmlFor="sl-reset-email" className={labelCls}>{t('login.fields.email.label')}</label>
                <input
                  id="sl-reset-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('login.fields.email.placeholder')}
                  className={inputCls}
                />
              </div>

              {resetStatus === 'error' && (
                <p role="alert" className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-xs px-4 py-3">{t('login.reset.error')}</p>
              )}

              <button
                type="submit"
                disabled={resetStatus === 'sending'}
                className="w-full px-6 py-3.5 bg-deep-brown text-ivory font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-gold transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {resetStatus === 'sending' ? t('login.reset.sending') : t('login.reset.submit')}
              </button>

              <button
                type="button"
                onClick={() => setShowReset(false)}
                className="w-full text-center text-xs uppercase tracking-wider font-semibold text-charcoal/60 hover:text-deep-brown transition-colors cursor-pointer"
              >
                {t('login.reset.backToSignIn')}
              </button>
            </motion.form>
          )
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={submit}
            className="bg-white border border-gold/25 rounded-sm p-6 sm:p-8 shadow-sm space-y-5"
          >
            <div>
              <label htmlFor="sl-email" className={labelCls}>{t('login.fields.email.label')}</label>
              <input
                id="sl-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('login.fields.email.placeholder')}
                className={inputCls}
              />
            </div>

            <div>
              <label htmlFor="sl-password" className={labelCls}>{t('login.fields.password.label')}</label>
              <input
                id="sl-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
              />
            </div>

            <button
              type="button"
              onClick={() => setShowReset(true)}
              className="text-xs font-semibold text-gold hover:text-deep-brown transition-colors cursor-pointer"
            >
              {t('login.forgotPassword')}
            </button>

            {status === 'error' && (
              <p role="alert" className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-xs px-4 py-3">
                {t('login.error')}
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full px-6 py-3.5 bg-deep-brown text-ivory font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-gold transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {status === 'sending' ? t('login.sending') : t('login.submit')}
            </button>
          </motion.form>
        )}

        <p className="text-center mt-6 text-sm text-charcoal/60 font-light">
          <Link to="/my-star?demo=1" className="text-charcoal/70 border-b border-charcoal/30 pb-0.5 hover:text-deep-brown transition-colors">
            View a demo star dashboard
          </Link>
        </p>

        <p className="text-center mt-6 text-sm text-charcoal/60 font-light">
          <Link to="/book-a-star" className="text-gold font-semibold border-b border-gold/40 pb-0.5 hover:text-deep-brown transition-colors">
            {t('login.backToRequest')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default StarLoginView;
