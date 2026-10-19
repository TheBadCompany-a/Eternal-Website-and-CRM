import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Download, Calendar, Volume2, Shield, Sparkles, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { generateVehicleSpecsPDF } from '../utils/pdfGenerator';
import { updatePageSEO } from '../utils/seo';
import { Verse } from '../components/Verse';

interface VehicleViewProps {
  onOpenConcierge: () => void;
}

interface SpecItem { label: string; value: string }
interface SpecCategory { title: string; specs: SpecItem[] }
interface AngleItem { label: string; url: string }
interface HighlightItem { title: string; description: string }

export const VehicleView: React.FC<VehicleViewProps> = ({ onOpenConcierge }) => {
  const { t } = useTranslation('vehicle');

  useEffect(() => {
    updatePageSEO(t('seo.title'), t('seo.description'));
  }, [t]);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const [activeAngle, setActiveAngle] = useState<number>(0);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(0);

  const angleUrls = [
    '/assets/vehicle_view_front_34.png',
    '/assets/vehicle_view_side_left.png',
    '/assets/vehicle_view_side_right.png',
    '/assets/vehicle_view_rear_34.png',
    '/assets/vehicle_view_top.png',
    '/assets/eternal_bier_sanctuary.png',
  ];
  const angleLabels = t('angles', { returnObjects: true }) as Record<string, string>;
  const vehicleAngles: AngleItem[] = [
    angleLabels.frontPerspective,
    angleLabels.sideLeft,
    angleLabels.sideRight,
    angleLabels.rearPerspective,
    angleLabels.topAerial,
    angleLabels.interior,
  ].map((label, idx) => ({ label, url: angleUrls[idx] }));

  const highlightIcons = [Volume2, Sparkles, Shield];
  const highlightItems = t('highlights.items', { returnObjects: true }) as HighlightItem[];

  const specCategories = t('specs.categories', { returnObjects: true }) as SpecCategory[];

  return (
    <div className="pt-28 pb-20 relative">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gold z-50 origin-left"
        style={{ scaleX }}
      />

      {/* 1. VIDEO HERO */}
      <section className="relative -mt-28 md:-mt-32 min-h-[82vh] flex items-center justify-center overflow-hidden bg-deep-brown">
        <div className="absolute inset-0 z-0">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source src="/hero_video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-deep-brown/85 via-deep-brown/45 to-deep-brown/60"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6 pt-32">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold block mb-4">
            {t('hero.eyebrow')}
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.35 }} className="font-serif text-4xl sm:text-5xl md:text-7xl font-semibold text-ivory leading-[1.08] mb-5 drop-shadow-md">
            {t('hero.headingLine1')}<br className="hidden sm:inline" /> {t('hero.headingLine2')}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} className="text-base md:text-xl text-ivory/85 font-light leading-relaxed max-w-2xl mx-auto mb-9 drop-shadow-xs">
            {t('hero.body')}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.65 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={onOpenConcierge} className="w-full sm:w-auto px-8 py-4 bg-gold text-ivory text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-white hover:text-deep-brown transition-all duration-300 flex items-center justify-center gap-2.5 shadow-md hover:-translate-y-0.5 cursor-pointer">
              <Calendar className="w-4 h-4" />
              <span>{t('hero.arrangeViewing')}</span>
            </button>
            <button onClick={generateVehicleSpecsPDF} className="w-full sm:w-auto px-8 py-4 bg-white/10 border border-ivory/40 text-ivory text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-white hover:text-deep-brown transition-all duration-300 flex items-center justify-center gap-2.5 backdrop-blur-sm hover:-translate-y-0.5 cursor-pointer">
              <Download className="w-4 h-4" />
              <span>{t('hero.vehicleDetailsPdf')}</span>
            </button>
          </motion.div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-ivory/70">
          <ChevronDown className="w-6 h-6 animate-bounce" />
        </div>
      </section>

      {/* 2. A CLOSER LOOK — 360 SHOWCASE (light, airy) */}
      <section className="px-6 md:px-12 bg-ivory pt-24 md:pt-32 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold block mb-3">
              {t('closerLook.eyebrow')}
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-semibold text-deep-brown leading-tight mb-4">
              {t('closerLook.heading')}
            </h2>
            <p className="text-base md:text-lg text-charcoal/75 font-light leading-relaxed">
              {t('closerLook.body')}
            </p>
          </div>

          <div className="bg-white p-4 md:p-8 rounded-sm border border-gold/15 shadow-[0_20px_60px_rgba(58,54,47,0.08)] space-y-6">
            {/* Main Angle Image Display */}
            <div className="relative aspect-[16/9] md:aspect-[21/9] bg-blush rounded-xs overflow-hidden flex items-center justify-center border border-gold/10">
              <motion.img
                key={activeAngle}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                src={vehicleAngles[activeAngle].url}
                alt={vehicleAngles[activeAngle].label}
                className="w-full h-full object-contain p-4"
              />
              <div className="absolute bottom-4 left-4 bg-white/85 backdrop-blur-md px-3.5 py-1.5 rounded-xs border border-gold/20 text-xs tracking-wide text-deep-brown font-medium shadow-sm">
                {vehicleAngles[activeAngle].label}
              </div>
            </div>

            {/* Angle Selectors */}
            <div className="flex items-center justify-center gap-2 md:gap-3 overflow-x-auto pb-2 custom-scrollbar">
              {vehicleAngles.map((ang, idx) => (
                <button
                  key={ang.label}
                  onClick={() => setActiveAngle(idx)}
                  className={`px-4 py-2 text-[11px] uppercase tracking-wider rounded-xs transition-all whitespace-nowrap cursor-pointer ${
                    activeAngle === idx
                      ? 'bg-gold text-ivory font-semibold border border-gold shadow-sm'
                      : 'bg-deep-brown/[0.04] text-deep-brown/70 hover:bg-deep-brown/[0.08] hover:text-deep-brown border border-transparent'
                  }`}
                >
                  {ang.label.split(' ')[0]} {ang.label.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. DESIGN HIGHLIGHTS — light & calm */}
      <section className="py-24 md:py-36 px-6 md:px-12 bg-blush/40">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
            <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold block mb-4">{t('highlights.eyebrow')}</span>
            <h2 className="font-serif text-3xl md:text-5xl font-semibold text-deep-brown leading-tight mb-5">{t('highlights.heading')}</h2>
            <p className="text-base md:text-lg text-charcoal/70 font-light leading-relaxed">{t('highlights.body')}</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14">
            {highlightItems.map((s, i) => {
              const Icon = highlightIcons[i];
              return (
                <motion.div key={s.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }} className="text-center md:text-left group">
                  <div className="w-14 h-14 rounded-full border border-gold/40 flex items-center justify-center text-gold mb-6 mx-auto md:mx-0 transition-all duration-300 group-hover:bg-gold group-hover:text-ivory">
                    <Icon className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-serif text-xl md:text-2xl text-deep-brown mb-3">{s.title}</h3>
                  <p className="text-sm md:text-base text-charcoal/70 font-light leading-relaxed">{s.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE SPECIFICATIONS ACCORDION */}
      <section className="py-24 px-6 md:px-12 bg-ivory">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14 space-y-2">
            <span className="text-[11px] uppercase tracking-[0.25em] text-gold font-semibold block">
              {t('specs.eyebrow')}
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-deep-brown">
              {t('specs.heading')}
            </h2>
            <p className="text-xs text-charcoal/60 font-light pt-1">
              {t('specs.body')}
            </p>
          </div>

          <div className="space-y-4">
            {specCategories.map((cat, idx) => {
              const isOpen = activeAccordion === idx;
              return (
                <div
                  key={cat.title}
                  className={`bg-white border rounded-xs overflow-hidden transition-all duration-300 ${
                    isOpen ? 'border-gold shadow-md' : 'border-gold/20 hover:border-gold/40'
                  }`}
                >
                  <button
                    onClick={() => setActiveAccordion(isOpen ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-hidden hover:bg-blush/30 transition-colors cursor-pointer"
                  >
                    <span className="font-serif text-xl font-bold text-deep-brown">
                      {cat.title}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-gold transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-3 border-t border-gold/15 bg-ivory/30">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {cat.specs.map((item) => (
                          <div key={item.label} className="p-4 bg-white border border-gold/15 rounded-xs shadow-2xs">
                            <span className="text-[10px] font-semibold text-gold uppercase tracking-wider block mb-1">
                              {item.label}
                            </span>
                            <span className="text-xs text-charcoal/85 font-light leading-relaxed">
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Download CTA Box */}
          <div className="mt-14 p-8 md:p-10 bg-deep-brown text-ivory rounded-xs border border-gold/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1 text-left">
              <h4 className="font-serif text-2xl font-bold text-ivory">{t('downloadCta.heading')}</h4>
              <p className="text-xs text-ivory/70 font-light leading-relaxed">
                {t('downloadCta.body')}
              </p>
            </div>
            <button
              onClick={generateVehicleSpecsPDF}
              className="px-6 py-3.5 bg-gold text-ivory text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-white hover:text-charcoal transition-all duration-300 shrink-0 flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>{t('downloadCta.button')}</span>
            </button>
          </div>
        </div>
      </section>
      <Verse text={t('verse.text')} attr={t('verse.attr')} />
    </div>
  );
};

