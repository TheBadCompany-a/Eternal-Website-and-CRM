import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Arrangement } from '../../../types';
import { useAuth } from '../../../auth/useAuth';
import { useCommunications } from '../../../data/useCommunications';
import { useQuotationItems } from '../../../data/useQuotations';
import { useRecords } from '../../../data/useRecords';
import { useStarBookings } from '../../../data/useStars';
import { useCaseHandovers } from '../../../data/useHandovers';
import { HandoverModal } from '../modal/HandoverModal';
import { quotedFor } from '../../../lib/paymentCategory';
import { FOLLOW_BADGE, PAYMENT_BADGE, SERVICE_BADGE, amountDue, followUpState, paymentState, serviceState } from '../../../lib/caseStatus';

const rupees = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const day = (iso: string) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const muted = { color: 'var(--ink-muted)' } as const;

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: '1px solid var(--border-delicate)', borderRadius: 10, padding: 14 }}>
      <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 700, color: 'var(--ink-muted)', marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}
const Row = ({ k, v }: { k: string; v: React.ReactNode }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '3px 0', fontSize: '0.86rem' }}>
    <span style={muted}>{k}</span><span style={{ textAlign: 'right' }}>{v || '—'}</span>
  </div>
);

/** Everything about one case in one place: details, services, quote, payment, documents, memorial, messages. */
export function CaseFile({ a }: { a: Arrangement }) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const canSeeRecords = profile?.app_role === 'admin' || profile?.app_role === 'hr' || profile?.app_role === 'operations' || profile?.app_role === 'accounts';
  const items = useQuotationItems(a.id).data ?? [];
  const comms = useCommunications(a.id).data ?? [];
  const handovers = useCaseHandovers(a.id).data ?? [];
  const star = (useStarBookings().data ?? []).find((s) => s.arrangementId === a.id);
  const files = (useRecords({ enabled: canSeeRecords }).data ?? []).filter((r) => r.arrangement_id === a.id);
  const [showHandoverModal, setShowHandoverModal] = useState(false);

  const service = serviceState(a);
  const pay = paymentState(a);
  const follow = followUpState(a);
  const q = a.quotation;
  const quoted = quotedFor(a);
  const fixedPrice = q.total === 0 && quoted > 0;

  return (
    <div className="crm-section-card" style={{ marginBottom: 18 }}>
      <div className="crm-card-header" style={{ alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ marginBottom: 2 }}>Case file · <span style={{ fontFamily: 'monospace' }}>{a.id}</span></h3>
          <p className="comms-help" style={{ margin: 0 }}>{a.family} · {a.serviceType}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} aria-label="Statuses">
          <span title="Service status" className={`status-badge ${service ? SERVICE_BADGE[service] : 'status-inquiry'}`}>Service: {service ?? `Enquiry (${a.status})`}</span>
          <span title="Payment status" className={`status-badge ${PAYMENT_BADGE[pay]}`}>Payment: {pay}</span>
          <span title="Follow up status" className={`status-badge ${FOLLOW_BADGE[follow]}`}>Follow up: {follow}</span>
          <button type="button" className="btn btn-sm btn-primary" onClick={() => setShowHandoverModal(true)}>
            🤝 Hand over case
          </button>
        </div>
      </div>

      {a.nextAction && (
        <div style={{ background: 'var(--bg-sand, #f6f3ed)', borderLeft: '4px solid var(--moss-600, #3a7d44)', padding: '10px 14px', borderRadius: '0 8px 8px 0', marginBottom: 14, fontSize: '0.88rem' }}>
          <strong>👉 Next Action:</strong> {a.nextAction}
          {a.nextFollowUpAt && <span style={{ color: 'var(--ink-muted)', marginLeft: 8 }}>· Due: {new Date(a.nextFollowUpAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 12 }}>
        <Block title="Details">
          <Row k="Contact" v={a.contactName} />
          <Row k="Phone" v={a.phone} />
          <Row k="Email" v={a.email} />
          <Row k="Relationship" v={a.relationship} />
          <Row k="Deceased" v={a.deceasedName} />
          <Row k="Service date" v={`${day(a.date)}${a.time ? ` · ${a.time}` : ''}`} />
          <Row k="Pickup" v={a.pickupLocation} />
          <Row k="Destination" v={a.destinationLocation} />
          <Row k="Source" v={a.leadSource} />
          <Row k="Back end Executive" v={<strong>{a.executive || a.coordinator}</strong>} />
          <Row k="Operations Coordinator" v={a.coordinator} />
          <button type="button" className="btn btn-sm btn-secondary" style={{ marginTop: 8 }} onClick={() => setShowHandoverModal(true)}>
            🤝 Reassign / Hand over
          </button>
        </Block>

        <Block title="Services">
          {items.length === 0 && a.services.length === 0 && <p className="comms-help" style={{ margin: 0 }}>No services selected yet.</p>}
          {items.map((i) => <Row key={i.serviceKey} k={`${i.label}${i.quantity > 1 ? ` × ${i.quantity}` : ''}`} v={rupees(i.unitPrice * i.quantity)} />)}
          {items.length === 0 && a.services.length > 0 && <ul style={{ margin: '0 0 0 16px', padding: 0, fontSize: '0.86rem' }}>{a.services.map((s) => <li key={s}>{s}</li>)}</ul>}
          {a.notes && <p style={{ margin: '8px 0 0', fontSize: '0.82rem', whiteSpace: 'pre-wrap', ...muted }}>{a.notes}</p>}
        </Block>

        <Block title="Quote">
          <Row k="Status" v={q.status} />
          <Row k="Subtotal" v={rupees(fixedPrice ? quoted : q.subtotal)} />
          <Row k="Discount" v={q.discount > 0 ? `− ${rupees(q.discount)}` : '—'} />
          <Row k={fixedPrice ? 'Total (listed price)' : 'Total'} v={<strong>{rupees(quoted)}</strong>} />
          <button type="button" className="btn btn-sm btn-secondary" style={{ marginTop: 8 }} onClick={() => navigate('/crm/quotations')}>Open quotation</button>
        </Block>

        <Block title="Payment">
          <Row k="Received" v={rupees(a.paidAmount)} />
          <Row k="Balance to collect" v={<strong style={{ color: amountDue(a) > 0 ? 'var(--crimson-600)' : undefined }}>{rupees(amountDue(a))}</strong>} />
          <Row k="Method" v={a.paymentMethod} />
          <button type="button" className="btn btn-sm btn-secondary" style={{ marginTop: 8 }} onClick={() => navigate('/crm/payments')}>Open payments</button>
        </Block>

        {star && (
          <Block title="Memorial">
            <Row k="Name" v={<strong>{star.name}</strong>} />
            <Row k="Born – passed" v={`${star.birthDate ? day(star.birthDate) : '?'} – ${star.deathDate ? day(star.deathDate) : '?'}`} />
            <Row k="Requested by" v={`${star.requesterName}${star.requesterPhone ? ` · ${star.requesterPhone}` : ''}`} />
            <Row k="Status" v={star.status} />
            {star.about && <p style={{ margin: '8px 0 0', fontSize: '0.82rem', whiteSpace: 'pre-wrap', ...muted }}>{star.about}</p>}
          </Block>
        )}

        <Block title="Documents">
          <Row k="Paperwork checked" v={a.checklist.docsChecked ? 'Verified' : 'Pending'} />
          {canSeeRecords ? (
            files.length === 0
              ? <p className="comms-help" style={{ margin: '6px 0 0' }}>No files filed for this case.</p>
              : files.map((f) => <Row key={f.id} k={f.doc_type} v={f.title} />)
          ) : <p className="comms-help" style={{ margin: '6px 0 0' }}>Files are kept in Records (HR and admin).</p>}
          {canSeeRecords && <button type="button" className="btn btn-sm btn-secondary" style={{ marginTop: 8 }} onClick={() => navigate('/crm/records')}>Open Records</button>}
        </Block>

        <Block title={`Messages & history${comms.length ? ` (${comms.length})` : ''}`}>
          {comms.length === 0 && <p className="comms-help" style={{ margin: 0 }}>No messages logged yet.</p>}
          {comms.slice(0, 5).map((c) => (
            <div key={c.id} style={{ fontSize: '0.82rem', padding: '4px 0', borderBottom: '1px solid var(--border-delicate)' }}>
              <span style={muted}>{c.time} · {c.channel} · {c.sender}</span>
              <div>{c.text.length > 110 ? `${c.text.slice(0, 110)}…` : c.text}</div>
            </div>
          ))}
          <button type="button" className="btn btn-sm btn-secondary" style={{ marginTop: 8 }} onClick={() => navigate('/crm/communications')}>Open communications</button>
        </Block>

        <Block title={`Handovers & ownership${handovers.length ? ` (${handovers.length})` : ''}`}>
          {handovers.length === 0 ? (
            <p className="comms-help" style={{ margin: 0 }}>No responsibility handovers yet.</p>
          ) : (
            handovers.slice(0, 3).map((h) => (
              <div key={h.id} style={{ fontSize: '0.82rem', padding: '4px 0', borderBottom: '1px solid var(--border-delicate)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                  <strong>{h.fromName} ➔ {h.toName}</strong>
                  <span style={muted}>{new Date(h.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                </div>
                <div style={muted}>{h.reason}</div>
                {h.nextAction && <div style={{ color: 'var(--moss-700)', fontWeight: 500 }}>👉 {h.nextAction}</div>}
              </div>
            ))
          )}
          <button type="button" className="btn btn-sm btn-secondary" style={{ marginTop: 8 }} onClick={() => setShowHandoverModal(true)}>
            🤝 Hand over case
          </button>
        </Block>
      </div>

      {showHandoverModal && <HandoverModal a={a} onClose={() => setShowHandoverModal(false)} />}
    </div>
  );
}
