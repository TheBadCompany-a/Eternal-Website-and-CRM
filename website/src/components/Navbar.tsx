import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, ShieldCheck, ChevronDown, PhoneCall, Sparkles, Instagram, Linkedin, Facebook } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { SERVICES_DATA } from '../data/servicesData';
import { SHOW_VEHICLE } from '../config/features';
import { SERVICE_TILES } from '../data/serviceTiles';
import { LanguageSwitcher } from './LanguageSwitcher';

export const Navbar: React.FC = () => {
  const { t } = useTranslation('nav');
  const { t: tData } = useTranslation('servicesData');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
  }, [location.pathname]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setMegaMenuOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setMegaMenuOpen(false);
    }, 200);
  };

  const leftLinks = [
    { name: t('links.about'), path: '/about' },
    { name: t('links.ourStory'), path: '/our-story' },
    ...(SHOW_VEHICLE ? [{ name: t('links.vehicle'), path: '/vehicle' }] : []),
    { name: t('links.institutions'), path: '/institutions' },
  ];

  const rightLinks = [
    { name: t('links.vision'), path: '/vision' },
    { name: t('links.insights'), path: '/insights' },
    { name: t('links.contact'), path: '/contact' },
  ];

  const isHomePage = location.pathname === '/';
  const isServicesActive = location.pathname.startsWith('/services') || location.pathname.startsWith('/asthi-visarjan');
  const imageMenu = location.pathname === '/v2';
  const isSolidNav = true || !isHomePage || scrolled || megaMenuOpen;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 h-24 md:h-32 ${
        isSolidNav
          ? 'bg-deep-brown/95 backdrop-blur-md border-b border-gold/25 shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-full grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center">
        
        {/* Left Column: Navigation Links (Desktop) / Mobile Toggle */}
        <div className="flex items-center justify-start gap-6 min-w-0">
          
          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-ivory hover:text-gold transition-colors focus:outline-hidden drop-shadow-xs"
            aria-label={t('mobile.toggleMenu')}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Desktop Left Links */}
          <nav className="hidden lg:flex items-center gap-3.5 xl:gap-6">
            {leftLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-[11px] uppercase tracking-[0.1em] xl:tracking-[0.18em] font-semibold transition-all duration-300 relative py-1 ${
                    isActive
                      ? 'text-ivory font-bold'
                      : 'text-ivory/90 hover:text-gold drop-shadow-xs'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavIndicatorLeft"
                      className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gold-light"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}

            {/* SERVICES WITH MEGA MENU DROPDOWN TRIGGER */}
            <div
              className="relative py-1 cursor-pointer"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                to="/services"
                className={`text-[11px] uppercase tracking-[0.1em] xl:tracking-[0.18em] font-semibold transition-all duration-300 flex items-center gap-1 py-1 ${
                  isServicesActive
                    ? 'text-ivory font-bold'
                    : 'text-ivory/90 hover:text-gold drop-shadow-xs'
                }`}
              >
                <span>{t('links.services')}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${megaMenuOpen ? 'rotate-180 text-gold' : ''}`} />
                {isServicesActive && (
                  <motion.span
                    layoutId="activeNavIndicatorServices"
                    className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gold-light"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            </div>
          </nav>
        </div>

        {/* Center Column: Eternal Brand Logo */}
        <div className="flex-initial flex items-center justify-center px-4 py-1">
          <Link to="/" className="group inline-flex items-center justify-center py-1">
            <img
              src="/assets/logo-brand-v2.png"
              alt="Eternal Repos — Tribute in Motion Logo"
              className="h-16 md:h-24 w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] my-auto"
            />
          </Link>
        </div>

        {/* Right Column: Navigation Links & Action Button */}
        <div className="flex items-center justify-end gap-5 min-w-0">
          <nav className="hidden lg:flex items-center gap-5">
            {rightLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-[11px] uppercase tracking-[0.18em] font-semibold transition-all duration-300 relative py-1 ${
                    isActive
                      ? 'text-ivory font-bold'
                      : 'text-ivory/90 hover:text-gold drop-shadow-xs'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavIndicatorRight"
                      className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gold-light"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="hidden lg:flex items-center gap-4 pl-4 border-l border-ivory/15">
            <LanguageSwitcher variant="desktop" />
            <div className="flex items-center gap-3 pl-3 border-l border-ivory/15">
              <a href="https://www.instagram.com/eternal.repos" target="_blank" rel="noreferrer" aria-label="Instagram" className="text-ivory/70 hover:text-gold transition-colors"><Instagram className="w-4 h-4" /></a>
              <a href="https://www.linkedin.com/company/eternal-repos/" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="text-ivory/70 hover:text-gold transition-colors"><Linkedin className="w-4 h-4" /></a>
              <a href="https://www.facebook.com/share/1DPrR2xkX2/" target="_blank" rel="noreferrer" aria-label="Facebook" className="text-ivory/70 hover:text-gold transition-colors"><Facebook className="w-4 h-4" /></a>
            </div>
          </div>
        </div>

      </div>

      {/* DESKTOP MEGA MENU DROPDOWN PANEL */}
      <AnimatePresence>
        {megaMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="hidden lg:block absolute top-[80px] md:top-[96px] left-0 right-0 w-full bg-ivory/98 backdrop-blur-xl border-b border-gold/25 shadow-2xl overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
              
              {/* Header Title */}
              <div className="flex items-center justify-between border-b border-gold/20 pb-4">
                <div className="flex items-center gap-2 text-gold">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-[11px] tracking-[0.2em] uppercase font-bold">
                    {imageMenu ? t('megaMenu.exploreServices') : t('megaMenu.exploreFiveWays')}
                  </span>
                </div>
              </div>

              {/* SERVICES MEGA MENU GRID */}
              {imageMenu && (
                <div className="grid grid-cols-4 gap-3">
                  {SERVICE_TILES.map((t) => (
                    <Link key={t.label} to={t.href} onClick={() => setMegaMenuOpen(false)} className="group relative block aspect-[4/3] rounded-xs overflow-hidden border border-gold/15">
                      {t.img ? (
                        <img src={t.img} alt={t.label} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(145deg, #3A362F 0%, #5E6B54 100%)' }}>
                          <img src="/assets/logo-emblem-ivory.png" alt="" aria-hidden="true" className="w-10 h-10 opacity-30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-deep-brown/85 via-deep-brown/20 to-transparent" />
                      <span className="absolute left-3 right-3 bottom-2.5 font-serif text-sm text-ivory leading-tight drop-shadow-sm">{t.label}</span>
                    </Link>
                  ))}
                </div>
              )}
              {!imageMenu && (
              <div className="grid grid-cols-5 gap-4">
                {SERVICES_DATA.map((service) => {
                  const ServiceIcon = service.icon;
                  const isCurrent = location.pathname === service.path;

                  return (
                    <Link
                      key={service.id}
                      to={service.path}
                      onClick={() => setMegaMenuOpen(false)}
                      className={`rounded-xs border transition-all duration-300 flex flex-col justify-between group h-full overflow-hidden ${
                        isCurrent
                          ? 'bg-blush/40 border-gold shadow-md'
                          : 'bg-white border-gold/15 hover:border-gold hover:shadow-md'
                      }`}
                    >
                      <div>
                        {service.img && (
                          <div className="relative aspect-[16/10] overflow-hidden bg-charcoal/5">
                            <img
                              src={service.img}
                              alt={service.title}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-deep-brown/60 via-transparent to-transparent opacity-75 group-hover:opacity-50 transition-opacity" />
                            <div className="absolute top-2.5 left-2.5 w-7 h-7 rounded-full bg-ivory/95 backdrop-blur-xs border border-gold/40 flex items-center justify-center text-gold shadow-xs">
                              <ServiceIcon className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        )}

                        <div className="p-3.5 pt-3 space-y-1.5">
                          {!service.img && (
                            <div className="w-9 h-9 rounded-full bg-blush border border-gold/30 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-ivory transition-colors mb-3">
                              <ServiceIcon className="w-4 h-4" />
                            </div>
                          )}

                          <h4 className="font-serif text-sm font-bold text-deep-brown group-hover:text-gold transition-colors leading-snug">
                            {tData(`categories.${service.id}.title`, { defaultValue: service.title })}
                          </h4>
                          <p className="text-[11px] text-charcoal/70 line-clamp-2 font-light leading-relaxed">
                            {tData(`categories.${service.id}.summary`, { defaultValue: service.summary })}
                          </p>
                        </div>
                      </div>

                      <div className="mx-3.5 py-2.5 border-t border-gold/10 flex items-center justify-between text-[10px] text-gold font-semibold uppercase tracking-wider">
                        <span>{t('megaMenu.explore')}</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  );
                })}
              </div>
              )}

              {/* Bottom Quick Support Strip */}
              <div className="bg-blush/60 border border-gold/20 p-4 rounded-xs flex items-center justify-between text-xs text-charcoal/80">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-gold shrink-0" />
                  <span>{t('megaMenu.supportStrip')}</span>
                </div>

                <a
                  href="tel:+918448661338"
                  className="px-4 py-1.5 bg-gold text-ivory font-bold text-xs rounded-xs hover:bg-white transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{t('megaMenu.helpline')}</span>
                </a>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE DRAWER NAVIGATION */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-ivory border-b border-gold/20 px-6 py-6 shadow-xl overflow-y-auto max-h-[calc(100svh-96px)] md:max-h-[calc(100svh-128px)]"
          >
            <div className="flex flex-col gap-4">
              
              {/* About & Story & Vehicle Links */}
              {leftLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-lg font-serif transition-colors ${
                    location.pathname === link.path ? 'text-gold font-semibold' : 'text-deep-brown hover:text-gold'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {/* Collapsible Mobile Services Sub-Menu */}
              <div className="border-y border-gold/20 py-2">
                <button
                  onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                  className="w-full flex items-center justify-between text-lg font-serif text-deep-brown hover:text-gold py-1"
                >
                  <span className={isServicesActive ? 'text-gold font-semibold' : ''}>{t('links.services')}</span>
                  <ChevronDown className={`w-5 h-5 text-gold transition-transform ${mobileServicesOpen ? 'rotate-180' : ''}`} />
                </button>

                {mobileServicesOpen && (
                  <div className="pl-4 pt-2 space-y-3 border-l-2 border-gold/30 mt-2">

                    {SERVICES_DATA.map((service) => {
                      const ServiceIcon = service.icon;
                      return (
                        <Link
                          key={service.id}
                          to={service.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2.5 text-sm font-serif text-deep-brown hover:text-gold transition-colors py-2"
                        >
                          <ServiceIcon className="w-4 h-4 text-gold shrink-0" />
                          <span>{service.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>


              {/* Right Links */}
              {rightLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-lg font-serif transition-colors ${
                    location.pathname === link.path ? 'text-gold font-semibold' : 'text-deep-brown hover:text-gold'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-4 border-t border-gold/15 flex flex-col gap-3">
                <LanguageSwitcher variant="mobile" />
                <div className="flex items-center justify-center gap-2 text-xs text-charcoal/60 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold" />
                  <span>{t('mobile.supportLine')}</span>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
};
