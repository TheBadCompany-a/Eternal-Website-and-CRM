import React, { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  PhoneCall,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  SERVICE_VIEW_DETAILS,
  ServiceViewDetail,
  SERVICES_DATA,
} from '../../data/servicesData';
import { updatePageSEO, setStructuredData, clearStructuredData } from '../../utils/seo';

/* ───────────────────────────────────────────────── */
/*  Slug ↔ Title mapping                             */
/* ───────────────────────────────────────────────── */
function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Flat ordered list of every service with a slug */
export const SERVICE_SLUGS: { slug: string; title: string; detail: ServiceViewDetail }[] = (() => {
  // Deduplicate by title (some titles are registered twice for backwards compat)
  const seen = new Set<string>();
  const list: { slug: string; title: string; detail: ServiceViewDetail }[] = [];

  Object.entries(SERVICE_VIEW_DETAILS).forEach(([key, detail]) => {
    if (seen.has(detail.title)) return;
    seen.add(detail.title);
    list.push({ slug: slugify(key), title: key, detail });
  });

  // Sort by service number
  list.sort((a, b) => a.detail.number - b.detail.number);
  return list;
})();

/* ───────────────────────────────────────────────── */
/*  Status Badge (reused from category view)         */
/* ───────────────────────────────────────────────── */
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const isLive = status === 'LIVE' || status === 'LIVE · 24×7' || status === 'LIVE SERVICE';
  const isPartner = status.includes('PARTNER');
  const isComingSoon = status === 'COMING SOON';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
        isLive
          ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/30'
          : isComingSoon
          ? 'bg-amber-500/10 text-amber-700 border border-amber-500/30'
          : isPartner
          ? 'bg-gold/15 text-deep-brown border border-gold/40'
          : 'bg-gold/10 text-gold border border-gold/30'
      }`}
    >
      {isLive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
      {status}
    </span>
  );
};

/* ───────────────────────────────────────────────── */
/*  Main Component                                   */
/* ───────────────────────────────────────────────── */
interface ServiceDetailPageProps {
  onOpenConcierge: (serviceTitle?: string) => void;
}

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({ onOpenConcierge }) => {
  const { t } = useTranslation('serviceDetail');
  const { t: tData } = useTranslation('servicesData');
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Find the service by slug
  const entry = SERVICE_SLUGS.find((s) => s.slug === slug);

  // Translated view of the registry entry (keyed by the same slug used for routing)
  const service: ServiceViewDetail | null = entry
    ? {
        ...entry.detail,
        title: tData(`viewDetails.${entry.slug}.title`, { defaultValue: entry.detail.title }),
        category: tData(`viewDetails.${entry.slug}.category`, { defaultValue: entry.detail.category }),
        tag: entry.detail.tag ? tData(`viewDetails.${entry.slug}.tag`, { defaultValue: entry.detail.tag }) : entry.detail.tag,
        scope: entry.detail.scope.map((s, i) => tData(`viewDetails.${entry.slug}.scope.${i}`, { defaultValue: s })),
        inclusions: entry.detail.inclusions.map((s, i) => tData(`viewDetails.${entry.slug}.inclusions.${i}`, { defaultValue: s })),
        exclusions: entry.detail.exclusions.map((s, i) => tData(`viewDetails.${entry.slug}.exclusions.${i}`, { defaultValue: s })),
        exclusionSummary: entry.detail.exclusionSummary
          ? tData(`viewDetails.${entry.slug}.exclusionSummary`, { defaultValue: entry.detail.exclusionSummary })
          : entry.detail.exclusionSummary,
        clarification: entry.detail.clarification
          ? tData(`viewDetails.${entry.slug}.clarification`, { defaultValue: entry.detail.clarification })
          : entry.detail.clarification,
      }
    : null;

  useEffect(() => {
    if (!entry || !service) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    updatePageSEO(
      `${service.title} — Eternal Repos`,
      `${service.scope?.[0] || t('seo.descriptionFallback', { defaultValue: 'Compassionate service by Eternal Repos.' })}`
    );
    const url = `https://eternalrepos.com/services/detail/${slug}`;
    setStructuredData('serviceDetail', {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: service.title,
      serviceType: service.category,
      description: service.scope?.[0] || '',
      url,
      provider: { '@id': 'https://eternalrepos.com/#organization' },
      areaServed: { '@type': 'AdministrativeArea', name: 'Delhi NCR, India' },
    });
    return () => clearStructuredData('serviceDetail');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry, slug, service?.title]);

  // 404 fallback
  if (!entry || !service) {
    return (
      <div className="pt-40 pb-20 text-center min-h-screen bg-ivory">
        <h1 className="font-serif text-4xl text-deep-brown mb-4">{t('notFound.title', { defaultValue: 'Service Not Found' })}</h1>
        <p className="text-charcoal/70 mb-8">{t('notFound.description', { defaultValue: "The service you're looking for doesn't exist." })}</p>
        <Link
          to="/services"
          className="px-6 py-3 bg-deep-brown text-ivory text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-gold transition-colors"
        >
          {t('notFound.cta', { defaultValue: 'View All Services' })}
        </Link>
      </div>
    );
  }

  // Find parent category
  const parentCategory = SERVICES_DATA.find((cat) =>
    cat.services.some(
      (s) => slugify(s.title) === slug || s.title === entry.title
    )
  );
  const parentCategoryTitleT = parentCategory
    ? tData(`categories.${parentCategory.id}.title`, { defaultValue: parentCategory.title })
    : null;

  // Adjacent services for prev/next navigation
  const currentIdx = SERVICE_SLUGS.findIndex((s) => s.slug === slug);
  const prevService = currentIdx > 0 ? SERVICE_SLUGS[currentIdx - 1] : null;
  const nextService = currentIdx < SERVICE_SLUGS.length - 1 ? SERVICE_SLUGS[currentIdx + 1] : null;
  const prevServiceTitleT = prevService
    ? tData(`viewDetails.${prevService.slug}.title`, { defaultValue: prevService.detail.title })
    : null;
  const nextServiceTitleT = nextService
    ? tData(`viewDetails.${nextService.slug}.title`, { defaultValue: nextService.detail.title })
    : null;

  return (
    <div className="pt-28 pb-0 bg-ivory text-charcoal min-h-screen">
      {/* ── HERO / HEADER ────────────────────────────── */}
      <section className="bg-gradient-to-b from-blush/60 via-ivory to-ivory border-b border-gold/15 py-14 px-6 md:px-12">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-charcoal/60 tracking-wider uppercase flex-wrap">
            <Link to="/" className="py-2 hover:text-gold transition-colors">{t('breadcrumb.home', { defaultValue: 'Home' })}</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gold" />
            <Link to="/services" className="py-2 hover:text-gold transition-colors">{t('breadcrumb.services', { defaultValue: 'Services' })}</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gold" />
            {parentCategory && (
              <>
                <Link to={parentCategory.path} className="py-2 hover:text-gold transition-colors">
                  {parentCategoryTitleT}
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-gold" />
              </>
            )}
            <span className="text-gold font-semibold truncate">{service.title}</span>
          </div>

          {/* Category eyebrow + status */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gold/10 border border-gold/30 rounded-full text-[11px] font-semibold text-gold tracking-widest uppercase shadow-xs">
                <Sparkles className="w-4 h-4" />
                {service.category}
              </span>
              <StatusBadge status={service.status} />
              {service.tag && (
                <span className="px-3 py-1 bg-blush text-deep-brown font-bold text-[10px] uppercase tracking-wider rounded-xs border border-gold/25">
                  {service.tag}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl md:text-5xl lg:text-[3.5rem] font-bold text-deep-brown leading-tight">
              {service.title}
            </h1>

            {/* Scope / Description */}
            <div className="space-y-2 text-base md:text-lg text-charcoal/80 font-light leading-relaxed max-w-3xl">
              {service.scope?.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={() => onOpenConcierge(`${service.category} — ${service.title}`)}
                className="px-6 py-3.5 bg-deep-brown text-ivory text-xs font-bold uppercase tracking-wider rounded-xs border border-gold/30 hover:bg-gold hover:text-ivory transition-all duration-300 shadow-md flex items-center gap-2.5 hover:-translate-y-0.5 cursor-pointer"
              >
                <span>{t('hero.requestCta', { defaultValue: 'Request This Service' })}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="tel:+918448661338"
                className="px-6 py-3.5 bg-white text-deep-brown text-xs font-bold uppercase tracking-wider rounded-xs border border-gold/30 hover:border-gold hover:bg-blush transition-all duration-300 flex items-center gap-2.5 hover:-translate-y-0.5 cursor-pointer shadow-xs"
              >
                <PhoneCall className="w-4 h-4 text-gold" />
                <span>{t('hero.helplineCta', { defaultValue: 'Call Helpline (+91 84486 61338)' })}</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── INCLUSIONS ───────────────────────────────── */}
      {service.inclusions && service.inclusions.length > 0 && (
        <section className="py-16 md:py-20 px-6 md:px-12 bg-ivory">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto"
          >
            <div className="flex items-center gap-2.5 mb-8">
              <CheckCircle2 className="w-5 h-5 text-gold" />
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-brown">
                {t('inclusions.title', { defaultValue: "What's Included" })}
              </h2>
            </div>

            <ul className="list-disc marker:text-gold pl-6 space-y-3.5">
              {service.inclusions.map((item, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.06 }}
                  className="pl-1 text-base md:text-lg font-bold text-deep-brown leading-relaxed"
                >
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </section>
      )}

      {/* ── EXCLUSIONS ───────────────────────────────── */}
      {(service.exclusionSummary || (service.exclusions && service.exclusions.length > 0)) && (
        <section className="py-12 md:py-16 px-6 md:px-12 bg-blush/30 border-y border-gold/15">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto"
          >
            <div className="flex items-center gap-2.5 mb-6">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <h2 className="font-serif text-xl md:text-2xl font-bold text-deep-brown">
                {t('exclusions.title', { defaultValue: 'Exclusions & Clarifications' })}
              </h2>
            </div>

            {service.exclusionSummary && (
              <p className="text-sm text-charcoal/80 font-light leading-relaxed mb-6 max-w-3xl">
                {service.exclusionSummary}
              </p>
            )}

            {service.exclusions && service.exclusions.length > 0 && (
              <ul className="space-y-3">
                {service.exclusions.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-charcoal/75 font-light leading-relaxed">
                    <span className="text-amber-600 shrink-0 mt-0.5">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}

            {service.clarification && (
              <div className="mt-6 flex items-start gap-2.5 p-4 bg-ivory border border-gold/20 rounded-xs">
                <Info className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <p className="text-xs text-charcoal/65 italic leading-relaxed">{service.clarification}</p>
              </div>
            )}
          </motion.div>
        </section>
      )}

      {/* ── GUIDE LINK (Asthi Visarjan etc.) ──────────── */}
      {service.link && (
        <section className="py-12 px-6 md:px-12 bg-ivory">
          <div className="max-w-5xl mx-auto">
            <Link
              to={service.link}
              className="group flex items-center justify-between p-6 bg-white border border-gold/25 rounded-xs hover:border-gold hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-gold" />
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-semibold block">{t('guide.badge', { defaultValue: 'Detailed Guide Available' })}</span>
                  <span className="font-serif text-lg font-bold text-deep-brown group-hover:text-gold transition-colors">
                    {t('guide.linkLabel', { title: service.title, defaultValue: `Read the Full ${service.title} Guide` })}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gold group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      )}

      {/* ── BOTTOM CTA STRIP ─────────────────────────── */}
      <section className="py-12 md:py-16 px-6 md:px-12 bg-deep-brown text-ivory">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <ShieldCheck className="w-5 h-5 text-gold" />
              <span className="text-[11px] uppercase tracking-[0.2em] text-gold font-semibold">
                {t('bottomCta.badge', { defaultValue: 'Compassionate & Verified Care' })}
              </span>
            </div>
            <h3 className="font-serif text-2xl md:text-3xl font-bold">
              {t('bottomCta.title', { category: service.category, defaultValue: `Need help with ${service.category}?` })}
            </h3>
            <p className="text-sm text-ivory/70 font-light max-w-lg">
              {t('bottomCta.description', { defaultValue: 'Our team is ready to listen, guide, and support your family with dignity and care.' })}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <a
              href="tel:+918448661338"
              className="w-full sm:w-auto px-6 py-3.5 bg-white/10 border border-ivory/25 text-ivory text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4 text-gold" />
              <span>+91 84486 61338</span>
            </a>
            <button
              onClick={() => onOpenConcierge(`${service.category} — ${service.title}`)}
              className="w-full sm:w-auto px-6 py-3.5 bg-gold text-ivory text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-gold-light transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>{t('bottomCta.requestCta', { defaultValue: 'Request This Service' })}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── PREV / NEXT NAVIGATION ───────────────────── */}
      <section className="bg-blush/40 border-t border-gold/15 py-10 px-6 md:px-12">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {prevService ? (
            <Link
              to={`/services/detail/${prevService.slug}`}
              className="w-full sm:w-auto px-6 py-3.5 bg-white border border-gold/25 rounded-xs text-left hover:border-gold hover:bg-ivory transition-all duration-300 flex items-center gap-3.5 group shadow-xs hover:shadow-md"
            >
              <ArrowLeft className="w-4 h-4 text-gold group-hover:-translate-x-1 transition-transform" />
              <div>
                <span className="text-[10px] text-charcoal/60 uppercase tracking-wider block">{t('nav.previousService', { defaultValue: 'Previous Service' })}</span>
                <span className="font-serif text-sm font-bold text-deep-brown group-hover:text-gold transition-colors">
                  {prevServiceTitleT}
                </span>
              </div>
            </Link>
          ) : (
            <div />
          )}

          <Link
            to="/services"
            className="text-xs font-bold text-gold uppercase tracking-widest hover:underline px-4 py-2"
          >
            {t('nav.viewAllServices', { defaultValue: 'View All Services' })}
          </Link>

          {nextService ? (
            <Link
              to={`/services/detail/${nextService.slug}`}
              className="w-full sm:w-auto px-6 py-3.5 bg-white border border-gold/25 rounded-xs text-right hover:border-gold hover:bg-ivory transition-all duration-300 flex items-center justify-end gap-3.5 group shadow-xs hover:shadow-md"
            >
              <div>
                <span className="text-[10px] text-charcoal/60 uppercase tracking-wider block">{t('nav.nextService', { defaultValue: 'Next Service' })}</span>
                <span className="font-serif text-sm font-bold text-deep-brown group-hover:text-gold transition-colors">
                  {nextServiceTitleT}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-gold group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </section>
    </div>
  );
};
