import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../../../modal/Modal';
import { CaseFile } from '../ops/CaseFile';
import { useArrangements } from '../../../data/useArrangements';
import { useCreateStarBooking, useStarBookings, useUpdateStarBooking, type NewStarInput, type StarBooking, type StarStatus } from '../../../data/useStars';
import { useAppDispatch, useAppState } from '../../../state/useAppState';
import { useToast } from '../../../toast/useToast';
import { usePaymentClaims } from '../../../data/useWebsite';
import type { Arrangement } from '../../../types';

type StarView = 'all' | 'paid' | 'unpaid';

const VIEW_LABELS: Record<StarView, string> = { all: 'All stars', paid: 'Paid', unpaid: 'Unpaid' };
const STATUSES: StarStatus[] = ['requested', 'active', 'rejected'];
const SOURCES = ['Website', 'WhatsApp', 'Referral', 'Walk-in', 'Google Ads', 'Meta Ads', 'Other'];

export function isStarPaid(lead: Arrangement | undefined) {
  if (!lead) return false;
  return lead.paidAmount > 0 || ['Payment Received', 'Receipt Generated', 'Advance Received'].includes(lead.paymentStatus);
}

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const empty = (): NewStarInput => ({ requesterName: '', phone: '', email: '', name: '', relationship: '', about: '', birthDate: '', deathDate: '', leadSource: 'Walk-in' });

function NewStarModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const create = useCreateStarBooking();
  const { showToast } = useToast();
  const [form, setForm] = useState(empty);
  const set = (key: keyof NewStarInput) => (e: { target: { value: string } }) => setForm({ ...form, [key]: e.target.value });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    create.mutate(form, {
      onSuccess: () => {
        showToast(`Star for ${form.name} saved.`, 'info');
        setForm(empty());
        onClose();
      },
      onError: () => showToast('Could not save the star — please check the details.', 'info'),
    });
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      headerContent={<h3>New star booking</h3>}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" form="new-star-form" className="btn btn-primary" disabled={create.isPending}>
            {create.isPending ? 'Saving…' : 'Save star'}
          </button>
        </>
      }
    >
      <form id="new-star-form" onSubmit={submit}>
        <div className="form-group"><label className="form-label">Name of loved one *</label>
          <input className="form-input" value={form.name} onChange={set('name')} required maxLength={80} /></div>
        <div className="form-group"><label className="form-label">Relationship to requester</label>
          <input className="form-input" value={form.relationship} onChange={set('relationship')} maxLength={60} /></div>
        <div className="form-group"><label className="form-label">Date of birth</label>
          <input className="form-input" type="date" value={form.birthDate} onChange={set('birthDate')} /></div>
        <div className="form-group"><label className="form-label">Date of passing</label>
          <input className="form-input" type="date" value={form.deathDate} onChange={set('deathDate')} /></div>
        <div className="form-group"><label className="form-label">About them</label>
          <textarea className="form-textarea" rows={3} value={form.about} onChange={set('about')} maxLength={2000} /></div>
        <div className="form-group"><label className="form-label">Requester name *</label>
          <input className="form-input" value={form.requesterName} onChange={set('requesterName')} required maxLength={80} /></div>
        <div className="form-group"><label className="form-label">Phone *</label>
          <input className="form-input" type="tel" value={form.phone} onChange={set('phone')} required minLength={5} maxLength={20} /></div>
        <div className="form-group"><label className="form-label">Email *</label>
          <input className="form-input" type="email" value={form.email} onChange={set('email')} required /></div>
        <div className="form-group"><label className="form-label">Lead source</label>
          <select className="form-select" value={form.leadSource} onChange={set('leadSource')}>
            {SOURCES.map((s) => <option key={s}>{s}</option>)}
          </select></div>
      </form>
    </Modal>
  );
}

