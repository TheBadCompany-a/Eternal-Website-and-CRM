import { useState, type ReactNode } from 'react';

// Chart colours. Single-series charts use the CRM's own green. Two-series charts use the first two
// slots of the validated categorical palette (blue, orange); stages use one blue ramp, light to dark.
export const CHART = {
  brand: 'var(--moss-700, #3c5a3c)',
  blue: '#2a78d6',
  orange: '#eb6834',
  stageRamp: ['#86b6ef', '#6da7ec', '#3987e5', '#2a78d6', '#256abf', '#1c5cab', '#184f95'],
};

/** A card with a title, a one-line takeaway and a "View as table" switch. */
export function ChartCard({
  title,
  subtitle,
  table,
  children,
}: {
  title: string;
  subtitle?: string;
  table?: { head: string[]; rows: (string | number)[][] };
  children: ReactNode;
}) {
  const [showTable, setShowTable] = useState(false);
  return (
    <section className="crm-section-card" style={{ marginBottom: 0 }}>
      <div className="crm-card-header">
        <div>
          <h3>{title}</h3>
          {subtitle && <p className="comms-help" style={{ margin: 0 }}>{subtitle}</p>}
        </div>
        {table && (
          <button type="button" className="btn btn-sm btn-secondary" onClick={() => setShowTable((v) => !v)}>
            {showTable ? 'View chart' : 'View as table'}
          </button>
        )}
      </div>
      {showTable && table ? (
        <div className="crm-table-wrapper">
          <table className="crm-table">
            <thead><tr>{table.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {table.rows.map((r, i) => (
                <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        children
      )}
    </section>
  );
}

const niceMax = (v: number) => {
  if (v <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(v));
  const n = v / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
};

export interface TrendPoint {
  label: string;
  value: number;
}

/** A line with a soft area, light gridlines, and a hover crosshair that shows the exact value. */
export function TrendChart({ points, unit = 'leads' }: { points: TrendPoint[]; unit?: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640;
  const H = 230;
  const pad = { l: 34, r: 14, t: 14, b: 28 };
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const n = points.length;
  const max = niceMax(Math.max(0, ...points.map((p) => p.value)));
  const x = (i: number) => pad.l + (n === 1 ? iw / 2 : (i / (n - 1)) * iw);
  const y = (v: number) => pad.t + ih - (v / max) * ih;
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const area = n ? `${line} L${x(n - 1).toFixed(1)},${pad.t + ih} L${x(0).toFixed(1)},${pad.t + ih} Z` : '';
  const ticks = [0, 0.5, 1].map((f) => Math.round(max * f));
  const labelIdx = n <= 6 ? points.map((_, i) => i) : [0, Math.floor((n - 1) / 2), n - 1];
  const total = points.reduce((s, p) => s + p.value, 0);
  const active = hover !== null ? points[hover] : null;

  return (
    <div style={{ position: 'relative' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="img"
        aria-label={`Line chart, ${total} ${unit} in total over ${n} periods`}
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const px = ((e.clientX - rect.left) / rect.width) * W;
          const i = Math.round(((px - pad.l) / iw) * (n - 1));
          setHover(Math.max(0, Math.min(n - 1, n === 1 ? 0 : i)));
        }}
        style={{ display: 'block' }}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="var(--border-delicate, #e6e3dc)" strokeWidth="1" />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--ink-muted, #77746b)">{t}</text>
          </g>
        ))}
        {n > 0 && <path d={area} fill={CHART.brand} opacity="0.1" />}
        {n > 0 && <path d={line} fill="none" stroke={CHART.brand} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />}
        {labelIdx.map((i) => (
          <text key={i} x={x(i)} y={H - 8} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} fontSize="11" fill="var(--ink-muted, #77746b)">
            {points[i].label}
          </text>
        ))}
        {n > 0 && <circle cx={x(n - 1)} cy={y(points[n - 1].value)} r="4" fill={CHART.brand} stroke="var(--bg-surface, #fff)" strokeWidth="2" />}
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + ih} stroke="var(--ink-muted, #77746b)" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx={x(hover)} cy={y(points[hover].value)} r="5" fill={CHART.brand} stroke="var(--bg-surface, #fff)" strokeWidth="2" />
          </g>
        )}
      </svg>
      {active && hover !== null && (
        <div
          style={{
            position: 'absolute',
            top: 4,
            left: `${Math.min(78, Math.max(2, (x(hover) / W) * 100 - 10))}%`,
            background: 'var(--ink-primary, #222)',
            color: '#fff',
            borderRadius: 6,
            padding: '6px 10px',
            fontSize: '0.78rem',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <strong>{active.value}</strong> {unit} · {active.label}
        </div>
      )}
    </div>
  );
}

export interface BarItem {
  label: string;
  value: number;
  color?: string;
  note?: string;
}

/** Horizontal bars with the value written at the end of each bar. */
export function BarList({ items, format = (n: number) => String(n) }: { items: BarItem[]; format?: (n: number) => string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div role="list" style={{ display: 'grid', gap: 10 }}>
      {items.map((item) => (
        <div
          key={item.label}
          role="listitem"
          title={`${item.label}: ${format(item.value)}${item.note ? ` · ${item.note}` : ''}`}
          style={{ display: 'grid', gridTemplateColumns: 'minmax(90px, 160px) 1fr 70px', gap: 12, alignItems: 'center', fontSize: '0.85rem' }}
        >
          <span style={{ color: 'var(--ink-secondary, #555)' }}>{item.label}</span>
          <div style={{ background: 'var(--bg-sand, #f3f1ea)', borderRadius: 4, height: 12 }}>
            <div
              style={{
                width: `${Math.max(item.value > 0 ? 2 : 0, (item.value / max) * 100)}%`,
                height: '100%',
                background: item.color ?? CHART.brand,
                borderRadius: 4,
              }}
            />
          </div>
          <strong style={{ textAlign: 'right' }}>{format(item.value)}</strong>
        </div>
      ))}
    </div>
  );
}

export interface StackRow {
  label: string;
  a: number;
  b: number;
}

/** Two-part bars (for example collected and still to collect) with a legend. */
export function StackedBars({
  rows,
  aLabel,
  bLabel,
  format,
}: {
  rows: StackRow[];
  aLabel: string;
  bLabel: string;
  format: (n: number) => string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.a + r.b));
  return (
    <div>
      <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem', marginBottom: 12 }}>
        <span><i style={{ display: 'inline-block', width: 10, height: 10, background: CHART.blue, borderRadius: 2, marginRight: 6 }} />{aLabel}</span>
        <span><i style={{ display: 'inline-block', width: 10, height: 10, background: CHART.orange, borderRadius: 2, marginRight: 6 }} />{bLabel}</span>
      </div>
      <div style={{ display: 'grid', gap: 14 }}>
        {rows.map((r) => (
          <div key={r.label} title={`${r.label}: ${aLabel} ${format(r.a)}, ${bLabel} ${format(r.b)}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
              <span>{r.label}</span>
              <strong>{format(r.a + r.b)}</strong>
            </div>
            <div style={{ display: 'flex', gap: 2, height: 14, width: `${((r.a + r.b) / max) * 100}%`, minWidth: r.a + r.b > 0 ? 6 : 0 }}>
              {r.a > 0 && <div style={{ flex: r.a, background: CHART.blue, borderRadius: '4px 0 0 4px' }} />}
              {r.b > 0 && <div style={{ flex: r.b, background: CHART.orange, borderRadius: '0 4px 4px 0' }} />}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted, #77746b)', marginTop: 3 }}>
              {aLabel} {format(r.a)} · {bLabel} {format(r.b)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
