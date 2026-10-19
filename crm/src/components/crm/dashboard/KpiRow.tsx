import { useState } from 'react';
import type { Arrangement } from '../../../types';
import { CaseListModal } from './CaseListModal';

export function KpiRow({ arrangements }: { arrangements: Arrangement[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const latestDate = arrangements.reduce((max, a) => (a.date > max ? a.date : max), arrangements[0]?.date ?? '');

  const kpis: { label: string; alert: boolean; items: Arrangement[] }[] = [
    { label: 'Active Arrangements', alert: false, items: arrangements.filter((a) => a.status !== 'Completed') },
    {
      label: 'Immediate Requests',
      alert: true,
      items: arrangements.filter((a) => a.needCategory === 'Immediate Arrangement' && a.status !== 'Completed'),
    },
    { label: 'Upcoming Today', alert: false, items: arrangements.filter((a) => a.date === latestDate) },
    { label: 'Services In Progress', alert: false, items: arrangements.filter((a) => a.status === 'In Execution') },
    { label: 'Completed Today', alert: false, items: arrangements.filter((a) => a.status === 'Completed') },
    { label: 'Pending Payments', alert: false, items: arrangements.filter((a) => a.paymentStatus !== 'Receipt Generated') },
  ];
  const selected = kpis.find((k) => k.label === open);

  return (
    <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
      {kpis.map((k) => (
        <button
          key={k.label}
          type="button"
          onClick={() => setOpen(k.label)}
          aria-label={`${k.label}: ${k.items.length}. Show the list`}
          className={`kpi-stat-card ${k.alert ? 'alert-stat' : ''}`}
          style={{ cursor: 'pointer', textAlign: 'left', font: 'inherit' }}
        >
          <div className="kpi-num">{k.items.length}</div>
          <div className="kpi-label">{k.label}</div>
        </button>
      ))}
      <CaseListModal title={selected ? selected.label : null} items={selected?.items ?? []} onClose={() => setOpen(null)} />
    </div>
  );
}