export function StarsScreen() {
  const [view, setView] = useState<StarView>('all');
  const [creating, setCreating] = useState(false);
  const [openedStar, setOpenedStar] = useState<StarBooking | null>(null);
  const stars = useStarBookings();
  const arrangements = useArrangements();
  const update = useUpdateStarBooking();
  const claims = usePaymentClaims();
  const pendingFor = (id: string | null) => (claims.data ?? []).filter((c) => c.arrangementId === id && c.status === 'pending');
  const { showToast } = useToast();
  const { searchFilter } = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const leadById = useMemo(() => new Map((arrangements.data ?? []).map((a) => [a.id, a])), [arrangements.data]);
  const all = stars.data ?? [];
  const paidOf = (s: StarBooking) => isStarPaid(s.arrangementId ? leadById.get(s.arrangementId) : undefined);
  const paidCount = all.filter(paidOf).length;
  const received = all.reduce((sum, s) => sum + (s.arrangementId ? leadById.get(s.arrangementId)?.paidAmount ?? 0 : 0), 0);

  const visible = useMemo(() => {
    const query = searchFilter.trim().toLowerCase();
    return all.filter((s) => {
      const paid = paidOf(s);
      if (view === 'paid' && !paid) return false;
      if (view === 'unpaid' && paid) return false;
      if (!query) return true;
      return [s.arrangementId, s.name, s.requesterName, s.requesterPhone, s.ownerEmail].join(' ').toLowerCase().includes(query);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, view, searchFilter, leadById]);

  const openCase = (s: StarBooking, path: string) => {
    if (!s.arrangementId) return;
    dispatch(path === '/crm/operations' ? { type: 'OPEN_OPS_CASE', caseId: s.arrangementId } : { type: 'SET_ACTIVE_OPS_CASE', caseId: s.arrangementId });
    navigate(path);
  };

  return (
    <div className="crm-screen active">
      <section className="leads-hero">
        <div>
          <span className="leads-eyebrow">Book a Star · Signature Farewell</span>
          <h3>Every memorial star request, paid and unpaid.</h3>
          <p>
            Website requests are saved here automatically, each with a matching lead. You can also enter a star by hand.
            Record a payment against the lead and it moves from Unpaid to Paid.
          </p>
        </div>
      </section>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}>+ New star</button>
      </div>
      <NewStarModal isOpen={creating} onClose={() => setCreating(false)} />

      <div className="leads-kpis" aria-label="Star summary">
        <div><strong>{all.length}</strong><span>Total stars</span></div>
        <div><strong>{paidCount}</strong><span>Paid</span></div>
        <div><strong>{all.length - paidCount}</strong><span>Unpaid</span></div>
        <div><strong>{inr(received)}</strong><span>Payment received</span></div>
      </div>

      <section className="crm-section-card">
        <div className="crm-card-header leads-toolbar">
          <div>
            <h3>Star register</h3>
            <p>Use the global search to find a family, memorial name, phone number or reference.</p>
          </div>
          <div className="lead-filter-tabs" role="tablist" aria-label="Star views">
            {(Object.keys(VIEW_LABELS) as StarView[]).map((key) => (
              <button className={view === key ? 'active' : ''} key={key} onClick={() => setView(key)} type="button">
                {VIEW_LABELS[key]}
              </button>
            ))}
          </div>
        </div>

        {stars.isLoading ? (
          <p className="leads-empty">Loading stars…</p>
        ) : stars.isError ? (
          <p className="leads-empty">Stars could not be loaded. Please refresh or check the database connection.</p>
        ) : visible.length === 0 ? (
          <p className="leads-empty">No stars match this view or search.</p>
        ) : (
          <div className="crm-table-wrapper">
            <table className="crm-table leads-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Memorial for</th>
                  <th>Requested by</th>
                  <th>Payment</th>
                  <th>Star status</th>
                  <th>Created</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {visible.map((s) => {
                  const lead = s.arrangementId ? leadById.get(s.arrangementId) : undefined;
                  const paid = paidOf(s);
                  return (
                    <tr key={s.id}>
                      <td><code>{s.arrangementId ?? '—'}</code></td>
                      <td>
                        <strong>{s.name}</strong>
                        <span>{[s.relationship, `${fmt(s.birthDate)} – ${fmt(s.deathDate)}`].filter(Boolean).join(' · ')}</span>
                      </td>
                      <td>
                        <strong>{s.requesterName}</strong>
                        <span>{s.requesterPhone} · {s.ownerEmail}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${paid ? 'status-completed' : 'status-inquiry'}`}>{paid ? 'Paid' : 'Unpaid'}</span>
                        <span>{lead ? (paid ? `${inr(lead.paidAmount)} · ${lead.paymentStatus}` : lead.paymentStatus) : ''}</span>
                        {pendingFor(s.arrangementId).length > 0 && <span style={{ color: 'var(--amber-700)', fontWeight: 600 }}>UPI claim to verify (Payments)</span>}
                      </td>
                      <td>
                        <select
                          className="form-select"
                          value={s.status}
                          onChange={(e) =>
                            update.mutate(
                              { id: s.id, patch: { status: e.target.value as StarStatus } },
                              { onError: () => showToast('Could not update the star status.', 'info') },
                            )
                          }
                        >
                          {STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
                        </select>
                      </td>
                      <td>{fmt(s.createdAt)}</td>
                      <td>
                        <button className="btn btn-sm btn-secondary" type="button" disabled={!s.arrangementId} onClick={() => openCase(s, '/crm/payments')}>Payments</button>
                        <button className="btn btn-sm btn-secondary" type="button" onClick={() => setOpenedStar(s)}>Open</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        wide
        isOpen={openedStar !== null}
        onClose={() => setOpenedStar(null)}
        headerContent={<h3>Memorial Star Details · {openedStar?.name}</h3>}
        footer={
          <button type="button" className="btn btn-secondary" onClick={() => setOpenedStar(null)}>
            Close
          </button>
        }
      >
        {openedStar && (
          openedStar.arrangementId && leadById.get(openedStar.arrangementId) ? (
            <CaseFile a={leadById.get(openedStar.arrangementId)!} />
          ) : (
            <div style={{ maxWidth: 600 }}>
              <div className="leads-kpis" style={{ marginBottom: 16 }}>
                <div><strong>{openedStar.name}</strong><span>Loved One</span></div>
                <div><strong>{openedStar.relationship || 'Memorial'}</strong><span>Relationship</span></div>
                <div><span className={`status-badge ${paidOf(openedStar) ? 'status-completed' : 'status-inquiry'}`}>{paidOf(openedStar) ? 'Paid' : 'Unpaid'}</span><span>Payment</span></div>
                <div><strong>{openedStar.status}</strong><span>Status</span></div>
              </div>
              <div style={{ background: 'var(--bg-sand-light, #fbf9f5)', padding: '14px 16px', borderRadius: 8, border: '1px solid var(--border-delicate)' }}>
                <p><strong>Requester:</strong> {openedStar.requesterName} ({openedStar.requesterPhone} · {openedStar.ownerEmail})</p>
                <p><strong>Dates:</strong> {fmt(openedStar.birthDate)} – {fmt(openedStar.deathDate)}</p>
                {openedStar.about && <p><strong>About / Tribute:</strong><br /><em>{openedStar.about}</em></p>}
                {openedStar.notes && <p><strong>Notes:</strong> {openedStar.notes}</p>}
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--ink-muted)' }}>Created: {fmt(openedStar.createdAt)} · Ref: {openedStar.arrangementId || openedStar.id}</p>
              </div>
            </div>
          )
        )}
      </Modal>
    </div>
  );
}
