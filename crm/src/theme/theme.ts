import { useSyncExternalStore } from 'react';

export interface ThemeOption {
  id: string;
  label: string;
  /** Three colours shown on the picker: page, surface, accent. */
  swatch: [string, string, string];
}

export const THEMES: ThemeOption[] = [
  { id: 'classic', label: 'Classic', swatch: ['#F8F6F1', '#FFFFFF', '#3E5444'] },
  { id: 'dark', label: 'Dark', swatch: ['#121513', '#1C211E', '#4F8A5E'] },
  { id: 'ocean', label: 'Ocean', swatch: ['#F5F8FB', '#FFFFFF', '#2A5F8C'] },
  { id: 'sunset', label: 'Sunset', swatch: ['#FBF6F1', '#FFFFFF', '#8C4729'] },
  { id: 'lavender', label: 'Lavender', swatch: ['#F7F5FB', '#FFFFFF', '#553C9A'] },
];

const KEY = 'er-crm-theme';
const EVENT = 'er-crm-theme-change';

const read = (): string => {
  try {
    const saved = localStorage.getItem(KEY);
    return THEMES.some((t) => t.id === saved) ? (saved as string) : 'classic';
  } catch {
    return 'classic';
  }
};

/** Puts the saved theme on the page. Called once before the app draws, so there is no flash of the wrong colours. */
export function applyStoredTheme() {
  document.documentElement.dataset.theme = read();
}

export function setTheme(id: string) {
  if (!THEMES.some((t) => t.id === id)) return;
  document.documentElement.dataset.theme = id;
  try { localStorage.setItem(KEY, id); } catch { /* the choice lasts for this visit only */ }
  window.dispatchEvent(new Event(EVENT));
}

const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
};

export const useTheme = () => ({ theme: useSyncExternalStore(subscribe, read, () => 'classic'), setTheme });
