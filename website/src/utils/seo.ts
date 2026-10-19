const SITE = 'https://eternalrepos.com';

const canonicalUrl = (path?: string) => {
  const p = path ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
  if (p === '/' || p === '') return `${SITE}/`;
  return SITE + '/' + p.replace(/^\/+/, '').replace(/\/+$/, '');
};

const upsertMeta = (attr: 'name' | 'property', key: string, content: string) => {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

/**
 * Update per-route SEO. Keeps title + description in sync, and also refreshes
 * the canonical link and the Open Graph / Twitter title, description and url
 * so shares and JS-rendering crawlers see the correct per-page values.
 * `path` is optional — defaults to the current location.
 */
export const updatePageSEO = (title: string, description: string, path?: string) => {
  document.title = title;
  const url = canonicalUrl(path);

  upsertMeta('name', 'description', description);

  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = url;

  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:description', description);
  upsertMeta('property', 'og:url', url);
  upsertMeta('name', 'twitter:title', title);
  upsertMeta('name', 'twitter:description', description);
};

/** Set (or clear, on unmount) a page-level robots directive — used by pages
 * that should never be indexed, e.g. the 404 catch-all. */
export const setRobotsMeta = (content: string | null) => {
  const existing = document.head.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
  if (content === null) {
    existing?.remove();
    return;
  }
  upsertMeta('name', 'robots', content);
};

/**
 * Inject or replace a per-page JSON-LD block, keyed by id so repeated calls
 * (and route changes) update in place rather than stacking duplicates.
 */
export const setStructuredData = (id: string, data: object) => {
  const elId = `ld-${id}`;
  let s = document.getElementById(elId) as HTMLScriptElement | null;
  if (!s) {
    s = document.createElement('script');
    s.type = 'application/ld+json';
    s.id = elId;
    document.head.appendChild(s);
  }
  s.textContent = JSON.stringify(data);
};

/** Remove a per-page JSON-LD block on unmount so it doesn't leak across routes. */
export const clearStructuredData = (id: string) => {
  const s = document.getElementById(`ld-${id}`);
  if (s) s.remove();
};
