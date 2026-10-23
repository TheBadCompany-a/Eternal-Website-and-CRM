import { useMemo, useState } from 'react';
import type { Arrangement } from '../../../types';
import type { DriverTaskView } from '../../../data/useDriverTasks';
import {
  CHECKLIST_TOTAL, COLUMNS, checklistDone, columnOf, dateLabel, isAssigned, isOpsCase, minutesUntil, timeLabel, untilLabel,
  type OpsAlert, type OpsColumn, type OpsContext,
} from '../../../lib/opsLogic';
import { todayIso } from '../../../data/useHr';
import { ResourcePicker } from './ResourcePicker';

type When = 'today' | 'tomorrow' | 'week' | 'all';
const WHEN_LABEL: Record<When, string> = { today: 'Today', tomorrow: 'Tomorrow', week: 'Next 7 days', all: 'All dates' };

const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

interface Props {
  ctx: OpsContext;
  board: Map<string, DriverTaskView> | undefined;
  driverNames: string[];
  alerts: OpsAlert[];
  onOpen: (id: string) => void;
}

export function OpsBoard({ ctx, board, driverNames, alerts, onOpen }: Props) {
  const today = todayIso();
  const [when, setWhen] = useState<When>('week');
  const [search, setSearch] = useState('');
  const [driver, setDriver] = useState('');
  const [onlyColumn, setOnlyColumn] = useState<OpsColumn | ''>('');
  const [showEnquiries, setShowEnquiries] = useState(true);
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  const inRange = (a: Arrangement, done: boolean) => {
    if (when === 'all') return true;
    if (when === 'today') return a.date === today || (!done && a.date < today);
    if (when === 'tomorrow') return a.date === addDays(today, 1);
    return done ? a.date >= today && a.date <= addDays(today, 7) : a.date <= addDays(today, 7);
  };

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ctx.cases
      .filter((a) => showEnquiries || isOpsCase(a))
      .map((a) => ({ a, col: columnOf(a, board?.get(a.id)) }))
      .filter(({ a, col }) => inRange(a, col === 'done'))
      .filter(({ a }) => !driver || a.driver === driver)
      .filter(({ a }) => !q || [a.id, a.family, a.contactName, a.pickupLocation, a.destinationLocation, a.driver, a.vehicle].join(' ').toLowerCase().includes(q))
      .sort((x, y) => `${x.a.date} ${x.a.time}`.localeCompare(`${y.a.date} ${y.a.time}`));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.cases, board, when, search, driver, showEnquiries, today]);

  const count = (c: OpsColumn) => rows.filter((r) => r.col === c).length;
  const alertsFor = (id: string) => alerts.filter((x) => x.caseId === id);
  const shownAlerts = showAllAlerts ? alerts : alerts.slice(0, 4);

  const tile = (col: OpsColumn, label: string, tone?: string) => (
    <button type="button" className={`ops-tile ${onlyColumn === col ? 'active' : ''}`} onClick={() => setOnlyColumn(onlyColumn === col ? '' : col)} style={tone ? { borderColor: tone } : undefined}>
      <strong style={{ fontSize: '1.6rem', color: tone }}>{count(col)}</strong>
      <span>{label}</span>
    </button>
  );

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="ops-tiles">
        {tile('assign', 'Need driver or vehicle', count('assign') ? '#b3261e' : undefined)}
        {tile('ready', 'Ready')}
        {tile('transit', 'On the way')}
        {tile('done', 'Completed')}
      </div>

      {alerts.length > 0 && (
        <section className="crm-section-card" style={{ marginBottom: 0, borderColor: alerts.some((x) => x.level === 'red') ? '#e3b3b0' : '#e8d7a8' }}>
          <div className="crm-card-header" style={{ marginBottom: 8 }}>
            <h3>Needs attention ({alerts.length})</h3>
            {alerts.length > 4 && <button className="btn btn-sm btn-secondary" type="button" onClick={() => setShowAllAlerts(!showAllAlerts)}>{showAllAlerts ? 'Show fewer' : 'Show all'}</button>}
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            {shownAlerts.map((x) => (
              <div key={x.id} style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.88rem' }}>
                  <span aria-hidden>{x.level === 'red' ? '🔴' : '🟠'}</span> <strong>{x.caseId}</strong> · {x.family} — {x.text}
                </span>
                <button className="btn btn-sm btn-secondary" type="button" onClick={() => onOpen(x.caseId)}>Fix</button>
              </div>
            ))}
          </div>
        </section>
      )}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="lead-filter-tabs" role="tablist" aria-label="Date range" style={{ margin: 0 }}>
          {(Object.keys(WHEN_LABEL) as When[]).map((w) => (
            <button key={w} type="button" role="tab" aria-selected={when === w} className={when === w ? 'active' : ''} onClick={() => setWhen(w)}>{WHEN_LABEL[w]}</button>
          ))}
        </div>
        <input className="form-input" style={{ maxWidth: 240 }} placeholder="Search case, family, place…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="form-select" style={{ maxWidth: 200 }} aria-label="Driver" value={driver} onChange={(e) => setDriver(e.target.value)}>
          <option value="">All drivers</option>
          {driverNames.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <label style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={showEnquiries} onChange={(e) => setShowEnquiries(e.target.checked)} /> Include unconfirmed enquiries
        </label>
      </div>

      {rows.length === 0 && (
        <p className="leads-empty">
          No cases to show for {WHEN_LABEL[when].toLowerCase()}. Cases appear here once they are <strong>Confirmed</strong>
          {showEnquiries ? '.' : ', or tick “Include unconfirmed enquiries”.'}
        </p>
      )}

      <div className="ops-board">
        {COLUMNS.filter((c) => !onlyColumn || c.key === onlyColumn).map((c) => {
          const items = rows.filter((r) => r.col === c.key);
          return (
            <div key={c.key} className="ops-col">
              <div className="ops-col-head"><strong>{c.title}</strong><span>{items.length}</span></div>
              <div className="ops-col-hint">{c.hint}</div>
              {items.length === 0 && <div className="ops-empty">Nothing here</div>}
              {items.map(({ a, col }) => {
                const mins = minutesUntil(a);
                const flags = alertsFor(a.id);
                const done = checklistDone(a);
                return (
                  <article key={a.id} className={`ops-card ${flags.some((f) => f.level === 'red') ? 'red' : flags.length ? 'amber' : ''}`}>
                    <div className="ops-card-top">
                      <strong>{a.id}</strong>
                      <span>{dateLabel(a.date)} · {timeLabel(a)}{col !== 'done' && mins !== null && mins < 1440 ? ` · ${untilLabel(mins)}` : ''}</span>
                    </div>
                    <div style={{ fontWeight: 600 }}>{a.family}</div>
                    <div className="ops-route">{a.pickupLocation} → {a.destinationLocation}</div>
                    {col === 'assign' ? (
                      <ResourcePicker a={a} ctx={ctx} driverNames={driverNames} compact />
                    ) : (
                      <div className="ops-people">
                        <span>👤 {isAssigned(a.driver) ? a.driver : 'No driver'}</span>
                        <span>🚗 {isAssigned(a.vehicle) ? a.vehicle : 'No vehicle'}</span>
                      </div>
                    )}
                    {col !== 'done' && (
                      <div className="ops-progress" title={`Pre-service check ${done}/${CHECKLIST_TOTAL}`}>
                        <div style={{ width: `${(done / CHECKLIST_TOTAL) * 100}%` }} />
                        <span>Check {done}/{CHECKLIST_TOTAL}</span>
                      </div>
                    )}
                    {flags.map((f) => <div key={f.id} className={`ops-flag ${f.level}`}>{f.text}</div>)}
                    <button className="btn btn-sm btn-secondary" type="button" onClick={() => onOpen(a.id)}>Open case</button>
                  </article>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
