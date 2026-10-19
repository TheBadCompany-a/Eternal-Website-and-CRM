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

export const PrivacyPolicyView: React.FC = () => {
  const { t } = useTranslation('legal');

  useEffect(() => {
    updatePageSEO(t('privacy.seo.title'), t('privacy.seo.description'));
  }, [t]);

  return (
    <div className="paper-light bg-ivory text-charcoal">
      <section className="pt-40 pb-10 md:pt-48 md:pb-12 px-6 md:px-12">
        <div className="max-w-2xl mx-auto text-center">
          <span className="text-[11px] uppercase tracking-[0.32em] text-gold font-semibold block mb-6">{t('privacy.eyebrow')}</span>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-deep-brown leading-[1.1] mb-5">{t('privacy.heading')}</h1>
          <p className="text-sm text-charcoal/55">{t('privacy.lastUpdated')}</p>
        </div>
      </section>

      <article className="px-6 md:px-12 pb-24 md:pb-32">
        <div className="max-w-2xl mx-auto">
          <div className="bg-blush/50 border border-gold/20 rounded-xs px-5 py-4 mb-8 text-sm text-charcoal/70 font-light leading-relaxed">
            {t('privacy.intro.before')}{' '}
            <a href="mailto:care@eternalrepos.com" className="underline hover:text-gold">care@eternalrepos.com</a>{t('privacy.intro.after')}
          </div>

          <P>
            {t('privacy.p1')}
          </P>

          <H2>{t('privacy.whatWeCollect.heading')}</H2>
          <P>
            {t('privacy.whatWeCollect.p1')}
          </P>
          <P>
            {t('privacy.whatWeCollect.p2')}
          </P>

          <H2>{t('privacy.howWeUseIt.heading')}</H2>
          <P>
            {t('privacy.howWeUseIt.p1')}
          </P>

          <H2>{t('privacy.cookies.heading')}</H2>
          <P>
            {t('privacy.cookies.p1')}
          </P>

          <H2>{t('privacy.whoElseSeesIt.heading')}</H2>
          <P>
            {t('privacy.whoElseSeesIt.p1')}
          </P>

          <H2>{t('privacy.retention.heading')}</H2>
          <P>
            {t('privacy.retention.p1')}
          </P>

          <H2>{t('privacy.yourChoices.heading')}</H2>
          <P>
            {t('privacy.yourChoices.before')}{' '}
            <a href="mailto:care@eternalrepos.com" className="underline hover:text-gold">care@eternalrepos.com</a>{t('privacy.yourChoices.after')}
          </P>

          <H2>{t('privacy.contact.heading')}</H2>
          <P>
            {t('privacy.contact.before')}{' '}
            <a href="mailto:care@eternalrepos.com" className="underline hover:text-gold">care@eternalrepos.com</a> {t('privacy.contact.after')}
          </P>

          <div className="mt-12 pt-6 border-t border-gold/15 text-center">
            <Link to="/terms-of-use" className="text-xs uppercase tracking-wider font-semibold text-gold hover:text-deep-brown transition-colors">
              {t('privacy.readTerms')}
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
};

export default PrivacyPolicyView;
