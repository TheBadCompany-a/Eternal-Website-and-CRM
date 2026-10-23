import { createContext, useCallback, useContext, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { HI } from './hindi';

export type Lang = 'en' | 'hi';
const STORAGE_KEY = 'er-crm-language';
const ATTRS = ['placeholder', 'title', 'aria-label'] as const;

const read = (): Lang => {
  try { return localStorage.getItem(STORAGE_KEY) === 'hi' ? 'hi' : 'en'; } catch { return 'en'; }
};

/** Counters such as "8/8 done" that change with the data, so they cannot be listed word for word. */
const counter = (text: string): string | undefined => {
  const m = /^(\d+)\/(\d+) done$/.exec(text);
  return m ? `${m[1]}/${m[2]} पूर्ण` : undefined;
};

/** Looks a piece of text up in the Hindi list, keeping surrounding spaces. Returns the input if there is no match. */
export function translateText(text: string): string {
  const core = text.trim();
  if (!core) return text;
  const at = text.indexOf(core);
  const wrap = (v: string) => text.slice(0, at) + v + text.slice(at + core.length);
  const direct = HI[core] ?? HI[core.replace(/\s*[:：]$/, '')] ?? counter(core);
  if (direct) return wrap(direct);
  // "Came from: Website · Customised package · 98765…" and similar: translate each piece on its own.
  const pieces = core.split(/( · |: )/);
  if (pieces.length > 1) {
    let changed = false;
    const out = pieces.map((piece, i) => {
      if (i % 2 === 1) return piece;
      const hit = HI[piece.trim()] ?? counter(piece.trim());
      if (!hit) return piece;
      changed = true;
      return hit;
    });
    if (changed) return wrap(out.join(''));
  }
  return text;
}

interface Ctx { lang: Lang; setLang: (l: Lang) => void }
const LanguageContext = createContext<Ctx>({ lang: 'en', setLang: () => undefined });
// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => useContext(LanguageContext);

const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'CODE']);
const shouldSkip = (el: Element | null) => !el || SKIP.has(el.tagName) || Boolean(el.closest('[data-notranslate]'));

/** Swaps text on screen between English and Hindi without touching the components. English is always the original. */
function useScreenTranslator(lang: Lang) {
  useEffect(() => {
    document.documentElement.lang = lang;
    const texts = new WeakMap<Text, { shown: string; original: string }>();

    const doText = (n: Text) => {
      if (shouldSkip(n.parentElement)) return;
      const rec = texts.get(n);
      const v = n.nodeValue ?? '';
      if (rec && v === rec.shown) return;
      const hi = translateText(v);
      if (hi !== v) { texts.set(n, { shown: hi, original: v }); n.nodeValue = hi; } else texts.delete(n);
    };
    const doAttrs = (el: Element) => {
      if (shouldSkip(el)) return;
      for (const a of ATTRS) {
        const v = el.getAttribute(a);
        if (!v) continue;
        const store = `data-en-${a}`;
        const original = el.getAttribute(store);
        if (original !== null && translateText(original) === v) continue;
        const hi = translateText(v);
        if (hi !== v) { el.setAttribute(store, v); el.setAttribute(a, hi); } else el.removeAttribute(store);
      }
    };
    const walk = (root: Node) => {
      if (root.nodeType === Node.TEXT_NODE) return doText(root as Text);
      if (root.nodeType !== Node.ELEMENT_NODE) return;
      doAttrs(root as Element);
      const tw = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
      for (let n = tw.nextNode(); n; n = tw.nextNode()) {
        if (n.nodeType === Node.TEXT_NODE) doText(n as Text); else doAttrs(n as Element);
      }
    };
    const restore = () => {
      const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
      for (let n = tw.nextNode(); n; n = tw.nextNode()) {
        if (n.nodeType === Node.TEXT_NODE) {
          const rec = texts.get(n as Text);
          if (rec && (n as Text).nodeValue === rec.shown) (n as Text).nodeValue = rec.original;
        } else {
          const el = n as Element;
          for (const a of ATTRS) {
            const original = el.getAttribute(`data-en-${a}`);
            if (original !== null) { el.setAttribute(a, original); el.removeAttribute(`data-en-${a}`); }
          }
        }
      }
    };

    if (lang !== 'hi') return;
    walk(document.body);
    const observer = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === 'characterData') doText(r.target as Text);
        else if (r.type === 'attributes') doAttrs(r.target as Element);
        else r.addedNodes.forEach(walk);
      }
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: [...ATTRS] });
    return () => { observer.disconnect(); restore(); };
  }, [lang]);
}


export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(read);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* private window: the choice lasts for this visit */ }
  }, []);
  useScreenTranslator(lang);
  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

/** English | हिन्दी switch, shown on every panel and on the login pages. */
export function LanguageToggle({ style }: { style?: CSSProperties }) {
  const { lang, setLang } = useLanguage();
  const btn = (l: Lang, label: string) => (
    <button
      key={l}
      type="button"
      aria-pressed={lang === l}
      onClick={() => setLang(l)}
      style={{ flex: 1, padding: '6px 12px', border: 0, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, background: lang === l ? 'var(--ink-primary, #2a2a2a)' : 'transparent', color: lang === l ? 'var(--bg-surface, #fff)' : 'var(--ink-secondary, #555)' }}
    >
      {label}
    </button>
  );
  return (
    <div role="group" aria-label="Language" data-notranslate style={{ display: 'inline-flex', border: '1px solid var(--border-medium, #ccc)', borderRadius: 8, overflow: 'hidden', ...style }}>
      {btn('en', 'English')}
      {btn('hi', 'हिन्दी')}
    </div>
  );
}
