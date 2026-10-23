import { useState } from 'react';
import type { Arrangement } from '../../../types';
import { CaseListModal } from './CaseListModal';
import { todayIso } from '../../../data/useHr';
import { amountDue, isBooked } from '../../../lib/caseStatus';
import { isNonDispatchService } from '../../../lib/opsLogic';
import { categoryOf } from '../../../lib/paymentCategory';

export function KpiRow({ arrangements }: { arrangements: Arrangement[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const today = todayIso();

  const kpis: { label: string; alert: boolean; items: Arrangement[] }[] = [
    // Services the family has accepted and that are not finished yet.
    { label: 'Active Arrangements', alert: false, items: arrangements.filter((a) => isBooked(a) && a.status !== 'Completed') },
    {
      label: 'Immediate Requests',
      alert: true,
      items: arrangements.filter((a) => a.needCategory === 'Immediate Arrangement' && a.status !== 'Completed'),
    },
    { label: 'Upcoming Today', alert: false, items: arrangements.filter((a) => a.date === today && (a.status === 'Confirmed' || a.status === 'In Execution')) },
    { label: 'Services In Progress', alert: false, items: arrangements.filter((a) => a.status === 'In Execution') },
    { label: 'Completed Today', alert: false, items: arrangements.filter((a) => a.status === 'Completed' && a.date === today && !isNonDispatchService(a.serviceType)) },
    // A balance still to collect on a booked service or star, including services already completed.
    { label: 'Pending Payments', alert: false, items: arrangements.filter((a) => (isBooked(a) || categoryOf(a) === 'star') && amountDue(a) > 0) },
  ];
  const selected = kpis.find((k) => k.label === open);

  return (
    <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
      {kpis.map((k) => (
        <button
          key={k.label}
          type="button"
          onClick={() => setOpen(open === k.label ? null : k.label)}
          aria-label={`${k.label}: ${k.items.length}. Show the list below`}
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
