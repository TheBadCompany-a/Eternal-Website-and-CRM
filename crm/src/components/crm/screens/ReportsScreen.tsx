import { useMemo, useState } from 'react';
import { ReportsExtras } from './ReportsExtras';
import { useArrangements } from '../../../data/useArrangements';
import { useCallbacks } from '../../../data/useCallbacks';
import { categoryOf, quotedFor } from '../../../lib/paymentCategory';
import { isNonDispatchService } from '../../../lib/opsLogic';
import { BarList, CHART, ChartCard, StackedBars, TrendChart, type TrendPoint } from '../charts/Charts';
import type { Arrangement } from '../../../types';

type Range = '7' | '30' | '90' | 'all';
const RANGES: { key: Range; label: string; days: number | null }[] = [
  { key: '7', label: 'Last 7 days', days: 7 },
  { key: '30', label: 'Last 30 days', days: 30 },
  { key: '90', label: 'Last 90 days', days: 90 },
  { key: 'all', label: 'All time', days: null },
];
const STAGES = ['New Inquiry', 'Contacted', 'Plan Review', 'Quotation', 'Confirmed', 'In Execution', 'Completed'] as const;
const CATEGORY_LABEL = { star: 'Stars', package: 'Packages', service: 'Services' } as const;

const rupees = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const DAY = 86_400_000;
const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const shortDay = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

