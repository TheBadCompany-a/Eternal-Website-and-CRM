import { useArrangements, useToggleChecklistItem } from '../../../data/useArrangements';
import { useToast } from '../../../toast/useToast';
import { StatusBadge } from '../StatusBadge';

const REQUIRED_DOCUMENTS = [
  'Hospital death summary',
  'Police NOC (where applicable)',
  'Municipal death certificate',
  'Family ID proof',
  'Crematorium / cemetery slip',
  'Embassy clearance (for repatriation)',
];

/** Verification tracker: whether each case's regulatory paperwork has been checked. Files themselves are not stored here. */
export function DocumentsScreen() {
  const { showToast } = useToast();
  const arrangements = useArrangements();
  const toggle = useToggleChecklistItem();
  const rows = arrangements.data ?? [];
  const verified = rows.filter((item) => item.checklist.docsChecked).length;
  const pendingActive = rows.filter((item) => !item.checklist.docsChecked && item.status !== 'Completed' && item.status !== 'New Inquiry');

  return (
    <div className="crm-screen active">
      <div className="leads-kpis" style={{ marginBottom: 18 }}>
        <div><strong>{verified}</strong><span>Cases with documents verified</span></div>
        <div><strong>{pendingActive.length}</strong><span>Active cases still pending</span></div>
        <div><strong>{rows.length}</strong><span>Total cases</span></div>
      </div>
      <div className="dashboard-grid-layout">
        <section className="crm-section-card">
          <div className="crm-card-header"><h3>Document verification by case</h3></div>
          <div className="crm-table-wrapper">
            <table className="crm-table">
              <thead><tr><th>Case</th><th>Family</th><th>Status</th><th>Documents verified</th></tr></thead>
              <tbody>
                {rows.length === 0 && <tr><td colSpan={4}>{arrangements.isLoading ? 'Loading…' : 'No cases yet.'}</td></tr>}
                {rows.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.id}</strong></td>
                    <td>{item.family}</td>
                    <td><StatusBadge status={item.status} /></td>
                    <td>
                      <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={item.checklist.docsChecked}
                          onChange={(e) => toggle.mutate({ id: item.id, key: 'docsChecked', value: e.target.checked }, { onSuccess: () => showToast(`Documents ${e.target.checked ? 'verified' : 'marked pending'} for ${item.id}.`, 'info'), onError: () => showToast('Could not update.', 'info') })}
                        />
                        {item.checklist.docsChecked ? 'Verified' : 'Pending'}
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="crm-section-card">
          <div className="crm-card-header"><h3>Paperwork to collect</h3></div>
          <ol className="tracking-rules">{REQUIRED_DOCUMENTS.map((doc) => <li key={doc}>{doc}</li>)}</ol>
          <p className="comms-help">Ticking “verified” also completes the documents step on the Operations and Driver checklists.</p>
        </section>
      </div>
    </div>
  );
}
