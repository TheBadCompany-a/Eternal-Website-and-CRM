import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { updatePageSEO } from '../utils/seo';

const H2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="font-serif text-xl md:text-2xl font-semibold text-deep-brown mt-10 mb-3">{children}</h2>
);
const P: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[15px] md:text-base leading-[1.85] text-charcoal/80 font-light mb-4">{children}</p>
);

export const TermsOfUseView: React.FC = () => {
  const { t } = useTranslation('legal');

  useEffect(() => {
    updatePageSEO(t('terms.seo.title'), t('terms.seo.description'));
  }, [t]);

  return (
    <div className="paper-light bg-ivory text-charcoal">
      <section className="pt-40 pb-10 md:pt-48 md:pb-12 px-6 md:px-12">
        <div className="max-w-2xl mx-auto text-center">
          <span className="text-[11px] uppercase tracking-[0.32em] text-gold font-semibold block mb-6">{t('terms.eyebrow')}</span>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-deep-brown leading-[1.1] mb-5">{t('terms.heading')}</h1>
          <p className="text-sm text-charcoal/55">{t('terms.lastUpdated')}</p>
        </div>
      </section>

      <article className="px-6 md:px-12 pb-24 md:pb-32">
        <div className="max-w-2xl mx-auto">
          <P>
            {t('terms.p1')}
          </P>

          <H2>{t('terms.usingThisSite.heading')}</H2>
          <P>
            {t('terms.usingThisSite.p1')}
          </P>

          <H2>{t('terms.notAutomaticBookings.heading')}</H2>
          <P>
            {t('terms.notAutomaticBookings.p1')}
          </P>

          <H2>{t('terms.contentAndIp.heading')}</H2>
          <P>
            {t('terms.contentAndIp.p1')}
          </P>

          <H2>{t('terms.thirdPartyLinks.heading')}</H2>
          <P>
            {t('terms.thirdPartyLinks.p1')}
          </P>

          <H2>{t('terms.limitationOfLiability.heading')}</H2>
          <P>
            {t('terms.limitationOfLiability.p1')}
          </P>

          <H2>{t('terms.changesToTerms.heading')}</H2>
          <P>
            {t('terms.changesToTerms.p1')}
          </P>

          <H2>{t('terms.governingLaw.heading')}</H2>
          <P>
            {t('terms.governingLaw.p1')}
          </P>

          <H2>{t('terms.contact.heading')}</H2>
          <P>
            <a href="mailto:care@eternalrepos.com" className="underline hover:text-gold">care@eternalrepos.com</a> {t('terms.contact.after')}
          </P>

          <div className="mt-12 pt-6 border-t border-gold/15 text-center">
            <Link to="/privacy-policy" className="text-xs uppercase tracking-wider font-semibold text-gold hover:text-deep-brown transition-colors">
              {t('terms.readPrivacy')}
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
};

export default TermsOfUseView;
