import { Modal } from '../../../modal/Modal';
import { NewLeadModal } from '../NewLeadModal';
import { HandoverModal } from '../modal/HandoverModal';
import { CaseFile } from '../ops/CaseFile';
import { useMemo, useState } from 'react';
import type { Arrangement, LeadSource } from '../../../types';
import { useAuth } from '../../../auth/useAuth';
import { useToast } from '../../../toast/useToast';
import { useArrangements, useDeleteArrangement, useUpdateLeadAttribution } from '../../../data/useArrangements';
import { useAppState } from '../../../state/useAppState';

type LeadView = 'all';
type StageFilter = 'all' | 'new' | 'followup';

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

const matchesStage = (lead: Arrangement, stage: StageFilter) =>
  stage === 'all' || (stage === 'new' ? lead.status === 'New Inquiry' : lead.status === 'Contacted' || lead.status === 'Plan Review');

const isStarLead = (lead: Arrangement) => lead.serviceType.toLowerCase().startsWith('book a star');
const isCustomPackage = (lead: Arrangement) => lead.serviceType.toLowerCase() === 'customised package';
const isDemoLead = (lead: Arrangement) => {
  const s = lead.serviceType.toLowerCase();
  return s.includes('demonstration') || s.includes('demo');
};
const isInstitutionalLead = (lead: Arrangement) => {
  const s = lead.serviceType.toLowerCase();
  return s.includes('institutional') || s.includes('partnership') || s.includes('hospital');
};

function displayStageInfo(lead: Arrangement): { label: string; pipeline: string; cls: string } {
  if (isDemoLead(lead)) {
    if (lead.status === 'New Inquiry') return { label: 'Request', pipeline: 'Demo Pipeline', cls: 'status-inquiry' };
    if (lead.status === 'Contacted' || lead.status === 'Plan Review') return { label: 'Appointment', pipeline: 'Demo Pipeline', cls: 'status-enroute' };
    return { label: 'Commercial Follow Up', pipeline: 'Demo Pipeline', cls: 'status-confirmed' };
  }
  if (isInstitutionalLead(lead)) {
    if (lead.status === 'New Inquiry') return { label: 'Discussion', pipeline: 'Institutional Pipeline', cls: 'status-inquiry' };
    if (lead.status === 'Contacted' || lead.status === 'Plan Review' || lead.status === 'Quotation') return { label: 'Proposal', pipeline: 'Institutional Pipeline', cls: 'status-enroute' };
    return { label: 'Agreement', pipeline: 'Institutional Pipeline', cls: 'status-confirmed' };
  }
  return { label: lead.status, pipeline: 'Funeral Arrangement', cls: statusClass(lead.status) };
}

function statusClass(status: Arrangement['status']) {
  if (status === 'New Inquiry') return 'status-inquiry';
  if (status === 'Confirmed') return 'status-confirmed';
  if (status === 'In Execution') return 'status-inprogress';
  if (status === 'Completed') return 'status-completed';
  return 'status-enroute';
}

