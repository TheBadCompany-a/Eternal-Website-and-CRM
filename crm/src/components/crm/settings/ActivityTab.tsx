import { useAuth } from '../../../auth/useAuth';
import { useActivityLog, useAppSettings } from '../../../data/useSettings';
import { useArrangements } from '../../../data/useArrangements';
import { useProfiles } from '../../../data/useProfiles';
import { quotedFor } from '../../../lib/paymentCategory';
import { Field, SettingCard } from './SettingCard';

const csvCell = (v: string | number) => `"${String(v ?? '').replace(/"/g, '""')}"`;
function saveFile(name: string, content: string, type: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}
const stamp = () => new Date().toISOString().slice(0, 10);

export function ActivityTab() {
  const { isAdmin } = useAuth();
  const { settings } = useAppSettings();
  const log = useActivityLog(isAdmin);
  const arrangements = useArrangements();
  const profiles = useProfiles();
  const leads = arrangements.data ?? [];

  const exportLeads = () =>
    saveFile(
      `leads-${stamp()}.csv`,
      [['Reference', 'Customer', 'Phone', 'Email', 'City', 'Service', 'Source', 'Form', 'Status', 'Quoted (Rs.)', 'Paid (Rs.)', 'Payment status', 'Created'].map(csvCell).join(','),
        ...leads.map((r) => [r.id, r.contactName || r.family, r.phone, r.email, '', r.serviceType, r.leadSource, r.leadCampaign, r.status, quotedFor(r), r.paidAmount, r.paymentStatus, new Date(r.createdAt).toLocaleString('en-IN')].map(csvCell).join(','))].join('\n'),
      'text/csv;charset=utf-8',
    );
  const exportPayments = () =>
    saveFile(
      `payments-${stamp()}.csv`,
      [['Reference', 'Customer', 'Quoted (Rs.)', 'Received (Rs.)', 'Balance (Rs.)', 'Method', 'Status'].map(csvCell).join(','),
        ...leads.map((r) => [r.id, r.contactName || r.family, quotedFor(r), r.paidAmount, Math.max(0, quotedFor(r) - r.paidAmount), r.paymentMethod, r.paymentStatus].map(csvCell).join(','))].join('\n'),
      'text/csv;charset=utf-8',
    );
  const exportTeam = () =>
    saveFile(
      `team-${stamp()}.csv`,
      [['Staff ID', 'Name', 'Role', 'Phone', 'Duty status'].map(csvCell).join(','),
        ...(profiles.data ?? []).map((t) => [t.code, t.name, t.appRole, t.phone, t.status].map(csvCell).join(','))].join('\n'),
      'text/csv;charset=utf-8',
    );
  const exportBackup = () => saveFile(`eternal-backup-${stamp()}.json`, JSON.stringify({ exportedAt: new Date().toISOString(), leads, team: profiles.data ?? [], settings }, null, 2), 'application/json');

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <section className="crm-section-card" style={{ marginBottom: 0 }}>
        <div className="crm-card-header">
          <div><h3>Activity log</h3><p className="comms-help" style={{ margin: 0 }}>Who did what: deleted leads, payments, new and removed users, role, price and setting changes.</p></div>
        </div>
        {log.isLoading ? (
          <p className="leads-empty">Loading…</p>
        ) : log.isError ? (
          <p className="leads-empty">The activity log could not be loaded.</p>
        ) : (log.data ?? []).length === 0 ? (
          <p className="leads-empty">Nothing recorded yet. New actions will appear here.</p>
        ) : (
          <div className="crm-table-wrapper" style={{ maxHeight: 420, overflow: 'auto' }}>
            <table className="crm-table">
              <thead><tr><th>When</th><th>Who</th><th>What</th><th>Details</th></tr></thead>
              <tbody>
                {(log.data ?? []).map((e) => (
                  <tr key={e.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(e.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                    <td>{e.actor}</td><td><strong>{e.action}</strong></td><td>{e.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 18 }}>
        <section className="crm-section-card" style={{ marginBottom: 0 }}>
          <div className="crm-card-header"><h3>Download your data</h3></div>
          <p className="comms-help">Spreadsheet files you can open in Excel or Google Sheets.</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" type="button" onClick={exportLeads} disabled={!leads.length}>All leads (CSV)</button>
            <button className="btn btn-secondary" type="button" onClick={exportPayments} disabled={!leads.length}>Payments (CSV)</button>
            <button className="btn btn-secondary" type="button" onClick={exportTeam} disabled={!(profiles.data ?? []).length}>Team (CSV)</button>
            <button className="btn btn-secondary" type="button" onClick={exportBackup}>Full backup (JSON)</button>
          </div>
        </section>

        <SettingCard title="Backups and keeping records" help="A note for your team about how long records are kept." settingKey="retention" value={settings.retention}>
          {(d, set) => (
            <>
              <Field label="Our policy">
                <textarea className="form-textarea" rows={4} value={d.note} onChange={(e) => set({ note: e.target.value })} placeholder="For example: leads are kept for 7 years; a full backup is downloaded on the 1st of every month." />
              </Field>
              <p className="comms-help">
                The database is backed up by Supabase according to your Supabase plan. Check the backup schedule in your Supabase project (Database, Backups). The "Full backup" button gives you your own copy of the leads, team and settings.
              </p>
            </>
          )}
        </SettingCard>
      </div>
    </div>
  );
}
