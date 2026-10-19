import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { loadAnalytics } from '../utils/analytics';

const STORAGE_KEY = 'eternal-website-cookie-consent';

type Consent = 'accepted' | 'declined';

export const CookieConsent: React.FC = () => {
  const { t } = useTranslation('components');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let saved: Consent | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY) as Consent | null;
    } catch {
      // Private browsing / blocked storage — fall through and ask, same as a first visit.
    }
    if (saved === 'accepted') {
      loadAnalytics();
    } else if (saved !== 'declined') {
      setVisible(true);
    }
  }, []);

  const choose = (consent: Consent) => {
    try {
      localStorage.setItem(STORAGE_KEY, consent);
    } catch {
      // Choice still applies for this visit even if it can't be remembered.
    }
    if (consent === 'accepted') loadAnalytics();
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-label={t('cookieConsent.ariaLabel')}
          className="fixed bottom-0 inset-x-0 z-[60] bg-deep-brown text-ivory border-t border-gold/30 px-6 py-5 md:px-10"
        >
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <div className="flex items-start gap-3 flex-1">
              <ShieldCheck className="w-5 h-5 text-gold shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-ivory/85 font-light leading-relaxed">
                {t('cookieConsent.message')}{' '}
                <Link to="/privacy-policy" className="underline hover:text-gold transition-colors">
                  {t('cookieConsent.learnMore')}
                </Link>
                .
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => choose('declined')}
                className="px-5 py-2.5 border border-ivory/30 text-ivory text-xs font-bold uppercase tracking-wider rounded-xs hover:border-gold hover:text-gold transition-colors"
              >
                {t('cookieConsent.decline')}
              </button>
              <button
                onClick={() => choose('accepted')}
                className="px-5 py-2.5 bg-gold text-ivory text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-white hover:text-deep-brown transition-colors"
              >
                {t('cookieConsent.accept')}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