/** Counts leads in evenly sized buckets: daily up to 30 days, weekly for 90 days, monthly for all time. */
function buildTrend(rows: Arrangement[], range: Range): TrendPoint[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (range === 'all') {
    if (!rows.length) return [];
    const times = rows.map((r) => new Date(r.createdAt).getTime());
    const first = new Date(Math.min(...times));
    const months: TrendPoint[] = [];
    const cursor = new Date(first.getFullYear(), first.getMonth(), 1);
    while (cursor <= now) {
      const start = cursor.getTime();
      const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1).getTime();
      months.push({
        label: cursor.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        value: rows.filter((r) => { const t = new Date(r.createdAt).getTime(); return t >= start && t < end; }).length,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return months;
  }
  const days = range === '7' ? 7 : range === '30' ? 30 : 90;
  const bucket = range === '90' ? 7 : 1;
  const counts = new Map<string, number>();
  rows.forEach((r) => counts.set(dayKey(new Date(r.createdAt)), (counts.get(dayKey(new Date(r.createdAt))) ?? 0) + 1));
  const out: TrendPoint[] = [];
  for (let offset = days - 1; offset >= 0; offset -= bucket) {
    let value = 0;
    for (let k = 0; k < bucket; k++) value += counts.get(dayKey(new Date(now.getTime() - (offset - k) * DAY))) ?? 0;
    const start = new Date(now.getTime() - offset * DAY);
    out.push({ label: bucket === 1 ? shortDay(start) : `Week of ${shortDay(start)}`, value });
  }
  return out;
}

const csvCell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
function downloadCsv(rows: Arrangement[]) {
  const head = ['Reference', 'Customer', 'Phone', 'Service', 'Source', 'Form', 'Status', 'Quoted (Rs.)', 'Paid (Rs.)', 'Created'];
  const lines = rows.map((r) =>
    [r.id, r.contactName || r.family, r.phone, r.serviceType, r.leadSource, r.leadCampaign, r.status, quotedFor(r), r.paidAmount, new Date(r.createdAt).toLocaleString('en-IN')]
      .map(csvCell)
      .join(','),
  );
  const blob = new Blob([[head.map(csvCell).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `leads-${dayKey(new Date())}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function Delta({ now, before }: { now: number; before: number | null }) {
  if (before === null) return null;
  const diff = now - before;
  if (diff === 0) return <small style={{ color: 'var(--ink-muted)' }}>same as before</small>;
  const up = diff > 0;
  return (
    <small style={{ color: up ? 'var(--moss-700)' : 'var(--crimson-600)', fontWeight: 600 }}>
      {up ? '▲' : '▼'} {Math.abs(diff).toLocaleString('en-IN')} vs previous period
    </small>
  );
}

export function ReportsScreen() {
  const arrangements = useArrangements();
  const callbacks = useCallbacks();
  const all = arrangements.data ?? [];
  const [range, setRange] = useState<Range>('30');
  const days = RANGES.find((r) => r.key === range)!.days;

  const { rows, previous } = useMemo(() => {
    if (days === null) return { rows: all, previous: null as Arrangement[] | null };
    const now = Date.now();
    const start = now - days * DAY;
    const prevStart = start - days * DAY;
    const t = (r: Arrangement) => new Date(r.createdAt).getTime();
    return { rows: all.filter((r) => t(r) >= start), previous: all.filter((r) => t(r) >= prevStart && t(r) < start) };
  }, [all, days]);

  const confirmedCount = (list: Arrangement[]) =>
    list.filter((r) => ['Confirmed', 'In Execution', 'Completed'].includes(r.status) && !isNonDispatchService(r.serviceType)).length;
  const collected = (list: Arrangement[]) => list.reduce((s, r) => s + r.paidAmount, 0);
  const outstanding = (list: Arrangement[]) => list.reduce((s, r) => s + Math.max(0, quotedFor(r) - r.paidAmount), 0);
  const conversion = rows.length ? Math.round((confirmedCount(rows) / rows.length) * 100) : 0;

  const trend = useMemo(() => buildTrend(rows, range), [rows, range]);

  const bySource = useMemo(() => {
    const counts = new Map<string, number>();
    rows.forEach((r) => {
      const key = r.leadCampaign || r.leadSource;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 7);
    const rest = sorted.slice(7).reduce((s, [, n]) => s + n, 0);
    return [...top, ...(rest ? ([['Other', rest]] as [string, number][]) : [])].map(([label, value]) => ({ label, value }));
  }, [rows]);

  const pipeline = STAGES.map((stage, i) => ({ label: stage, value: rows.filter((r) => r.status === stage).length, color: CHART.stageRamp[i] }));

  const money = (Object.keys(CATEGORY_LABEL) as (keyof typeof CATEGORY_LABEL)[]).map((cat) => {
    const list = rows.filter((r) => categoryOf(r) === cat);
    return { label: CATEGORY_LABEL[cat], a: collected(list), b: outstanding(list) };
  });

  const escalations = [
    ...rows.filter((r) => r.priority === 'Urgent' && r.status !== 'Completed').map((r) => ({ ref: r.id, reason: 'Urgent lead requires attention', executive: r.executive || r.coordinator })),
    ...(callbacks.data ?? []).filter((c) => c.waitingMins > 30).map((c) => ({ ref: c.id, reason: `Callback waiting ${c.waitingMins} minutes`, executive: c.family })),
  ];

  const periodName = RANGES.find((r) => r.key === range)!.label.toLowerCase();
  const empty = !arrangements.isLoading && rows.length === 0;

  return (
    <div className="crm-screen active">
      <div className="crm-card-header" style={{ marginBottom: 16 }}>
        <div className="lead-filter-tabs" role="tablist" aria-label="Report period">
          {RANGES.map((r) => (
            <button key={r.key} type="button" className={range === r.key ? 'active' : ''} onClick={() => setRange(r.key)}>{r.label}</button>
          ))}
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => downloadCsv(rows)} disabled={!rows.length}>
          Download leads (CSV)
        </button>
      </div>

      <div className="leads-kpis" aria-label="Key numbers">
        <div><strong>{rows.length}</strong><span>New leads</span><Delta now={rows.length} before={previous ? previous.length : null} /></div>
        <div><strong>{conversion}%</strong><span>Became bookings</span><Delta now={confirmedCount(rows)} before={previous ? confirmedCount(previous) : null} /></div>
        <div><strong>{rupees(collected(rows))}</strong><span>Money collected</span><Delta now={collected(rows)} before={previous ? collected(previous) : null} /></div>
        <div><strong>{rupees(outstanding(rows))}</strong><span>Still to collect</span></div>
      </div>

      {empty && (
        <section className="crm-section-card">
          <p className="leads-empty">No leads in {periodName}. Try a longer period.</p>
        </section>
      )}

      {!empty && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 18, marginBottom: 18 }}>
          <ChartCard
            title="New leads over time"
            subtitle={`${rows.length} leads in ${periodName}${range === '90' ? ', shown by week' : range === 'all' ? ', shown by month' : ''}.`}
            table={{ head: ['Period', 'Leads'], rows: trend.map((p) => [p.label, p.value]) }}
          >
            <TrendChart points={trend} />
          </ChartCard>

          <ChartCard
            title="Where leads come from"
            subtitle={bySource[0] ? `${bySource[0].label} brings the most leads (${bySource[0].value}).` : undefined}
            table={{ head: ['Source / form', 'Leads'], rows: bySource.map((s) => [s.label, s.value]) }}
          >
            <BarList items={bySource} />
          </ChartCard>

          <ChartCard
            title="Where cases are right now"
            subtitle="How many cases sit at each stage."
            table={{ head: ['Stage', 'Cases', 'Share'], rows: pipeline.map((p) => [p.label, p.value, `${rows.length ? Math.round((p.value / rows.length) * 100) : 0}%`]) }}
          >
            <BarList items={pipeline} />
          </ChartCard>

          <ChartCard
            title="Money: collected and still to collect"
            subtitle="By kind of booking."
            table={{ head: ['Kind', 'Collected', 'Still to collect'], rows: money.map((m) => [m.label, rupees(m.a), rupees(m.b)]) }}
          >
            <StackedBars rows={money} aLabel="Collected" bLabel="Still to collect" format={rupees} />
          </ChartCard>
        </div>
      )}

      <section className="crm-section-card">
        <div className="crm-card-header">
          <div>
            <h3>Needs attention ({escalations.length})</h3>
            <p className="comms-help">Urgent leads and callbacks waiting over 30 minutes.</p>
          </div>
        </div>
        <div className="escalation-list">
          {escalations.length ? (
            escalations.map((item, index) => (
              <div key={`${item.ref}-${index}`}>
                <span>!</span>
                <div><strong>{item.ref}</strong><p>{item.reason}</p><small>Executive: {item.executive}</small></div>
              </div>
            ))
          ) : (
            <p className="leads-empty">Nothing needs attention right now.</p>
          )}
        </div>
      </section>

      <ReportsExtras rows={rows} />
    </div>
  );
}
