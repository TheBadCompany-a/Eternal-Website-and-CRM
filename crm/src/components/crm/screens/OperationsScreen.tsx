import { useState } from 'react';
import { useAppDispatch, useAppState } from '../../../state/useAppState';
import { useOps } from '../../../data/useOps';
import { OpsBoard } from '../ops/OpsBoard';
import { OpsCase } from '../ops/OpsCase';
import { OpsPlan } from '../ops/OpsPlan';

type Tab = 'board' | 'case' | 'plan';

/** Operations: a live board of every case, a detail view for one case, and the daily plan with reports. */
export function OperationsScreen() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { ctx, board, driverNames, profiles, alerts, loading, error } = useOps();
  const [tab, setTab] = useState<Tab>('board');

  const list = ctx.cases;
  const selected = list.find((a) => a.id === state.activeOpsCaseId) ?? list[0];
  const open = (id: string) => {
    dispatch({ type: 'SET_ACTIVE_OPS_CASE', caseId: id });
    setTab('case');
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'board', label: `Live board${alerts.length ? ` (${alerts.length} alert${alerts.length > 1 ? 's' : ''})` : ''}` },
    { key: 'case', label: 'One case' },
    { key: 'plan', label: 'Daily plan & reports' },
  ];

  return (
    <div className="crm-screen active">
      <div className="lead-filter-tabs" role="tablist" aria-label="Operations views" style={{ marginBottom: 18 }}>
        {tabs.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} className={tab === t.key ? 'active' : ''} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {loading ? <p className="leads-empty">Loading…</p> : error ? <p className="leads-empty">Cases could not be loaded. Please refresh.</p> : (
        <>
          {tab === 'board' && <OpsBoard ctx={ctx} board={board} driverNames={driverNames} alerts={alerts} onOpen={open} />}
          {tab === 'plan' && <OpsPlan ctx={ctx} board={board} />}
          {tab === 'case' && (
            selected ? (
              <>
                <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink-secondary)' }}>Case</label>
                  <select className="form-select" style={{ maxWidth: 360 }} value={selected.id} onChange={(e) => dispatch({ type: 'SET_ACTIVE_OPS_CASE', caseId: e.target.value })}>
                    {list.map((a) => <option key={a.id} value={a.id}>{a.id} — {a.family} ({a.status})</option>)}
                  </select>
                </div>
                <OpsCase a={selected} ctx={ctx} board={board} driverNames={driverNames} team={profiles} />
              </>
            ) : <p className="leads-empty">No cases yet.</p>
          )}
        </>
      )}
    </div>
  );
}
