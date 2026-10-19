// Shared Tailwind class recipes for the wizard steps — mirrors the exact
// patterns already used in PreBookingSection.tsx / ConciergeModal.tsx so
// this section feels native to the site, not bolted on.
export const inputCls =
  'w-full px-4 py-3 bg-ivory border border-gold/25 rounded-xs text-sm text-deep-brown placeholder:text-charcoal/40 focus:outline-hidden focus:border-gold focus:ring-1 focus:ring-gold/40 transition-colors';
export const labelCls = 'block text-[11px] uppercase tracking-[0.16em] font-semibold text-deep-brown mb-1.5';
export const primaryBtnCls =
  'px-6 py-3.5 bg-deep-brown text-ivory text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-gold transition-all duration-300 inline-flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-60 disabled:cursor-not-allowed';
export const secondaryBtnCls =
  'px-6 py-3.5 bg-white border border-gold/30 text-deep-brown text-xs font-bold uppercase tracking-wider rounded-xs hover:border-gold transition-all duration-300 inline-flex items-center justify-center gap-2 cursor-pointer';
export const stepEyebrowCls = 'text-[11px] uppercase tracking-[0.25em] text-gold font-semibold block mb-2';
export const stepTitleCls = 'font-serif text-2xl md:text-3xl font-semibold text-deep-brown mb-2';
export const stepSubtitleCls = 'text-sm md:text-base text-charcoal/70 font-light leading-relaxed mb-7';
