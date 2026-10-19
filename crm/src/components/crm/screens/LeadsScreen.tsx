import { Modal } from '../../../modal/Modal';
import { NewLeadModal } from '../NewLeadModal';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Arrangement } from '../../../types';
import { useAuth } from '../../../auth/useAuth';
import { useToast } from '../../../toast/useToast';
import { useArrangements, useDeleteArrangement, useUpdateLeadAttribution } from '../../../data/useArrangements';
import type { LeadSource } from '../../../types';
import { useAppDispatch, useAppState } from '../../../state/useAppState';

type LeadView = 'all';

const LEAD_SOURCES: LeadSource[] = ['Unattributed', 'Website', 'Google Ads', 'Meta Ads', 'WhatsApp', 'Referral', 'Walk-in', 'Other'];

const VIEW_LABELS: Record<LeadView, string> = { all: 'All leads' };

const phoneKey = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : '';
};
const isOpen = (lead: Arrangement) => lead.status !== 'Completed';
const isDue = (lead: Arrangement) => isOpen(lead) && !!lead.nextFollowUpAt && new Date(lead.nextFollowUpAt).getTime() <= Date.now();

function matchesView(_lead: Arrangement, _view: LeadView) {
  return true;
}

const isStarLead = (lead: Arrangement) => lead.serviceType.toLowerCase().startsWith('book a star');
const isCustomPackage = (lead: Arrangement) => lead.serviceType.toLowerCase() === 'customised package';

function statusClass(status: Arrangement['status']) {
  if (status === 'New Inquiry') return 'status-inquiry';
  if (status === 'Confirmed') return 'status-confirmed';
  if (status === 'In Execution') return 'status-inprogress';
  if (status === 'Completed') return 'status-completed';
  return 'status-enroute';
}

