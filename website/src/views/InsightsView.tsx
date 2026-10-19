import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Clock, Calendar, ArrowLeft } from 'lucide-react';
import { updatePageSEO } from '../utils/seo';
import { Verse } from '../components/Verse';

export const InsightsView: React.FC = () => {
  const { t } = useTranslation('insights');

  useEffect(() => {
    updatePageSEO(
      t('seo.title'),
      t('seo.description')
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);

  const articles = [
    {
      id: 1,
      title: t('articles.article1.title'),
      category: t('articles.article1.category'),
      date: t('articles.article1.date'),
      readTime: t('articles.article1.readTime'),
      excerpt: t('articles.article1.excerpt'),
      content: t('articles.article1.content'),
    },
    {
      id: 2,
      title: t('articles.article2.title'),
      category: t('articles.article2.category'),
      date: t('articles.article2.date'),
      readTime: t('articles.article2.readTime'),
      excerpt: t('articles.article2.excerpt'),
      content: t('articles.article2.content'),
    },
  ];

  const activeArticle = articles.find((a) => a.id === selectedArticleId);

  return (
    <div className="pt-36 md:pt-44 pb-20 space-y-0">
      {!activeArticle ? (
        <>
          {/* HERO */}
          <section className="py-16 md:py-24 px-6 md:px-12 bg-ivory text-center">
            <div className="max-w-4xl mx-auto space-y-3">
              <span className="text-[11px] uppercase tracking-[0.25em] text-gold font-semibold block">
                {t('hero.kicker')}
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-deep-brown leading-tight">
                {t('hero.title')}
              </h1>
              <p className="text-sm md:text-base text-charcoal/70 font-light max-w-xl mx-auto pt-1">
                {t('hero.subtitle')}
              </p>
            </div>
          </section>

          {/* WHITE PAPER */}
          <section className="py-16 md:py-20 px-6 md:px-12 bg-ivory border-t border-gold/15">
            <div className="max-w-5xl mx-auto">
              <a
                href="/white-paper/"
                className="block eternal-card border border-gold/25 rounded-xs bg-white p-8 sm:p-10 md:p-12 shadow-md group"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12">
                  <img
                    src="/white-paper/cover.png"
                    alt={t('whitePaper.imageAlt')}
                    loading="lazy"
                    className="w-32 sm:w-40 md:w-48 shrink-0 self-start rounded-xs shadow-lg border border-gold/20"
                  />
                  <div className="space-y-4">
                    <span className="text-[11px] uppercase tracking-[0.25em] text-gold font-semibold block">
                      {t('whitePaper.badge')}
                    </span>
                    <h2 className="font-serif text-3xl md:text-4xl font-bold text-deep-brown leading-tight group-hover:text-gold transition-colors">
                      {t('whitePaper.title')}
                    </h2>
                    <p className="text-sm md:text-base text-charcoal/80 font-light leading-relaxed max-w-2xl">
                      {t('whitePaper.description')}
                    </p>
                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold pt-1 group-hover:text-deep-brown transition-colors">
                      <span>{t('whitePaper.cta')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </a>
            </div>
          </section>

          {/* ARTICLE LISTING */}
          <section className="py-20 px-6 md:px-12 bg-blush/30 border-t border-gold/15">
            <div className="max-w-5xl mx-auto space-y-8">
              {articles.map((art) => (
                <div
                  key={art.id}
                  className="eternal-card p-8 sm:p-10 border border-gold/25 rounded-xs bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group cursor-pointer shadow-md"
                  onClick={() => setSelectedArticleId(art.id)}
                >
                  <div className="space-y-3 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gold">
                      <span className="px-2.5 py-0.5 bg-blush text-deep-brown font-bold text-[10px] uppercase tracking-wider rounded-xs border border-gold/25">
                        {art.category}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1.5 text-charcoal/60">
                        <Calendar className="w-3.5 h-3.5 text-gold" /> {art.date}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1.5 text-charcoal/60">
                        <Clock className="w-3.5 h-3.5 text-gold" /> {art.readTime}
                      </span>
                    </div>

                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-deep-brown group-hover:text-gold transition-colors leading-snug">
                      {art.title}
                    </h2>
                    <p className="text-xs md:text-sm text-charcoal/80 font-light leading-relaxed">
                      {art.excerpt}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedArticleId(art.id)}
                    className="px-6 py-3 bg-deep-brown text-ivory text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-gold hover:text-ivory transition-colors shrink-0 flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>{t('listing.readButton')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        /* SINGLE ARTICLE READER VIEW */
        <section className="py-20 px-6 md:px-12 bg-ivory">
          <div className="max-w-3xl mx-auto bg-white border border-gold/20 p-8 sm:p-12 md:p-16 rounded-xs shadow-lg">
            <button
              onClick={() => setSelectedArticleId(null)}
              className="inline-flex items-center gap-2 text-xs uppercase font-bold text-gold mb-8 hover:text-deep-brown transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> {t('reader.back')}
            </button>

            <div className="space-y-4 mb-8">
              <span className="text-xs text-gold uppercase tracking-widest font-bold block">
                {activeArticle.category}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-deep-brown leading-tight">
                {activeArticle.title}
              </h1>
              <div className="flex items-center gap-4 text-xs text-charcoal/60 pt-3 border-b border-gold/20 pb-4">
                <span>{t('reader.publishedPrefix')} {activeArticle.date}</span>
                <span>·</span>
                <span>{activeArticle.readTime}</span>
                <span>·</span>
                <span>{t('reader.byTeam')}</span>
              </div>
            </div>

            <div
              className="prose prose-serif max-w-none text-charcoal/90 leading-relaxed space-y-4 font-light text-base"
              dangerouslySetInnerHTML={{ __html: activeArticle.content }}
            />

            <div className="mt-12 pt-8 border-t border-gold/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
              <span className="text-charcoal/60">{t('reader.shareCta')}</span>
              <button
                onClick={() => setSelectedArticleId(null)}
                className="px-6 py-3 bg-deep-brown text-ivory uppercase tracking-wider font-bold rounded-xs hover:bg-gold hover:text-ivory transition-colors cursor-pointer shadow-xs"
              >
                {t('reader.moreButton')}
              </button>
            </div>
          </div>
        </section>
      )}
      <Verse text={t('verse.text')} attr={t('verse.attr')} />
    </div>
  );
};

export default InsightsView;