export function LeadsScreen() {
  const [view, setView] = useState<LeadView>('all');
  const [stage, setStage] = useState<StageFilter>('all');
  const [websiteOnly, setWebsiteOnly] = useState(false);
  const [customOnly, setCustomOnly] = useState(false);
  const [starsOnly, setStarsOnly] = useState(false);
  const [demoOnly, setDemoOnly] = useState(false);
  const [instOnly, setInstOnly] = useState(false);
  const [dupesOnly, setDupesOnly] = useState(false);
  const [creating, setCreating] = useState(false);
  const [handoverLead, setHandoverLead] = useState<Arrangement | null>(null);
  const [openedLead, setOpenedLead] = useState<Arrangement | null>(null);
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
      return (
        matchesView(lead, view) &&
        matchesStage(lead, stage) &&
        (!websiteOnly || lead.leadSource === 'Website') &&
        (!customOnly || isCustomPackage(lead)) &&
        (!starsOnly || isStarLead(lead)) &&
        (!demoOnly || isDemoLead(lead)) &&
        (!instOnly || isInstitutionalLead(lead)) &&
        (!dupesOnly || isDup(lead)) &&
        (!query || searchable.includes(query))
      );
    });
  }, [arrangements.data, searchFilter, view, stage, websiteOnly, customOnly, starsOnly, demoOnly, instOnly, dupesOnly, dupCounts]);
  const dupCount = arrangements.data?.filter(isDup).length ?? 0;
  const starCount = arrangements.data?.filter(isStarLead).length ?? 0;
  const customCount = arrangements.data?.filter(isCustomPackage).length ?? 0;
  const demoCount = arrangements.data?.filter(isDemoLead).length ?? 0;
  const instCount = arrangements.data?.filter(isInstitutionalLead).length ?? 0;
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
        {([['all', total, 'Total enquiries'], ['new', newCount, 'Awaiting first contact'], ['followup', followUpCount, 'Follow-ups in progress']] as const).map(([key, n, label]) => (
          <div
            key={key}
            role="button"
            tabIndex={0}
            aria-pressed={stage === key}
            style={{ cursor: 'pointer', outline: stage === key && key !== 'all' ? '2px solid var(--sage-600, #44543f)' : undefined }}
            onClick={() => setStage(stage === key ? 'all' : key)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setStage(stage === key ? 'all' : key); } }}
          >
            <strong>{n}</strong><span>{label}</span>
          </div>
        ))}
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
                  setStage('all');
                  setWebsiteOnly(false);
                  setCustomOnly(false);
                  setStarsOnly(false);
                  setDemoOnly(false);
                  setInstOnly(false);
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
              className={demoOnly ? 'active' : ''}
              onClick={() => { setDemoOnly((v) => !v); setInstOnly(false); }}
              type="button"
              aria-pressed={demoOnly}
            >
              Demonstrations ({demoCount})
            </button>
            <button
              className={instOnly ? 'active' : ''}
              onClick={() => { setInstOnly((v) => !v); setDemoOnly(false); }}
              type="button"
              aria-pressed={instOnly}
            >
              Institutional ({instCount})
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
                  <th>Back end Executive</th>
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
                    <td>
                      {(() => {
                        const sInfo = displayStageInfo(lead);
                        return (
                          <>
                            <span className={`status-badge ${sInfo.cls}`}>{sInfo.label}</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', display: 'block', marginTop: 3 }}>
                              {sInfo.pipeline}
                            </span>
                          </>
                        );
                      })()}
                    </td>
                    <td>
                      <strong>{lead.executive || lead.coordinator}</strong>
                      {lead.nextAction && (
                        <div style={{ fontSize: '0.74rem', color: 'var(--moss-700)', marginTop: 2 }}>
                          👉 Next: {lead.nextAction}
                        </div>
                      )}
                      <div style={{ fontSize: '0.72rem', color: 'var(--ink-muted)' }}>Coord: {lead.coordinator}</div>
                    </td>
                    <td>{new Date(lead.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td>
                      <button className="btn btn-sm btn-secondary" type="button" onClick={() => setHandoverLead(lead)}>Handover</button>
                      <button className="btn btn-sm btn-secondary attribution-edit" type="button" onClick={() => startAttributionEdit(lead)}>Source</button>
                      <button
                        className="btn btn-sm btn-secondary"
                        type="button"
                        onClick={() => setOpenedLead(lead)}
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

      {handoverLead && <HandoverModal a={handoverLead} onClose={() => setHandoverLead(null)} />}

      <Modal
        wide
        isOpen={openedLead !== null}
        onClose={() => setOpenedLead(null)}
        headerContent={<h3>Case Details · {openedLead?.id}</h3>}
        footer={
          <button type="button" className="btn btn-secondary" onClick={() => setOpenedLead(null)}>
            Close
          </button>
        }
      >
        {openedLead && <CaseFile a={openedLead} />}
      </Modal>
    </div>
  );
}
