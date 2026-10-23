import { useState, useEffect } from 'react';
import { useArrangements } from '../../../data/useArrangements';
import { useCaseDocumentChecks, useVerifyDocument } from '../../../data/useDocumentChecks';
import { useToast } from '../../../toast/useToast';
import { StatusBadge } from '../StatusBadge';

export function DocumentsScreen() {
  const { showToast } = useToast();
  const arrangements = useArrangements();
  const rows = arrangements.data ?? [];
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');

  useEffect(() => {
    if (!selectedCaseId && rows.length > 0) {
      setSelectedCaseId(rows[0].id);
    }
  }, [rows, selectedCaseId]);

  const selectedCase = rows.find((r) => r.id === selectedCaseId) ?? rows[0];
  const docChecks = useCaseDocumentChecks(selectedCase?.id);
  const verifyMutation = useVerifyDocument();

  const verifiedCases = rows.filter((item) => item.checklist.docsChecked).length;
  const pendingCases = rows.filter((item) => !item.checklist.docsChecked && item.status !== 'Completed');

  const docs = docChecks.data ?? [];
  const verifiedCount = docs.filter((d) => d.applicable && d.status === 'Verified').length;
  const applicableCount = docs.filter((d) => d.applicable).length;

  const handleToggleVerify = (docKey: string, currentVerified: boolean) => {
    if (!selectedCase) return;
    verifyMutation.mutate(
      {
        caseId: selectedCase.id,
        docKey,
        verified: !currentVerified,
      },
      {
        onSuccess: (updated) => {
          showToast(
            `${updated.label} marked ${updated.status.toLowerCase()} by ${updated.verifiedBy || 'you'}.`,
            'info',
          );
        },
        onError: () => showToast('Could not save document status.', 'info'),
      },
    );
  };

  const handleToggleApplicable = (docKey: string, currentApplicable: boolean) => {
    if (!selectedCase) return;
    verifyMutation.mutate(
      {
        caseId: selectedCase.id,
        docKey,
        verified: false,
        applicable: !currentApplicable,
      },
      {
        onSuccess: (updated) => {
          showToast(`${updated.label} set to ${updated.applicable ? 'Applicable' : 'Not Applicable'}.`, 'info');
        },
        onError: () => showToast('Could not update document applicability.', 'info'),
      },
    );
  };

  const handleNotesChange = (docKey: string, notes: string) => {
    if (!selectedCase) return;
    const current = docs.find((d) => d.key === docKey);
    verifyMutation.mutate({
      caseId: selectedCase.id,
      docKey,
      verified: current?.status === 'Verified',
      notes,
    });
  };

  return (
    <div className="crm-screen active">
      <div className="leads-kpis" style={{ marginBottom: 18 }}>
        <div>
          <strong>{verifiedCases}</strong>
          <span>Cases with all documents verified</span>
        </div>
        <div>
          <strong>{pendingCases.length}</strong>
          <span>Active cases pending documentation</span>
        </div>
        <div>
          <strong>{rows.length}</strong>
          <span>Total arrangements</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 18, alignItems: 'flex-start' }}>
        {/* Case Selector list */}
        <section className="crm-section-card" style={{ marginBottom: 0 }}>
          <div className="crm-card-header">
            <h3>Cases</h3>
          </div>
          <div style={{ display: 'grid', gap: 8, maxHeight: 600, overflowY: 'auto' }}>
            {rows.map((item) => {
              const isSelected = item.id === selectedCase?.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedCaseId(item.id)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    background: isSelected ? 'var(--bg-card, #fff)' : 'transparent',
                    border: isSelected ? '2px solid var(--accent, #b48c48)' : '1px solid var(--border-delicate)',
                    display: 'grid',
                    gap: 4,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{item.id}</strong>
                    <StatusBadge status={item.status} />
                  </div>
                  <div style={{ fontSize: '0.86rem' }}>{item.family}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{item.serviceType}</span>
                    <span style={{ color: item.checklist.docsChecked ? 'var(--moss-700)' : 'var(--amber-700)', fontWeight: 600 }}>
                      {item.checklist.docsChecked ? '✓ All Verified' : '⏳ Pending'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Selected Case Document Verification Details */}
        <section className="crm-section-card" style={{ marginBottom: 0 }}>
          {selectedCase ? (
            <>
              <div className="crm-card-header">
                <div>
                  <h3 style={{ margin: 0 }}>Regulatory paperwork checks · {selectedCase.id}</h3>
                  <p className="comms-help" style={{ margin: '4px 0 0' }}>
                    {selectedCase.family} ({selectedCase.serviceType}) · {verifiedCount} of {applicableCount} required documents verified
                  </p>
                </div>
                <div>
                  <span
                    className={`status-badge ${selectedCase.checklist.docsChecked ? 'status-confirmed' : 'status-inquiry'}`}
                    style={{ fontSize: '0.85rem' }}
                  >
                    {selectedCase.checklist.docsChecked ? '✓ Case Paperwork Complete' : '⏳ Verification In Progress'}
                  </span>
                </div>
              </div>

              <div className="crm-table-wrapper" style={{ marginTop: 12 }}>
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Document</th>
                      <th>Applicable</th>
                      <th>Status</th>
                      <th>Checked By</th>
                      <th>Checked When</th>
                      <th>Reference / Notes</th>
                      <th aria-label="Actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {docs.map((doc) => {
                      const isVerified = doc.status === 'Verified';
                      return (
                        <tr key={doc.key}>
                          <td>
                            <strong>{doc.label}</strong>
                          </td>
                          <td>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.84rem' }}>
                              <input
                                type="checkbox"
                                checked={doc.applicable}
                                onChange={() => handleToggleApplicable(doc.key, doc.applicable)}
                              />
                              {doc.applicable ? 'Required' : 'N/A'}
                            </label>
                          </td>
                          <td>
                            <span
                              className={`status-badge ${
                                !doc.applicable
                                  ? 'status-inquiry'
                                  : isVerified
                                  ? 'status-confirmed'
                                  : 'status-urgent'
                              }`}
                            >
                              {doc.status}
                            </span>
                          </td>
                          <td>{doc.verifiedBy || '—'}</td>
                          <td>
                            {doc.verifiedAt
                              ? new Date(doc.verifiedAt).toLocaleString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '—'}
                          </td>
                          <td>
                            <input
                              className="form-input"
                              style={{ fontSize: '0.82rem', padding: '4px 8px', maxWidth: 180 }}
                              placeholder="No. / notes"
                              defaultValue={doc.notes}
                              onBlur={(e) => handleNotesChange(doc.key, e.target.value)}
                            />
                          </td>
                          <td>
                            {doc.applicable && (
                              <button
                                type="button"
                                className={`btn btn-sm ${isVerified ? 'btn-secondary' : 'btn-primary'}`}
                                onClick={() => handleToggleVerify(doc.key, isVerified)}
                              >
                                {isVerified ? 'Revoke check' : '✓ Mark verified'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--bg-sand-light, #fbf9f5)', borderRadius: 8, fontSize: '0.82rem', border: '1px solid var(--border-delicate)' }}>
                <strong>Role file permissions:</strong> Operations has access to Case and Vehicle documents (NOC, hospital summaries, crematorium receipts); Accounts has access to Invoices, Receipts and Finance folders; HR & Admin have full vault access.
              </div>
            </>
          ) : (
            <p className="leads-empty">Select a case to view document verification details.</p>
          )}
        </section>
      </div>
    </div>
  );
}
