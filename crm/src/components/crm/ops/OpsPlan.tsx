import { useMemo, useState } from 'react';
import type { DriverTaskView } from '../../../data/useDriverTasks';
import { todayIso } from '../../../data/useHr';
import { useToast } from '../../../toast/useToast';
import { dateLabel, isAssigned, isOpsCase, serviceAt, timeLabel, type OpsContext } from '../../../lib/opsLogic';

const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);
const rupees = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export function OpsPlan({ ctx, board }: { ctx: OpsContext; board: Map<string, DriverTaskView> | undefined }) {
  const { showToast } = useToast();
  const [day, setDay] = useState(() => addDays(todayIso(), 1));

  const jobs = useMemo(
    () => ctx.cases.filter((a) => isOpsCase(a) && a.status !== 'Completed' && a.date === day).sort((x, y) => (serviceAt(x)?.getTime() ?? 0) - (serviceAt(y)?.getTime() ?? 0)),
    [ctx.cases, day],
  );

  const text = [
    `Schedule for ${dateLabel(day)}`,
    '',
    ...(jobs.length === 0 ? ['No services planned.'] : jobs.map((a, i) =>
      `${i + 1}. ${timeLabel(a)} · ${a.id} · ${a.family}\n   ${a.pickupLocation} → ${a.destinationLocation}\n   Driver: ${isAssigned(a.driver) ? a.driver : 'NOT ASSIGNED'} · Vehicle: ${isAssigned(a.vehicle) ? a.vehicle : 'NOT ASSIGNED'}${a.phone ? `\n   Family: ${a.phone}` : ''}`)),
  ].join('\n');

  const copy = async () => {
    try { await navigator.clipboard.writeText(text); showToast('Schedule copied.', 'info'); } catch { showToast('Could not copy. Use Print instead.', 'info'); }
  };
  const print = () => {
    const w = window.open('', '_blank', 'noopener');
    if (!w) return showToast('Allow pop-ups to print.', 'info');
    w.document.write(`<title>Schedule ${esc(dateLabel(day))}</title><body style="font-family:sans-serif;padding:24px"><h2>Schedule for ${esc(dateLabel(day))}</h2><pre style="font:15px/1.6 sans-serif;white-space:pre-wrap">${esc(text.split('\n').slice(2).join('\n'))}</pre></body>`);
    w.document.close();
    w.print();
  };

  // Reports over everything on record.
  const stats = useMemo(() => {
    const finished = ctx.cases.filter((a) => a.status === 'Completed');
    const withArrival = ctx.cases.map((a) => ({ a, t: board?.get(a.id)?.task })).filter((x) => x.t?.arrival_at && serviceAt(x.a));
    const onTime = withArrival.filter((x) => new Date(x.t!.arrival_at as string).getTime() <= (serviceAt(x.a)!.getTime() + 15 * 60000)).length;
    const count = (key: 'driver' | 'vehicle') => {
      const m = new Map<string, number>();
      ctx.cases.filter(isOpsCase).forEach((a) => { if (isAssigned(a[key])) m.set(a[key], (m.get(a[key]) ?? 0) + 1); });
      return [...m.entries()].sort((x, y) => y[1] - x[1]);
    };
    const spends = [...(board?.values() ?? [])].filter((v) => v.expenseTotal > 0);
    return {
      finished: finished.length,
      onTimePct: withArrival.length ? Math.round((onTime / withArrival.length) * 100) : null,
      measured: withArrival.length,
      drivers: count('driver'),
      vehicles: count('vehicle'),
      avgSpend: spends.length ? spends.reduce((s, v) => s + v.expenseTotal, 0) / spends.length : null,
    };
  }, [ctx.cases, board]);

  const bar = (rows: [string, number][]) => {
    const max = Math.max(1, ...rows.map((r) => r[1]));
    return rows.length === 0 ? <p className="leads-empty">Nothing assigned yet.</p> : (
      <div style={{ display: 'grid', gap: 8 }}>
        {rows.map(([name, n]) => (
          <div key={name} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 28px', gap: 10, alignItems: 'center', fontSize: '0.85rem' }}>
            <span>{name}</span>
            <div style={{ background: 'var(--bg-sand)', borderRadius: 999, height: 10 }}><div style={{ width: `${(n / max) * 100}%`, background: '#8fb08f', height: 10, borderRadius: 999 }} /></div>
            <strong>{n}</strong>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <section className="crm-section-card" style={{ marginBottom: 0 }}>
        <div className="crm-card-header">
          <div><h3>Daily plan</h3><p className="comms-help" style={{ margin: 0 }}>Send tomorrow’s schedule to drivers and the office.</p></div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <button className="btn btn-sm btn-secondary" type="button" onClick={() => setDay(addDays(todayIso(), 0))}>Today</button>
            <button className="btn btn-sm btn-secondary" type="button" onClick={() => setDay(addDays(todayIso(), 1))}>Tomorrow</button>
            <input className="form-input" type="date" aria-label="Day" style={{ maxWidth: 170 }} value={day} onChange={(e) => e.target.value && setDay(e.target.value)} />
          </div>
        </div>
        {jobs.length === 0 ? (
          <p className="leads-empty">No confirmed services on {dateLabel(day)}.</p>
        ) : (
          <div className="crm-table-wrapper">
            <table className="crm-table">
              <thead><tr><th>Time</th><th>Case</th><th>Route</th><th>Driver</th><th>Vehicle</th><th>Family phone</th></tr></thead>
              <tbody>
                {jobs.map((a) => (
                  <tr key={a.id}>
                    <td style={{ whiteSpace: 'nowrap' }}><strong>{timeLabel(a)}</strong></td>
                    <td>{a.id}<div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>{a.family}</div></td>
                    <td>{a.pickupLocation} → {a.destinationLocation}</td>
                    <td style={{ color: isAssigned(a.driver) ? undefined : '#b3261e' }}>{isAssigned(a.driver) ? a.driver : 'Not assigned'}</td>
                    <td style={{ color: isAssigned(a.vehicle) ? undefined : '#b3261e' }}>{isAssigned(a.vehicle) ? a.vehicle : 'Not assigned'}</td>
                    <td>{a.phone || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
          <a className="btn btn-primary" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer noopener">Share on WhatsApp ↗</a>
          <button className="btn btn-secondary" type="button" onClick={() => void copy()}>Copy</button>
          <button className="btn btn-secondary" type="button" onClick={print}>Print</button>
        </div>
      </section>

      <section className="crm-section-card" style={{ marginBottom: 0 }}>
        <div className="crm-card-header"><h3>How operations are going</h3></div>
        <div className="ops-tiles" style={{ marginBottom: 18 }}>
          <div className="ops-tile"><strong style={{ fontSize: '1.6rem' }}>{stats.finished}</strong><span>Services completed</span></div>
          <div className="ops-tile"><strong style={{ fontSize: '1.6rem' }}>{stats.onTimePct === null ? '—' : `${stats.onTimePct}%`}</strong><span>Arrived on time{stats.measured ? ` (${stats.measured} jobs)` : ''}</span></div>
          <div className="ops-tile"><strong style={{ fontSize: '1.6rem' }}>{stats.avgSpend === null ? '—' : rupees(stats.avgSpend)}</strong><span>Driver expenses per job</span></div>
        </div>
        <div className="ops-grid-2" style={{ gap: 24 }}>
          <div><h4 style={{ marginTop: 0 }}>Jobs per driver</h4>{bar(stats.drivers)}</div>
          <div><h4 style={{ marginTop: 0 }}>Jobs per vehicle</h4>{bar(stats.vehicles)}</div>
        </div>
        <p className="comms-help" style={{ marginTop: 14 }}>“On time” means the driver marked Arrived within 15 minutes of the service time.</p>
      </section>
    </div>
  );
}
