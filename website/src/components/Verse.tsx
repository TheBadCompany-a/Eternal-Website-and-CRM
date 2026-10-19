import React from 'react';
import { motion } from 'framer-motion';

interface VerseProps {
  text: string;
  attr?: string;
  className?: string;
}

export const Verse: React.FC<VerseProps> = ({ text, attr, className = '' }) => (
  <div className={`paper-light py-16 md:py-24 px-6 bg-ivory text-center overflow-hidden ${className}`}>
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-2xl mx-auto"
    >
      <span className="block w-px h-8 bg-gold/35 mx-auto mb-6" />
      <p className="font-serif italic text-2xl md:text-[28px] leading-relaxed text-deep-brown/90">&ldquo;{text}&rdquo;</p>
      {attr && (
        <p className="mt-4 text-[11px] uppercase tracking-[0.22em] font-semibold" style={{ color: '#B98C71' }}>{attr}</p>
      )}
    </motion.div>
  </div>
);

export default Verse;
