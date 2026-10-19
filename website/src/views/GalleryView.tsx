import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Plus, Camera, ArrowRight } from 'lucide-react';
import { updatePageSEO } from '../utils/seo';
import { Verse } from '../components/Verse';

interface GalleryViewProps {
  onOpenConcierge?: () => void;
}

// Maps the internal (English, logic-only) category identifiers used for
// filtering to their translation keys under `categories`.
const CATEGORY_KEYS: Record<string, string> = {
  'All': 'all',
  'Warm Family Moments': 'warmFamilyMoments',
  'Caregivers & Helping Hands': 'caregivers',
  'Floral Tributes': 'floralTributes',
  'Peaceful Environments': 'peacefulEnvironments',
  'Sanctuary Features': 'sanctuaryFeatures',
};

export const GalleryView: React.FC<GalleryViewProps> = ({ onOpenConcierge }) => {
  const { t } = useTranslation('gallery');
  const categoryLabel = (cat: string) => t(`categories.${CATEGORY_KEYS[cat] ?? 'all'}`);

  useEffect(() => {
    updatePageSEO(
      t('seo.title'),
      t('seo.description')
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedMedia, setSelectedMedia] = useState<{
    id: number;
    title: string;
    category: string;
    url: string;
    caption: string;
    aspectRatio: string;
    spanClass: string;
  } | null>(null);

  const [visibleCount, setVisibleCount] = useState<number>(12);

  const galleryItems = [
    // ROW 1
    {
      id: 1,
      title: t('items.item1.title'),
      category: 'Floral Tributes',
      url: '/assets/gallery_floral_arrangements.png',
      caption: t('items.item1.caption'),
      aspectRatio: 'aspect-[4/5]',
      spanClass: 'col-span-12 md:col-span-3',
    },
    {
      id: 2,
      title: t('items.item2.title'),
      category: 'Caregivers & Helping Hands',
      url: '/assets/gallery_staff_preparation.png',
      caption: t('items.item2.caption'),
      aspectRatio: 'aspect-[16/9]',
      spanClass: 'col-span-12 md:col-span-6',
    },
    {
      id: 3,
      title: t('items.item3.title'),
      category: 'Warm Family Moments',
      url: '/assets/gallery_respectful_service.png',
      caption: t('items.item3.caption'),
      aspectRatio: 'aspect-[3/4]',
      spanClass: 'col-span-12 md:col-span-3',
    },

    // ROW 2
    {
      id: 4,
      title: t('items.item4.title'),
      category: 'Floral Tributes',
      url: '/assets/eternal_floral_procession.png',
      caption: t('items.item4.caption'),
      aspectRatio: 'aspect-[4/3]',
      spanClass: 'col-span-12 md:col-span-4',
    },
    {
      id: 5,
      title: t('items.item5.title'),
      category: 'Caregivers & Helping Hands',
      url: '/assets/vehicle_real/WhatsApp Image 2026-07-23 at 13.43.13.jpeg',
      caption: t('items.item5.caption'),
      aspectRatio: 'aspect-[4/3]',
      spanClass: 'col-span-12 md:col-span-4',
    },
    {
      id: 6,
      title: t('items.item6.title'),
      category: 'Warm Family Moments',
      url: '/assets/vehicle_real/WhatsApp Image 2026-07-23 at 13.43.01.jpeg',
      caption: t('items.item6.caption'),
      aspectRatio: 'aspect-[4/3]',
      spanClass: 'col-span-12 md:col-span-4',
    },

    // ROW 3
    {
      id: 7,
      title: t('items.item7.title'),
      category: 'Peaceful Environments',
      url: '/assets/eternal_bier_sanctuary.png',
      caption: t('items.item7.caption'),
      aspectRatio: 'aspect-[16/9]',
      spanClass: 'col-span-12 md:col-span-6',
    },
    {
      id: 8,
      title: t('items.item8.title'),
      category: 'Peaceful Environments',
      url: '/assets/eternal_ceremonial_exterior_1.png',
      caption: t('items.item8.caption'),
      aspectRatio: 'aspect-[16/9]',
      spanClass: 'col-span-12 md:col-span-6',
    },

    // ROW 4
    {
      id: 9,
      title: t('items.item9.title'),
      category: 'Peaceful Environments',
      url: '/assets/eternal_glass_sanctuary.png',
      caption: t('items.item9.caption'),
      aspectRatio: 'aspect-[4/3]',
      spanClass: 'col-span-12 md:col-span-4',
    },
    {
      id: 10,
      title: t('items.item10.title'),
      category: 'Peaceful Environments',
      url: '/assets/eternal_luxury_interior_1.png',
      caption: t('items.item10.caption'),
      aspectRatio: 'aspect-[4/3]',
      spanClass: 'col-span-12 md:col-span-4',
    },
    {
      id: 11,
      title: t('items.item11.title'),
      category: 'Peaceful Environments',
      url: '/assets/vehicle_view_front_34.png',
      caption: t('items.item11.caption'),
      aspectRatio: 'aspect-[4/3]',
      spanClass: 'col-span-12 md:col-span-4',
    },
    {
      id: 12,
      title: t('items.item12.title'),
      category: 'Sanctuary Features',
      url: '/assets/vehicle_view_rear_34.png',
      caption: t('items.item12.caption'),
      aspectRatio: 'aspect-[16/9]',
      spanClass: 'col-span-12 md:col-span-12',
    },
  ];

  const categories = [
    'All',
    'Warm Family Moments',
    'Caregivers & Helping Hands',
    'Floral Tributes',
    'Peaceful Environments',
    'Sanctuary Features',
  ];

  const filteredItems =
    activeCategory === 'All'
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeCategory);

  const displayedItems = filteredItems.slice(0, visibleCount);

  return (
    <div className="pt-28 pb-28 bg-[#181818] text-ivory min-h-screen space-y-0">
      
      {/* HEADER SECTION (Matching Reference Screenshot Header Style) */}
      <section className="pt-10 pb-12 px-6 md:px-12 max-w-7xl mx-auto text-left">
        <div>
          {/* Category Filter Underlined Tabs Header (Single Line Horizontal Layout) */}
          <div className="flex items-center gap-6 sm:gap-8 pt-2 border-b border-white/10 pb-4 overflow-x-auto whitespace-nowrap custom-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setVisibleCount(12);
                }}
                className={`text-lg sm:text-xl md:text-2xl font-serif font-bold transition-all duration-300 cursor-pointer relative shrink-0 whitespace-nowrap pb-1 ${
                  activeCategory === cat
                    ? 'text-white'
                    : 'text-[#7A7A7A] hover:text-[#C5C5C5]'
                }`}
              >
                <span>{categoryLabel(cat)}</span>
                {activeCategory === cat && (
                  <motion.div
                    layoutId="activeUnderline"
                    className="absolute -bottom-[17px] left-0 right-0 h-[3px] bg-white rounded-full"
                  />
                )}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* MOSAIC PHOTO GRID (Matching Reference Screenshot Layout & Grid Dimensions) */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-5 sm:gap-6 items-center">
          {displayedItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              onClick={() => setSelectedMedia(item)}
              className={`${item.spanClass} cursor-pointer overflow-hidden group relative bg-[#111111] transition-all duration-500 hover:shadow-2xl`}
            >
              <div className={`relative ${item.aspectRatio} w-full overflow-hidden`}>
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                />
                
                {/* Subtle Hover Shadow Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-left">
                  <span className="text-[10px] text-gold uppercase tracking-widest block mb-1">
                    {categoryLabel(item.category)}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-white leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-ivory/80 font-light truncate mt-0.5">
                    {item.caption}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CENTERED "+ LOAD MORE" BUTTON (Matching Reference Screenshot Button Style) */}
        {visibleCount < filteredItems.length && (
          <div className="mt-16 text-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 6)}
              className="px-10 py-3.5 bg-[#262626] border border-[#383838] text-[#D0D0D0] hover:text-white hover:border-gold hover:bg-[#333333] text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-gold" />
              <span>{t('loadMore')}</span>
            </button>
          </div>
        )}
      </section>

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedMedia && (
          <div className="fixed inset-0 z-50 bg-deep-brown/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-4xl w-full bg-[#1C1C1C] text-ivory rounded-xs overflow-hidden border border-gold/30 shadow-2xl"
            >
              <button
                onClick={() => setSelectedMedia(null)}
                className="absolute top-4 right-4 z-10 p-2 text-ivory/70 hover:text-gold bg-deep-brown/60 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="relative aspect-[16/9] bg-deep-brown flex items-center justify-center border-b border-gold/20">
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.title}
                  className="max-h-full max-w-full object-contain p-2"
                />
              </div>

              <div className="p-6 md:p-8 border-t border-gold/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#1C1C1C]">
                <div className="space-y-1 text-left">
                  <span className="text-[10px] text-gold uppercase tracking-widest">
                    {categoryLabel(selectedMedia.category)}
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-ivory">{selectedMedia.title}</h3>
                  <p className="text-xs text-ivory/80 font-light max-w-xl leading-relaxed">{selectedMedia.caption}</p>
                </div>
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="px-6 py-2.5 bg-gold text-ivory text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-white hover:text-charcoal transition-colors shrink-0 cursor-pointer shadow-md"
                >
                  {t('lightbox.closeViewer')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <Verse text={t('verse.text')} attr={t('verse.attr')} />
    </div>
  );
};

export default GalleryView;



