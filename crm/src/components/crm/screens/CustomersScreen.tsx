import { useMemo, useState } from 'react';
import { useArrangements } from '../../../data/useArrangements';

const rupees = (value: number) => `₹${value.toLocaleString('en-IN')}`;

/** Family directory: one row per customer, built from every arrangement they've had. */
export function CustomersScreen() {
  const arrangements = useArrangements();
  const [term, setTerm] = useState('');

  const families = useMemo(() => {
    const byKey = new Map<string, { name: string; contact: string; phone: string; email: string; cases: string[]; value: number; last: string; classification: string }>();
    [...(arrangements.data ?? [])]
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .forEach((item) => {
        const key = item.phone.replace(/\D/g, '') || item.family.toLowerCase();
        const entry = byKey.get(key) ?? { name: item.family, contact: item.contactName, phone: item.phone, email: item.email, cases: [], value: 0, last: item.date, classification: item.customerClassification };
        entry.cases.push(item.id);
        entry.value += item.quotation?.total || 0;
        entry.last = item.date;
        entry.classification = item.customerClassification;
        byKey.set(key, entry);
      });
    return [...byKey.values()].sort((a, b) => b.last.localeCompare(a.last));
  }, [arrangements.data]);

  const needle = term.trim().toLowerCase();
  const shown = families.filter((f) => !needle || [f.name, f.contact, f.phone, f.email, ...f.cases].some((v) => v.toLowerCase().includes(needle)));
  const returning = families.filter((f) => f.cases.length > 1).length;

  return (
    <div className="crm-screen active">
      <div className="leads-kpis" style={{ marginBottom: 18 }}>
        <div><strong>{families.length}</strong><span>Families supported</span></div>
        <div><strong>{returning}</strong><span>Returning families</span></div>
        <div><strong>{rupees(families.reduce((sum, f) => sum + f.value, 0))}</strong><span>Total quoted value</span></div>
      </div>
      <div className="crm-section-card">
        <div className="crm-card-header">
          <h3>Family directory</h3>
          <input className="comms-control" style={{ maxWidth: 280 }} placeholder="Search name, phone, email, reference…" value={term} onChange={(e) => setTerm(e.target.value)} />
        </div>
        <div className="crm-table-wrapper">
          <table className="crm-table">
            <thead><tr><th>Family</th><th>Contact</th><th>Phone</th><th>Classification</th><th>Arrangements</th><th>Quoted value</th><th>Last service</th></tr></thead>
            <tbody>
              {shown.length === 0 && <tr><td colSpan={7}>{arrangements.isLoading ? 'Loading…' : 'No families match.'}</td></tr>}
              {shown.map((f) => (
                <tr key={f.phone + f.name}>
                  <td><strong>{f.name}</strong></td>
                  <td>{f.contact}<br /><span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>{f.email}</span></td>
                  <td>{f.phone}</td>
                  <td>{f.classification}</td>
                  <td>{f.cases.length} · {f.cases.slice(-2).join(', ')}</td>
                  <td>{rupees(f.value)}</td>
                  <td>{f.last}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
