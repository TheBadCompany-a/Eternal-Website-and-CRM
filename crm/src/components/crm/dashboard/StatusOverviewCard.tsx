import { useState } from 'react';
import type { Arrangement } from '../../../types';
import { CaseListModal } from './CaseListModal';

export function StatusOverviewCard({ arrangements }: { arrangements: Arrangement[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const stats: { label: string; color: string; items: Arrangement[] }[] = [
    { label: 'New Inquiry', color: 'var(--blue-600)', items: arrangements.filter((a) => a.status === 'New Inquiry') },
    {
      label: 'Coord. Review',
      color: 'var(--amber-700)',
      items: arrangements.filter((a) => a.status === 'Plan Review' || a.status === 'Contacted'),
    },
    { label: 'Confirmed', color: 'var(--moss-700)', items: arrangements.filter((a) => a.status === 'Confirmed') },
    { label: 'In Progress', color: '#553C9A', items: arrangements.filter((a) => a.status === 'In Execution') },
    { label: 'Completed', color: 'var(--ink-muted)', items: arrangements.filter((a) => a.status === 'Completed') },
  ];
  const selected = stats.find((s) => s.label === open);

  return (
    <div className="crm-section-card">
      <div className="crm-card-header">
        <h3>1 &amp; 2. Arrangements Overview &amp; Status</h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, textAlign: 'center' }}>
        {stats.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => setOpen(s.label)}
            aria-label={`${s.label}: ${s.items.length}. Show the list`}
            style={{
              background: 'var(--bg-sand-light)',
              padding: 12,
              borderRadius: 6,
              border: '1px solid var(--border-delicate)',
              cursor: 'pointer',
              font: 'inherit',
            }}
          >
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: s.color }}>{s.items.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>{s.label}</div>
          </button>
        ))}
      </div>
      <CaseListModal title={selected ? selected.label : null} items={selected?.items ?? []} onClose={() => setOpen(null)} />
    </div>
  );
}
