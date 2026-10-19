// Third-party recognition. Single source of truth — nothing about an award is
// hardcoded in JSX. Publishing is fail-SAFE: an invalid or not-ready entry
// simply does not render (never throws), because this is a grief-context site
// and a white screen is worse than a hidden band.

export interface Award {
  title: string;      // the category, VERBATIM from the certificate / organiser
  recipient: string;
  presenter: string;  // e.g. 'ET NOW'
  event: string;
  edition: string;
  date: string;       // ISO ceremony date
  logo: string;       // must be hosted under /assets/ (never hotlinked)
  url: string;        // the ONE linkable source article substantiating it
  noteHref?: string;  // internal thank-you note
  liveFrom: string;   // ISO — earliest it MAY be published (ceremony date)
  ready: boolean;     // manual latch — do we WANT it published now
}

export const ETNOW_AWARD: Award = {
  // Verbatim category — do not paraphrase.
  title: 'Excellence in Creating Dignified Farewell Journeys',
  recipient: 'Eternal Repos',
  presenter: 'ET NOW',
  event: 'ETNow.in Business Conclave & Awards 2026',
  edition: 'West Edition',
  date: '2026-08-25',
  logo: '/assets/etnow-conclave-2026.png',
  url: 'https://www.etnownews.com/news/etnow-in-business-conclave-awards-2026-west-edition-full-list-of-winners-article-155990225',
  noteHref: '/a-word-of-trust',
  liveFrom: '2026-08-25',
  ready: true, // LIVE — logo hosted, note published; awaiting post-launch sign-off
};

// Fail-safe gate: returns true only when it is safe to show.
export function isAwardPublishable(a: Award, now: Date): boolean {
  if (!a || !a.ready) return false;
  if (!a.title || !a.recipient || !a.presenter) return false;
  if (!a.url || !/^https:\/\//.test(a.url)) return false;   // linkable-source rule
  if (!a.logo || !a.logo.startsWith('/assets/')) return false; // hosted, not hotlinked
  const live = new Date(a.liveFrom);
  if (Number.isNaN(live.getTime())) return false;
  if (now < live) return false;                              // date gate
  return true;
}

// Dev-only sanity warnings (never throws in production).
if (import.meta.env.DEV) {
  const a = ETNOW_AWARD;
  const problems: string[] = [];
  if (!a.title) problems.push('empty title');
  if (!/^https:\/\//.test(a.url)) problems.push('url must be a real https article');
  if (!a.logo.startsWith('/assets/')) problems.push('logo must be hosted under /assets/');
  if (Number.isNaN(new Date(a.liveFrom).getTime())) problems.push('liveFrom is not a valid date');
  if (problems.length) console.warn('[awards] check ETNOW_AWARD:', problems.join('; '));
}
