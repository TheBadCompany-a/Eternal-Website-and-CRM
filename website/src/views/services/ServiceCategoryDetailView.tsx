import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  PhoneCall,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Heart,
  ArrowLeft,
  X,
} from 'lucide-react';
import { SERVICE_SLUGS } from './ServiceDetailPage';
import {
  SERVICES_DATA,
  ServiceCategoryData,
  CORE_LIVE_SERVICES,
  MEMORIAL_SERVICES,
  SERVICE_VIEW_DETAILS,
  ServiceViewDetail,
  ServiceStatus,
} from '../../data/servicesData';
import { updatePageSEO, setStructuredData, clearStructuredData } from '../../utils/seo';
import { PreBookingSection } from '../../components/PreBookingSection';

const StatusBadge: React.FC<{ status: ServiceStatus | string; className?: string }> = ({
  status,
  className = '',
}) => {
  const isLive = status === 'LIVE' || status === 'LIVE · 24×7' || status === 'LIVE SERVICE';
  const isPartner = status.includes('PARTNER');
  const isComingSoon = status === 'COMING SOON';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
        isLive
          ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/30'
          : isComingSoon
          ? 'bg-amber-500/10 text-amber-700 border border-amber-500/30'
          : isPartner
          ? 'bg-gold/15 text-deep-brown border border-gold/40'
          : 'bg-gold/10 text-gold border border-gold/30'
      } ${className}`}
    >
      {isLive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
      {status}
    </span>
  );
};

interface ServiceCategoryDetailViewProps {
  categoryId: string;
  onOpenConcierge: (serviceTitle?: string) => void;
}

export const ServiceCategoryDetailView: React.FC<ServiceCategoryDetailViewProps> = ({
  categoryId,
  onOpenConcierge,
}) => {
  const { t } = useTranslation('serviceCategoryDetail');
  const { t: tData } = useTranslation('servicesData');
  const navigate = useNavigate();
  const categoryData = SERVICES_DATA.find((c) => c.id === categoryId) || SERVICES_DATA[0];

  const categoryTitleT = tData(`categories.${categoryData.id}.title`, { defaultValue: categoryData.title });
  const categorySummaryT = tData(`categories.${categoryData.id}.summary`, { defaultValue: categoryData.summary });
  const categoryTaglineT = tData(`categories.${categoryData.id}.tagline`, { defaultValue: categoryData.tagline });
  const categoryHeroBadgeT = tData(`categories.${categoryData.id}.heroBadge`, { defaultValue: categoryData.heroBadge });
  const categoryHighlightsT = categoryData.highlights.map((h, i) =>
    tData(`categories.${categoryData.id}.highlights.${i}`, { defaultValue: h })
  );
  const categoryServicesT = categoryData.services.map((s, i) => ({
    ...s,
    title: tData(`categories.${categoryData.id}.services.${i}.title`, { defaultValue: s.title }),
    desc: tData(`categories.${categoryData.id}.services.${i}.desc`, { defaultValue: s.desc }),
    feeling: tData(`categories.${categoryData.id}.services.${i}.feeling`, { defaultValue: s.feeling }),
    tag: s.tag ? tData(`categories.${categoryData.id}.services.${i}.tag`, { defaultValue: s.tag }) : s.tag,
  }));
  const memorialServicesT = MEMORIAL_SERVICES.map((item) => ({
    ...item,
    title: tData(`memorialServices.${item.id}.title`, { defaultValue: item.title }),
    category: tData(`memorialServices.${item.id}.category`, { defaultValue: item.category }),
    description: tData(`memorialServices.${item.id}.description`, { defaultValue: item.description }),
    subtext: item.subtext ? tData(`memorialServices.${item.id}.subtext`, { defaultValue: item.subtext }) : item.subtext,
  }));

  useEffect(() => {
    updatePageSEO(
      `${categoryTitleT} — Eternal Repos`,
      `${categorySummaryT} ${t('seo.descriptionSuffix', { defaultValue: 'Discover compassionate, 24/7 care and specialized arrangements for your family.' })}`
    );
    const url = `https://eternalrepos.com${window.location.pathname}`;
    setStructuredData('service', {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: categoryTitleT,
      serviceType: categoryTitleT,
      description: categorySummaryT,
      url,
      provider: { '@id': 'https://eternalrepos.com/#organization' },
      areaServed: { '@type': 'AdministrativeArea', name: 'Delhi NCR, India' },
      availableChannel: {
        '@type': 'ServiceChannel',
        servicePhone: '+91-84486-61338',
        serviceUrl: 'https://eternalrepos.com/contact',
      },
    });
    return () => clearStructuredData('service');
  }, [categoryData, categoryTitleT, categorySummaryT, t]);

  // Find adjacent categories for quick navigation
  const currentIndex = SERVICES_DATA.findIndex((c) => c.id === categoryId);
  const nextCategory = SERVICES_DATA[(currentIndex + 1) % SERVICES_DATA.length];
  const prevCategory = SERVICES_DATA[(currentIndex - 1 + SERVICES_DATA.length) % SERVICES_DATA.length];
  const nextCategoryTitleT = tData(`categories.${nextCategory.id}.title`, { defaultValue: nextCategory.title });
  const prevCategoryTitleT = tData(`categories.${prevCategory.id}.title`, { defaultValue: prevCategory.title });

  const CategoryIcon = categoryData.icon;

  const [viewModalService, setViewModalService] = useState<ServiceViewDetail | null>(null);

  /** Navigate to the dedicated service detail page */
  const handleOpenView = (serviceTitle: string, _fallback?: Partial<ServiceViewDetail>) => {
    // Slugify the title the same way ServiceDetailPage does
    const slug = serviceTitle
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Verify it exists in the registry, otherwise fall back to old modal
    const found = SERVICE_SLUGS.find((s) => s.slug === slug);
    if (found) {
      navigate(`/services/detail/${slug}`);
    } else {
      // Fallback: open the legacy modal for unregistered services
      const rawDetail = SERVICE_VIEW_DETAILS[serviceTitle];
      if (rawDetail) {
        setViewModalService({
          ...rawDetail,
          title: tData(`viewDetails.${slug}.title`, { defaultValue: rawDetail.title }),
          category: tData(`viewDetails.${slug}.category`, { defaultValue: rawDetail.category }),
          tag: rawDetail.tag ? tData(`viewDetails.${slug}.tag`, { defaultValue: rawDetail.tag }) : rawDetail.tag,
          scope: rawDetail.scope.map((s, i) => tData(`viewDetails.${slug}.scope.${i}`, { defaultValue: s })),
          inclusions: rawDetail.inclusions.map((s, i) => tData(`viewDetails.${slug}.inclusions.${i}`, { defaultValue: s })),
          exclusions: rawDetail.exclusions.map((s, i) => tData(`viewDetails.${slug}.exclusions.${i}`, { defaultValue: s })),
          exclusionSummary: rawDetail.exclusionSummary
            ? tData(`viewDetails.${slug}.exclusionSummary`, { defaultValue: rawDetail.exclusionSummary })
            : rawDetail.exclusionSummary,
          clarification: rawDetail.clarification
            ? tData(`viewDetails.${slug}.clarification`, { defaultValue: rawDetail.clarification })
            : rawDetail.clarification,
        });
      } else {
        setViewModalService({
          number: _fallback?.number || 1,
          title: _fallback?.title || serviceTitle,
          category: _fallback?.category || categoryTitleT,
          status: _fallback?.status || 'LIVE',
          tag: _fallback?.tag,
          scope: _fallback?.scope || (_fallback?.description ? [_fallback.description] : [t('modal.defaultFallbackScope', { defaultValue: 'Comprehensive assistance tailored to family requirements.' })]),
          inclusions: _fallback?.inclusions || [],
          exclusions: _fallback?.exclusions || [],
          exclusionSummary: _fallback?.exclusionSummary,
          clarification: _fallback?.clarification,
        });
      }
    }
  };

  return (
    <div className="pt-28 pb-20 bg-ivory text-charcoal min-h-screen space-y-0">
      
      {/* 1. BREADCRUMB & HEADER CONTAINER */}
      <section className="bg-gradient-to-b from-blush/60 via-ivory to-ivory border-b border-gold/15 py-14 px-6 md:px-12">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs text-charcoal/60 tracking-wider uppercase">
            <Link to="/" className="py-2 hover:text-gold transition-colors">{t('breadcrumb.home', { defaultValue: 'Home' })}</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gold" />
            <Link to="/services" className="py-2 hover:text-gold transition-colors">{t('breadcrumb.services', { defaultValue: 'Services' })}</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gold" />
            <span className="text-gold font-semibold truncate">{categoryTitleT}</span>
          </div>

          {/* Category Hero Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
            <div className="lg:col-span-8 space-y-5">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gold/10 border border-gold/30 rounded-full text-[11px] font-semibold text-gold tracking-widest uppercase shadow-xs">
                <CategoryIcon className="w-4 h-4" />
                {categoryHeroBadgeT}
              </span>

              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-deep-brown leading-tight">
                {categoryTitleT}
              </h1>

              <p className="text-base md:text-xl text-charcoal/80 font-light leading-relaxed max-w-2xl">
                {categoryTaglineT}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  onClick={() => onOpenConcierge(categoryTitleT)}
                  className="px-6 py-3.5 bg-deep-brown text-ivory text-xs font-bold uppercase tracking-wider rounded-xs border border-gold/30 hover:bg-gold hover:text-ivory transition-all duration-300 shadow-md flex items-center gap-2.5 hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>{t('hero.requestCta', { defaultValue: 'Request Service Support' })}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="tel:+918448661338"
                  className="px-6 py-3.5 bg-white text-deep-brown text-xs font-bold uppercase tracking-wider rounded-xs border border-gold/30 hover:border-gold hover:bg-blush transition-all duration-300 flex items-center gap-2.5 hover:-translate-y-0.5 cursor-pointer shadow-xs"
                >
                  <PhoneCall className="w-4 h-4 text-gold" />
                  <span>{t('hero.helplineCta', { defaultValue: '24/7 Helpline (+91 84486 61338)' })}</span>
                </a>
              </div>
            </div>

            {/* Quick Highlights Feature Card */}
            <div className="lg:col-span-4 bg-white border border-gold/30 p-6 sm:p-7 rounded-xs shadow-lg space-y-4 eternal-card">
              <div className="flex items-center gap-2 text-gold font-serif font-bold text-base border-b border-gold/15 pb-3">
                <Sparkles className="w-4.5 h-4.5" />
                <span>{t('hero.assurancesHeading', { defaultValue: 'Key Service Assurances' })}</span>
              </div>
              <ul className="space-y-3.5">
                {categoryHighlightsT.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs text-charcoal/85 leading-relaxed font-light">
                    <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4 border-t border-gold/15 text-[11px] text-charcoal/60 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gold shrink-0" />
                <span>{t('hero.verifiedCare', { defaultValue: 'Verified Compassionate Care' })}</span>
              </div>
            </div>
          </div>

        </div>
      </section>



      {/* 3. DETAILED SERVICES LISTING */}
      {categoryData.id === 'serene-gatherings-remembrance' ? (
        <section className="py-20 md:py-28 px-6 md:px-12 bg-ivory">
          <div className="max-w-5xl mx-auto space-y-12">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-bold block mb-3">
                {t('memorialSection.eyebrow', { defaultValue: 'ARRANGED ON REQUEST' })}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-deep-brown leading-tight mb-4">
                {t('memorialSection.title', { defaultValue: 'Prayer Hall & Floral Services' })}
              </h2>
              <p className="text-sm md:text-base text-charcoal/75 font-light leading-relaxed">
                {t('memorialSection.description', { defaultValue: 'When your family needs help with prayer meetings, decor, or catering, our team coordinates everything gently through trusted partners — with one dedicated coordinator to assist you.' })}
              </p>
            </div>

            {/* Editorial Row Directory */}
            <div className="divide-y divide-gold/20 border-t border-b border-gold/20">
              {memorialServicesT.map((item, idx) => {
                const ItemIcon = item.icon || Sparkles;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                  >
                    <div
                      onClick={() => handleOpenView(MEMORIAL_SERVICES[idx].title)}
                      className="w-full text-left group block py-8 md:py-10 cursor-pointer focus:outline-hidden transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-7 md:gap-8">
                        {/* Thumbnail image or Left Circle Icon */}
                        {item.image ? (
                          <div className="w-full sm:w-36 md:w-44 aspect-[16/10] sm:aspect-[4/3] rounded-xs overflow-hidden shrink-0 border border-gold/25 shadow-xs relative bg-charcoal/5">
                            <img src={item.image} alt={item.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          </div>
                        ) : (
                          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full border border-charcoal/25 bg-ivory flex items-center justify-center text-charcoal/80 group-hover:border-gold group-hover:bg-gold/5 group-hover:text-gold transition-all duration-300 shrink-0 mt-0.5 shadow-xs">
                            <ItemIcon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.3} />
                          </div>
                        )}

                        {/* Content Area */}
                        <div className="flex-1 min-w-0">
                          {/* Top Line: Category Eyebrow + Status Badge + View CTA */}
                          <div className="flex items-center justify-between gap-4 mb-2">
                            <div className="flex flex-wrap items-center gap-2.5">
                              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.24em] text-gold font-semibold">
                                0{idx + 1} · {item.category}
                              </span>
                              <StatusBadge status={item.status} />
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenView(MEMORIAL_SERVICES[idx].title);
                              }}
                              className="px-4 py-2 bg-deep-brown text-ivory text-xs font-bold uppercase tracking-wider rounded-xs group-hover:bg-gold group-hover:text-ivory transition-all duration-300 flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
                            >
                              <span>{t('memorialSection.viewCta', { defaultValue: 'View' })}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-gold group-hover:text-ivory" />
                            </button>
                          </div>

                          {/* Title */}
                          <h3 className="font-serif text-2xl sm:text-3xl md:text-[32px] font-medium text-deep-brown mb-2.5 leading-snug group-hover:text-gold transition-colors duration-300">
                            {item.title}
                          </h3>

                          {/* Description */}
                          <p className="text-[15px] md:text-base text-charcoal/75 font-light leading-relaxed max-w-3xl">
                            {item.description}
                          </p>

                          {/* Subtext if present */}
                          {item.subtext && (
                            <p className="text-xs text-charcoal/60 italic font-light mt-2.5 pt-2.5 border-t border-gold/15 max-w-3xl">
                              {item.subtext}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Partner Coordination Reassurance Banner */}
            <div className="p-6 sm:p-8 bg-blush/40 border border-gold/25 rounded-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-2xl">
                <span className="text-[10px] uppercase tracking-[0.24em] text-gold font-semibold block">
                  {t('memorialSection.banner.eyebrow', { defaultValue: 'ONE COORDINATED POINT OF CONTACT' })}
                </span>
                <h4 className="font-serif text-xl sm:text-2xl font-semibold text-deep-brown">
                  {t('memorialSection.banner.title', { defaultValue: 'Need multiple arrangements coordinated together?' })}
                </h4>
                <p className="text-xs sm:text-sm text-charcoal/70 font-light leading-relaxed">
                  {t('memorialSection.banner.description', { defaultValue: "You don't need to juggle multiple decorators, venues, and caterers. Share your family's preferences with us and our team will coordinate the details with vetted partners." })}
                </p>
              </div>
              <button
                onClick={() => onOpenConcierge(t('memorialSection.conciergeCategory', { defaultValue: 'Memorial & Gathering Coordination' }))}
                className="px-6 py-3.5 bg-deep-brown text-ivory text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-gold hover:text-ivory transition-colors cursor-pointer shrink-0 shadow-xs text-center"
              >
                {t('memorialSection.banner.cta', { defaultValue: 'Plan with our team' })}
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section className="py-20 px-6 md:px-12 bg-ivory">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="space-y-2 border-b border-gold/15 pb-4">
              <span className="text-xs uppercase tracking-[0.2em] text-gold font-semibold block">
                {t('servicesGrid.eyebrow', { defaultValue: 'OUR SERVICES' })}
              </span>
              <h2 className="font-serif text-2xl md:text-4xl font-bold text-deep-brown">
                {t('servicesGrid.title', { category: categoryTitleT, defaultValue: `Services in ${categoryTitleT}` })}
              </h2>
            </div>

            <div
              className={`grid grid-cols-1 ${
                categoryData.services.length === 3
                  ? 'md:grid-cols-3'
                  : categoryData.services.length === 4
                  ? 'sm:grid-cols-2 lg:grid-cols-4'
                  : 'md:grid-cols-2'
              } gap-6 lg:gap-8`}
            >
              {categoryServicesT.map((item, idx) => {
                const ItemIcon = item.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.08 }}
                    viewport={{ once: true }}
                    className="bg-white border border-gold/25 rounded-xs hover:border-gold hover:shadow-xl transition-all duration-300 flex flex-col justify-between group overflow-hidden eternal-card"
                  >
                    <div>
                      {item.img && (
                        <div className="relative aspect-[16/10] overflow-hidden bg-charcoal/5 border-b border-gold/15">
                          <img
                            src={item.img}
                            alt={item.title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-deep-brown/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                          <div className="absolute top-3.5 left-3.5 w-10 h-10 rounded-full bg-ivory/95 backdrop-blur-xs border border-gold/40 flex items-center justify-center text-gold shadow-xs">
                            <ItemIcon className="w-5 h-5" />
                          </div>
                          {item.tag && (
                            <span className="absolute top-3.5 right-3.5 px-3 py-1 bg-ivory/95 backdrop-blur-xs text-deep-brown font-bold text-[10px] uppercase tracking-wider rounded-xs border border-gold/30 shadow-xs">
                              {item.tag}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="p-6 lg:p-7 space-y-3.5">
                        {!item.img && (
                          <div className="flex items-center justify-between mb-2">
                            <div className="w-11 h-11 rounded-full bg-blush border border-gold/30 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-ivory transition-colors">
                              <ItemIcon className="w-5 h-5" />
                            </div>
                            {item.tag && (
                              <span className="px-3 py-1 bg-blush text-deep-brown font-bold text-[10px] uppercase tracking-wider rounded-xs border border-gold/25">
                                {item.tag}
                              </span>
                            )}
                          </div>
                        )}

                        <h3 className="font-serif text-2xl font-bold text-deep-brown group-hover:text-gold transition-colors leading-snug">
                          {item.title}
                        </h3>

                        <p className="text-xs text-charcoal/80 font-light leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    <div className="mx-6 lg:mx-7 py-4 border-t border-gold/15 flex items-center justify-between gap-2.5">
                      <span className="text-[11px] text-gold font-medium italic flex items-center gap-1.5 min-w-0">
                        <Heart className="w-3.5 h-3.5 text-gold shrink-0" />
                        <span className="truncate">{item.feeling}</span>
                      </span>

                      {item.link ? (
                        <Link
                          to={item.link}
                          className="px-4 py-2 bg-deep-brown text-ivory text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-gold hover:text-ivory transition-all duration-300 flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                        >
                          <span>{t('servicesGrid.exploreGuideCta', { defaultValue: 'Explore Guide' })}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-gold group-hover:text-ivory" />
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleOpenView(categoryData.services[idx].title, { title: item.title, description: item.desc, tag: item.tag })}
                          className="px-4 py-2 bg-deep-brown text-ivory text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-gold hover:text-ivory transition-all duration-300 flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                        >
                          <span>{t('servicesGrid.viewCta', { defaultValue: 'View' })}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-gold" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}




      {/* PRE-BOOKING — Pre-Planning only */}
      {categoryData.id === 'reassuring-peace-of-mind' && <PreBookingSection />}

      {/* 4. PREVIOUS / NEXT CATEGORY NAVIGATION */}
      <section className="bg-blush/40 border-t border-gold/15 py-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <button
            onClick={() => navigate(prevCategory.path)}
            className="w-full sm:w-auto px-6 py-3.5 bg-white border border-gold/25 rounded-xs text-left hover:border-gold hover:bg-ivory transition-all duration-300 flex items-center gap-3.5 cursor-pointer group shadow-xs hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4 text-gold group-hover:-translate-x-1 transition-transform" />
            <div>
              <span className="text-[10px] text-charcoal/60 uppercase tracking-wider block">{t('nav.previousService', { defaultValue: 'Previous Service' })}</span>
              <span className="font-serif text-sm font-bold text-deep-brown group-hover:text-gold transition-colors">{prevCategoryTitleT}</span>
            </div>
          </button>

          <Link
            to="/services"
            className="text-xs font-bold text-gold uppercase tracking-widest hover:underline px-4 py-2"
          >
            {t('nav.viewAllServices', { defaultValue: 'View All Services' })}
          </Link>

          <button
            onClick={() => navigate(nextCategory.path)}
            className="w-full sm:w-auto px-6 py-3.5 bg-white border border-gold/25 rounded-xs text-right hover:border-gold hover:bg-ivory transition-all duration-300 flex items-center justify-end gap-3.5 cursor-pointer group shadow-xs hover:shadow-md"
          >
            <div>
              <span className="text-[10px] text-charcoal/60 uppercase tracking-wider block">{t('nav.nextService', { defaultValue: 'Next Service' })}</span>
              <span className="font-serif text-sm font-bold text-deep-brown group-hover:text-gold transition-colors">{nextCategoryTitleT}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gold group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* SERVICE DETAIL VIEW MODAL */}
      <AnimatePresence>
        {viewModalService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewModalService(null)}
              className="fixed inset-0 bg-deep-brown/60 backdrop-blur-xs transition-opacity cursor-pointer"
            />

            {/* Modal Dialog (Ivory / Warm Luxury Paper Theme) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-3xl bg-ivory text-charcoal rounded-xs border border-gold/30 shadow-2xl overflow-hidden my-6 z-10 text-left"
            >
              {/* Close Button */}
              <button
                onClick={() => setViewModalService(null)}
                className="absolute top-5 right-5 text-charcoal/60 hover:text-deep-brown transition-colors cursor-pointer p-1.5 z-20 rounded-full hover:bg-blush/40"
                aria-label={t('modal.closeAria', { defaultValue: 'Close modal' })}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header Bar */}
              <div className="p-6 sm:p-8 sm:pb-5 pr-14 space-y-1.5 border-b border-gold/20 bg-blush/20">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-[11px] uppercase tracking-[0.25em] text-gold font-semibold">
                    {viewModalService.category}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-gold/30 bg-gold/10 text-deep-brown font-medium">
                    {viewModalService.status}
                  </span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-deep-brown tracking-tight">
                  {viewModalService.title}
                </h3>
              </div>

              {/* Body */}
              <div className="p-6 sm:p-8 space-y-6 max-h-[66vh] overflow-y-auto">
                {/* 1. Overview narrative paragraphs */}
                <div className="space-y-2 text-xs sm:text-sm text-charcoal/80 font-light leading-relaxed">
                  {viewModalService.scope && viewModalService.scope.length > 0 ? (
                    viewModalService.scope.map((para, i) => (
                      <p key={i}>{para}</p>
                    ))
                  ) : (
                    <p>{t('modal.defaultScope', { defaultValue: 'Full logistical and compassionate support tailored to family requirements.' })}</p>
                  )}
                </div>

                {/* 2. Inclusions Section (Numbered List) */}
                {viewModalService.inclusions && viewModalService.inclusions.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="text-sm sm:text-base font-bold text-deep-brown tracking-tight">
                      {t('modal.inclusions', { defaultValue: 'Inclusions' })}
                    </h4>
                    <ol className="space-y-2 text-xs sm:text-sm text-charcoal/85 font-light leading-relaxed pl-0.5">
                      {viewModalService.inclusions.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="font-bold text-deep-brown shrink-0 min-w-[1.25rem]">
                            {idx + 1}.
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* 3. Exclusion Section (Inline Summary) */}
                {(viewModalService.exclusionSummary || (viewModalService.exclusions && viewModalService.exclusions.length > 0)) && (
                  <div className="text-xs sm:text-sm text-charcoal/85 leading-relaxed font-light pt-1">
                    <span className="font-bold text-deep-brown">{t('modal.exclusionLabel', { defaultValue: 'Exclusion:' })} </span>
                    <span>
                      {viewModalService.exclusionSummary || viewModalService.exclusions.join(', ')}
                    </span>
                  </div>
                )}

                {/* 4. Note / Clarification if present */}
                {viewModalService.clarification && (
                  <p className="text-xs text-charcoal/60 italic pt-1">
                    {viewModalService.clarification}
                  </p>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-5 sm:p-6 bg-white/70 border-t border-gold/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                <a
                  href="tel:+918448661338"
                  className="w-full sm:w-auto px-5 py-3 border border-gold/30 bg-white text-deep-brown text-xs font-bold uppercase tracking-wider rounded-xs hover:border-gold hover:bg-blush/30 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <PhoneCall className="w-4 h-4 text-gold" />
                  <span>{t('modal.callSupportCta', { defaultValue: 'Call 24×7 Support' })}</span>
                </a>

                <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                  {viewModalService.link && (
                    <Link
                      to={viewModalService.link}
                      onClick={() => setViewModalService(null)}
                      className="w-full sm:w-auto px-5 py-3 border border-gold/40 bg-gold/10 text-deep-brown text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-gold hover:text-ivory transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <span>{t('modal.readFullGuideCta', { defaultValue: 'Read Full Guide' })}</span>
                      <ArrowRight className="w-4 h-4 text-gold" />
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      const titleToEnquire = viewModalService.title;
                      setViewModalService(null);
                      onOpenConcierge(`${viewModalService.category} - ${titleToEnquire}`);
                    }}
                    className="w-full sm:w-auto px-6 py-3.5 bg-deep-brown text-ivory text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#1a1715] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>{t('modal.requestServiceCta', { defaultValue: 'Request This Service' })}</span>
                    <ArrowRight className="w-4 h-4 text-gold" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export const ImmediateReliefView: React.FC<{ onOpenConcierge: (title?: string) => void }> = (props) => (
  <ServiceCategoryDetailView categoryId="immediate-relief-transport" {...props} />
);

export const SereneGatheringsView: React.FC<{ onOpenConcierge: (title?: string) => void }> = (props) => (
  <ServiceCategoryDetailView categoryId="serene-gatherings-remembrance" {...props} />
);

export const NaturalBeautyView: React.FC<{ onOpenConcierge: (title?: string) => void }> = (props) => (
  <ServiceCategoryDetailView categoryId="serene-gatherings-remembrance" {...props} />
);

export const EmpathicCareView: React.FC<{ onOpenConcierge: (title?: string) => void }> = (props) => (
  <ServiceCategoryDetailView categoryId="empathic-care-keepsakes" {...props} />
);

export const PeaceOfMindView: React.FC<{ onOpenConcierge: (title?: string) => void }> = (props) => (
  <ServiceCategoryDetailView categoryId="reassuring-peace-of-mind" {...props} />
);

export const SpecialisedServicesView: React.FC<{ onOpenConcierge: (title?: string) => void }> = (props) => (
  <ServiceCategoryDetailView categoryId="specialised-services" {...props} />
);
