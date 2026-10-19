import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../i18n/config';

interface LanguageSwitcherProps {
  variant?: 'desktop' | 'mobile';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'desktop' }) => {
  const { i18n, t } = useTranslation('nav');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) ?? SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: string) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  if (variant === 'mobile') {
    return (
      <div className="flex items-center justify-center gap-2 pt-1">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors border ${
              activeLang.code === lang.code
                ? 'bg-gold text-ivory border-gold'
                : 'bg-transparent text-deep-brown border-gold/30 hover:border-gold'
            }`}
          >
            {lang.nativeLabel}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t('language.selectLanguage')}
        aria-expanded={open}
        className="flex items-center gap-1.5 text-ivory/80 hover:text-gold transition-colors text-[11px] uppercase tracking-wider font-semibold"
      >
        <Globe className="w-4 h-4" />
        <span>{activeLang.code.toUpperCase()}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-36 bg-deep-brown border border-gold/25 rounded-xs shadow-xl overflow-hidden z-50">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${
                activeLang.code === lang.code
                  ? 'bg-gold/15 text-gold-light font-semibold'
                  : 'text-ivory/80 hover:bg-white/5 hover:text-gold'
              }`}
            >
              {lang.nativeLabel}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
