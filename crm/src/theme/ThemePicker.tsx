import { useEffect, useRef, useState } from 'react';
import { THEMES, useTheme, type ThemeOption } from './theme';

const Swatch = ({ t }: { t: ThemeOption }) => (
  <span style={{ display: 'inline-flex', width: 28, height: 18, borderRadius: 999, overflow: 'hidden', border: '1px solid var(--border-medium)', flex: 'none' }} aria-hidden>
    <span style={{ flex: 1, background: t.swatch[0] }} /><span style={{ flex: 1, background: t.swatch[1] }} /><span style={{ flex: 1, background: t.swatch[2] }} />
  </span>
);

/** A drop-down to change the colours of the whole CRM. Each choice shows its three colours. */
export function ThemePicker({ withLabels }: { withLabels?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', esc); };
  }, [open]);

  return (
    <div ref={box} data-notranslate style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Theme: ${current.label}`}
        title="Change theme"
        onClick={() => setOpen(!open)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 10px', minHeight: 34, cursor: 'pointer', borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', color: 'var(--ink-primary)', fontSize: '0.82rem', fontWeight: 600 }}
      >
        <Swatch t={current} />
        {withLabels ? current.label : <span style={{ fontWeight: 500 }}>Theme</span>}
        <span aria-hidden style={{ fontSize: '0.7rem', color: 'var(--ink-muted)' }}>▾</span>
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="Themes"
          style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', zIndex: 60, margin: 0, padding: 6, listStyle: 'none', minWidth: 180, background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-medium)', borderRadius: 10, boxShadow: 'var(--shadow-lg)' }}
        >
          {THEMES.map((t) => (
            <li key={t.id} role="option" aria-selected={t.id === theme}>
              <button
                type="button"
                onClick={() => { setTheme(t.id); setOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 10px', border: 0, borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem', color: 'var(--ink-primary)', background: t.id === theme ? 'var(--moss-100)' : 'transparent', fontWeight: t.id === theme ? 700 : 500 }}
              >
                <Swatch t={t} />
                <span style={{ flex: 1 }}>{t.label}</span>
                {t.id === theme && <span aria-hidden>✓</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
