import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export const WhatsAppButton: React.FC = () => {
  const { t } = useTranslation('components');
  const [showTooltip, setShowTooltip] = useState(false);
  const whatsappUrl =
    'https://wa.me/918448661338?text=Hello%20Eternal%20Team%2C%20I%20would%20like%20to%20enquire%20about%20ceremonial%20mobility%20services.';

  return (
    <aside
      aria-label={t('whatsApp.ariaLabel')}
      className="fixed bottom-16 right-5 z-50 flex items-center"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative group w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 border border-white/30 focus:outline-hidden"
        aria-label={t('whatsApp.chatAriaLabel')}
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] wa-pulse pointer-events-none" aria-hidden="true"></span>
        {/* Compact Pulsing Online Status Badge */}
        <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white"></span>
        </span>

        {/* WhatsApp Vector Icon */}
        <svg
          className="w-5 h-5 fill-current text-white shrink-0 filter drop-shadow-xs"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.705 1.754zm6.097-4.901l.36.213c1.558.925 3.344 1.413 5.163 1.414 5.418 0 9.824-4.406 9.827-9.824.001-2.628-1.021-5.1-2.876-6.956-1.854-1.855-4.327-2.877-6.958-2.877-5.417 0-9.823 4.406-9.825 9.824-.001 1.884.526 3.722 1.523 5.328l.235.378-1.009 3.688 3.759-.984zm11.23-7.534c-.308-.154-1.821-.898-2.103-1.001-.282-.102-.488-.153-.694.154-.205.307-.796 1.001-.976 1.206-.18.206-.359.231-.667.077-.308-.154-1.299-.478-2.474-1.527-.914-.816-1.531-1.824-1.71-2.132-.18-.308-.019-.474.135-.627.139-.138.308-.359.462-.538.154-.18.205-.308.308-.513.103-.205.051-.385-.026-.538-.077-.154-.694-1.668-.95-2.284-.25-.6-.504-.518-.694-.528l-.59-.01c-.205 0-.538.077-.821.385-.283.308-1.078 1.052-1.078 2.566 0 1.514 1.103 2.977 1.257 3.183.154.205 2.17 3.313 5.257 4.646.734.317 1.307.507 1.754.649.737.234 1.408.201 1.939.122.592-.089 1.821-.744 2.077-1.463.256-.719.256-1.334.18-1.463-.077-.13-.282-.206-.59-.36z" />
        </svg>
      </a>

      {/* Floating Hover Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 5 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-14 right-0 bg-deep-brown text-ivory text-xs px-3 py-1.5 rounded-md shadow-2xl border border-gold/30 pointer-events-none whitespace-nowrap z-50 flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{t('whatsApp.tooltip')}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
};

export default WhatsAppButton;