export function LeadsScreen() {
  const [view, setView] = useState<LeadView>('all');
  const [websiteOnly, setWebsiteOnly] = useState(false);
  const [customOnly, setCustomOnly] = useState(false);
  const [starsOnly, setStarsOnly] = useState(false);
  const [dupesOnly, setDupesOnly] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [source, setSource] = useState<LeadSource>('Unattributed');
  const [campaign, setCampaign] = useState('');
  const [externalLeadId, setExternalLeadId] = useState('');
  const arrangements = useArrangements();
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const deleteArrangement = useDeleteArrangement();
  const updateAttribution = useUpdateLeadAttribution();
  const { searchFilter } = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const dupCounts = useMemo(() => {
    const counts = new Map<string, number>();
    (arrangements.data ?? []).forEach((l) => {
      const k = phoneKey(l.phone);
      if (k) counts.set(k, (counts.get(k) ?? 0) + 1);
    });
    return counts;
  }, [arrangements.data]);
  const isDup = (lead: Arrangement) => (dupCounts.get(phoneKey(lead.phone)) ?? 0) > 1;

  const leads = useMemo(() => {
    const query = searchFilter.trim().toLowerCase();
    return (arrangements.data ?? []).filter((lead) => {
      const searchable = [lead.id, lead.family, lead.contactName, lead.phone, lead.serviceType, lead.coordinator]
        .join(' ')
        .toLowerCase();
      return matchesView(lead, view) && (!websiteOnly || lead.leadSource === 'Website') && (!customOnly || isCustomPackage(lead)) && (!starsOnly || isStarLead(lead)) && (!dupesOnly || isDup(lead)) && (!query || searchable.includes(query));
    });
  }, [arrangements.data, searchFilter, view, websiteOnly, customOnly, starsOnly, dupesOnly, dupCounts]);
  const dupCount = arrangements.data?.filter(isDup).length ?? 0;
  const starCount = arrangements.data?.filter(isStarLead).length ?? 0;
  const customCount = arrangements.data?.filter(isCustomPackage).length ?? 0;
  const websiteCount = arrangements.data?.filter((lead) => lead.leadSource === 'Website').length ?? 0;

  const total = arrangements.data?.length ?? 0;
  const newCount = arrangements.data?.filter((lead) => lead.status === 'New Inquiry').length ?? 0;
  const followUpCount = arrangements.data?.filter((lead) => lead.status === 'Contacted' || lead.status === 'Plan Review').length ?? 0;
  const selectedForAttribution = (arrangements.data ?? []).find((lead) => lead.id === editingId);

  const startAttributionEdit = (lead: Arrangement) => {
    setEditingId(lead.id);
    setSource(lead.leadSource);
    setCampaign(lead.leadCampaign);
    setExternalLeadId(lead.externalLeadId);
  };

  return (
    <div className="crm-screen active">
      <section className="leads-hero">
        <div>
          <span className="leads-eyebrow">Lead & inquiry management</span>
          <h3>One reference for every customer conversation.</h3>
          <p>
            Track enquiries from first contact through quotation and confirmed booking. Each lead is anchored to its
            permanent reference number so sales, operations and accounts stay aligned.
          </p>
        </div>
        <div className="leads-hero-note">
          <strong>Next data upgrade</strong>
          <span>Ad source, WhatsApp reference, classification and sensitivity controls will be added to this record.</span>
        </div>
      </section>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}>+ New lead</button>
      </div>
      <NewLeadModal isOpen={creating} onClose={() => setCreating(false)} />

      <div className="leads-kpis" aria-label="Lead summary">
        <div><strong>{total}</strong><span>Total enquiries</span></div>
        <div><strong>{newCount}</strong><span>Awaiting first contact</span></div>
        <div><strong>{followUpCount}</strong><span>Follow-ups in progress</span></div>
        <div><strong>{leads.length}</strong><span>Visible in current view</span></div>
      </div>

      <section className="crm-section-card">
        <div className="crm-card-header leads-toolbar">
          <div>
            <h3>Lead register</h3>
            <p>Use the global search to find a family, contact, phone number or reference.</p>
          </div>
          <div className="lead-filter-tabs" role="tablist" aria-label="Lead views">
            {(Object.keys(VIEW_LABELS) as LeadView[]).map((key) => (
              <button
                className={view === key ? 'active' : ''}
                key={key}
                onClick={() => {
                  setView(key);
                  setWebsiteOnly(false);
                  setCustomOnly(false);
                  setStarsOnly(false);
                  setDupesOnly(false);
                }}
                type="button"
              >
                {VIEW_LABELS[key]}
              </button>
            ))}
            <button
              className={websiteOnly ? 'active' : ''}
              onClick={() => setWebsiteOnly((v) => !v)}
              type="button"
              aria-pressed={websiteOnly}
            >
              Website leads ({websiteCount})
            </button>
            <button
              className={customOnly ? 'active' : ''}
              onClick={() => setCustomOnly((v) => !v)}
              type="button"
              aria-pressed={customOnly}
            >
              Custom packages ({customCount})
            </button>
            <button
              className={starsOnly ? 'active' : ''}
              onClick={() => setStarsOnly((v) => !v)}
              type="button"
              aria-pressed={starsOnly}
            >
              Stars ({starCount})
            </button>
            <button
              className={dupesOnly ? 'active' : ''}
              onClick={() => setDupesOnly((v) => !v)}
              type="button"
              aria-pressed={dupesOnly}
            >
              Possible duplicates ({dupCount})
            </button>
          </div>
        </div>

        {arrangements.isLoading ? (
          <p className="leads-empty">Loading lead records…</p>
        ) : arrangements.isError ? (
          <p className="leads-empty">Lead records could not be loaded. Please refresh or check the database connection.</p>
        ) : leads.length === 0 ? (
          <p className="leads-empty">No leads match this view or search.</p>
        ) : (
          <div className="crm-table-wrapper">
            <table className="crm-table leads-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Customer / enquiry</th>
                  <th>Service need</th>
                  <th>Source / campaign</th>
                  <th>Class / priority</th>
                  <th>Stage</th>
                  <th>Owner</th>
                  <th>Created</th>
                  <th aria-label="Open lead" />
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td><code>{lead.id}</code></td>
                    <td>
                      <strong>{lead.contactName || lead.family}</strong>
                      {isDup(lead) && <span style={{ color: 'var(--amber-700)', fontWeight: 600 }}>⚠ Possible duplicate (same phone)</span>}
                      <span>{lead.family} · {lead.phone}</span>
                    </td>
                    <td>
                      <strong>{lead.serviceType}</strong>
                      <span>{lead.needCategory}</span>
                      {(lead.services.length > 0 || lead.notes) && (
                        <details>
                          <summary style={{ cursor: 'pointer', fontSize: '0.8rem' }}>
                            View request{lead.services.length ? ` (${lead.services.length} items)` : ''}
                          </summary>
                          {lead.services.length > 0 && (
                            <ul style={{ margin: '6px 0 0 16px', padding: 0, fontSize: '0.8rem' }}>
                              {lead.services.map((svc) => <li key={svc}>{svc}</li>)}
                            </ul>
                          )}
                          {lead.notes && (
                            <p style={{ margin: '6px 0 0', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>{lead.notes}</p>
                          )}
                        </details>
                      )}
                    </td>
                    <td><strong>{lead.leadSource}</strong><span>{lead.leadCampaign || 'Campaign not recorded'}</span></td>
                    <td><strong>{lead.customerClassification}{lead.isSensitive ? ' 🔒' : ''}</strong><span>{lead.priority}{lead.nextFollowUpAt ? ` · ${isDue(lead) ? '⏰ Follow-up due' : 'Follow-up'} ${new Date(lead.nextFollowUpAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}` : ''}</span></td>
                    <td><span className={`status-badge ${statusClass(lead.status)}`}>{lead.status}</span></td>
                    <td>{lead.coordinator}</td>
                    <td>{new Date(lead.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td>
                      <button className="btn btn-sm btn-secondary attribution-edit" type="button" onClick={() => startAttributionEdit(lead)}>Source</button>
                      <button
                        className="btn btn-sm btn-secondary"
                        type="button"
                        onClick={() => {
                          dispatch({ type: 'SET_ACTIVE_OPS_CASE', caseId: lead.id });
                          navigate('/crm/operations');
                        }}
                      >
                        Open
                      </button>
                      {isAdmin && (
                        <button
                          className="btn btn-sm btn-secondary"
                          type="button"
                          style={{ color: 'var(--crimson-600)' }}
                          disabled={deleteArrangement.isPending}
                          onClick={() => {
                            if (!window.confirm(`Delete ${lead.family} (${lead.id})? It will be hidden from the CRM; the record is kept for audit.`)) return;
                            deleteArrangement.mutate(lead.id, {
                              onSuccess: () => showToast(`${lead.id} deleted.`, 'info'),
                              onError: () => showToast('Could not delete this lead — only admins can delete leads.', 'info'),
                            });
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        isOpen={!!selectedForAttribution}
        onClose={() => setEditingId(null)}
        headerContent={<h3>Lead source{selectedForAttribution ? ` · ${selectedForAttribution.id}` : ''}</h3>}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setEditingId(null)}>Cancel</button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={updateAttribution.isPending || !selectedForAttribution}
              onClick={() =>
                selectedForAttribution &&
                updateAttribution.mutate(
                  { id: selectedForAttribution.id, source, campaign, externalLeadId },
                  {
                    onSuccess: () => {
                      showToast(`Source saved for ${selectedForAttribution.id}.`, 'info');
                      setEditingId(null);
                    },
                    onError: () => showToast('Could not save the source. Please try again.', 'info'),
                  },
                )
              }
            >
              {updateAttribution.isPending ? 'Saving…' : 'Save source'}
            </button>
          </>
        }
      >
        <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: 12 }}>
          Where did this lead come from? This feeds the lead-source report.
        </p>
        <div className="form-group"><label className="form-label">Lead source</label>
          <select className="form-select" value={source} onChange={(e) => setSource(e.target.value as LeadSource)}>
            {LEAD_SOURCES.map((item) => <option key={item}>{item}</option>)}
          </select></div>
        <div className="form-group"><label className="form-label">Campaign / ad set</label>
          <input className="form-input" value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="Example: Bangalore Search — October" /></div>
        <div className="form-group"><label className="form-label">External lead ID</label>
          <input className="form-input" value={externalLeadId} onChange={(e) => setExternalLeadId(e.target.value)} placeholder="Google or Meta lead ID" /></div>
      </Modal>
    </div>
  );
}
