import { useState } from 'react';
import type { Arrangement } from '../../../types';
import { CHECKLIST_ITEMS } from '../checklist';
import { LocationRow } from '../LocationRow';
import { useAssignCoordinator, useSetFeedbackDeclined, useToggleChecklistItem, useUpdateArrangementStatus, useUpdateRoute } from '../../../data/useArrangements';
import { useSendCommunication } from '../../../data/useCommunications';
import { DRIVER_STATUS_LABEL, type DriverTaskView } from '../../../data/useDriverTasks';
import { useAppSettings } from '../../../data/useSettings';
import { quotedFor } from '../../../lib/paymentCategory';
import {
  CHECKLIST_TOTAL, FAMILY_UPDATES, checklistDone, dateLabel, familyMessage, isAssigned, mapUrl, timeLabel, waLink,
  type FamilyUpdate, type OpsContext,
} from '../../../lib/opsLogic';
import type { TeamMember } from '../../../types';
import { useToast } from '../../../toast/useToast';
import { ResourcePicker } from './ResourcePicker';
import { CaseFile } from './CaseFile';

const EXEC_STAGES = [
  { name: 'Start Journey', desc: 'Driver leaves for the pickup point' },
  { name: 'Arrived at Pickup', desc: 'Reached the hospital mortuary or family home' },
  { name: 'Service Started', desc: 'Ceremonial transit and escort under way' },
  { name: 'Reached Destination', desc: 'Arrived at the crematorium or cemetery' },
  { name: 'Complete Service', desc: 'Service completed and handover closed' },
];
const rupees = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

interface Props {
  a: Arrangement;
  ctx: OpsContext;
  board: Map<string, DriverTaskView> | undefined;
  driverNames: string[];
  team: TeamMember[];
}

export function OpsCase({ a, ctx, board, driverNames, team }: Props) {
  const { showToast } = useToast();
  const { settings } = useAppSettings();
  const toggle = useToggleChecklistItem();
  const route = useUpdateRoute();
  const coordinator = useAssignCoordinator();
  const declineFeedback = useSetFeedbackDeclined();
  const status = useUpdateArrangementStatus();
  const log = useSendCommunication();
  const [receivedBy, setReceivedBy] = useState('');
  const [handoverNote, setHandoverNote] = useState('');

  const task = board?.get(a.id);
  const stage = a.fieldExecutionStage || 1;
  const fix = task?.lastFix ?? null;
  const done = checklistDone(a);
  const quoted = quotedFor(a);
  const spent = task?.expenseTotal ?? 0;
  const pendingExpenses = (task?.expenses ?? []).filter((e) => !e.approved_at).length;
  const balance = Math.max(0, quoted - a.paidAmount);
  const failed = () => showToast('Could not save this. Please try again.', 'info');

  const sendUpdate = (kind: FamilyUpdate) => {
    const text = familyMessage(kind, a, settings.business.company_name, mapUrl(fix));
    window.open(waLink(a.phone, text), '_blank', 'noopener');
    log.mutate({ arrangementId: a.id, channel: 'WhatsApp', text: `Update sent to family (${kind}): ${text}` });
  };

  const saveHandover = () => {
    if (!receivedBy.trim()) return showToast('Write who received the family or the body.', 'info');
    const text = `Handover: received by ${receivedBy.trim()} at ${new Date().toLocaleString('en-IN')}${handoverNote.trim() ? `. ${handoverNote.trim()}` : ''}`;
    log.mutate({ arrangementId: a.id, channel: 'Call', text }, {
      onSuccess: () => { showToast('Handover recorded.', 'info'); setReceivedBy(''); setHandoverNote(''); },
      onError: failed,
    });
  };

  const closing = [
    { ok: done === CHECKLIST_TOTAL, text: `Pre-service check ${done}/${CHECKLIST_TOTAL}` },
    { ok: pendingExpenses === 0, text: pendingExpenses ? `${pendingExpenses} driver expense${pendingExpenses > 1 ? 's' : ''} not approved` : 'Driver expenses approved' },
    { ok: balance === 0, text: balance ? `${rupees(balance)} still to collect` : 'Payment complete' },
    { ok: Boolean(a.feedback) || a.feedbackDeclined, text: a.feedback ? 'Family feedback received' : a.feedbackDeclined ? 'Family declined feedback' : 'Family feedback not received yet' },
  ];
  const closeCase = () => {
    const missing = closing.filter((c) => !c.ok).map((c) => `• ${c.text}`);
    if (missing.length && !window.confirm(`Some things are still open:\n\n${missing.join('\n')}\n\nClose the case anyway?`)) return;
    status.mutate({ id: a.id, status: 'Completed' }, { onSuccess: () => showToast('Case closed.', 'info'), onError: failed });
  };

  return (
    <>
    <CaseFile a={a} />
    <div className="ops-grid-2">
      <div>
        <div className="crm-section-card">
          <div className="crm-card-header"><h3>1 · Driver, vehicle and route</h3></div>
          <p className="comms-help" style={{ marginTop: 0 }}>
            {a.family} · {dateLabel(a.date)} at {timeLabel(a)}. Drivers and vehicles that are busy, on leave or under maintenance are greyed out.
          </p>
          <ResourcePicker a={a} ctx={ctx} driverNames={driverNames} />
          <div className="mini-list" style={{ marginTop: 14 }}>
            <div className="mini-row">
              <span>Coordinator</span>
              <select
                className="form-select"
                style={{ maxWidth: 220, fontSize: '0.85rem' }}
                value={team.find((p) => p.name === a.coordinator)?.id ?? ''}
                onChange={(e) => coordinator.mutate({ id: a.id, coordinatorId: e.target.value || null }, { onError: failed })}
              >
                <option value="">Unassigned</option>
                {team.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <LocationRow label="Pickup" value={a.pickupLocation} saving={route.isPending} onSave={(v) => route.mutate({ id: a.id, pickup: v }, { onError: failed })} />
            <LocationRow label="Destination" value={a.destinationLocation} saving={route.isPending} onSave={(v) => route.mutate({ id: a.id, destination: v }, { onError: failed })} />
          </div>
        </div>

        <div className="crm-section-card">
          <div className="crm-card-header">
            <h3>2 · Before the service</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>{done}/{CHECKLIST_TOTAL} done · tap to tick</span>
          </div>
          <div className="checklist-container">
            {CHECKLIST_ITEMS.map((item) => (
              <div
                key={item.key}
                className={`checklist-row ${a.checklist[item.key] ? 'checked' : ''}`}
                onClick={() => toggle.mutate({ id: a.id, key: item.key, value: !a.checklist[item.key] }, { onError: failed })}
              >
                <div className="checklist-checkbox">{a.checklist[item.key] ? '✓' : ''}</div>
                <span className="checklist-text">{item.label.replace(/^✓ /, '')}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="crm-section-card">
          <div className="crm-card-header"><h3>5 · Money and closing the case</h3></div>
          <div className="mini-list">
            <div className="mini-row"><span>Quoted</span><strong>{rupees(quoted)}</strong></div>
            <div className="mini-row"><span>Received</span><strong>{rupees(a.paidAmount)}</strong></div>
            <div className="mini-row"><span>Driver expenses (actual)</span><strong>{rupees(spent)}</strong></div>
            <div className="mini-row"><span>Quote minus driver expenses</span><strong>{rupees(quoted - spent)}</strong></div>
          </div>
          {(task?.expenses ?? []).length > 0 && (
            <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', margin: '8px 0' }}>
              {(task?.expenses ?? []).map((e) => `${e.category} ${rupees(e.amount)}${e.approved_at ? '' : ' (not approved)'}`).join(' · ')}
            </div>
          )}
          <div style={{ display: 'grid', gap: 6, margin: '12px 0' }}>
            {closing.map((c) => <div key={c.text} style={{ fontSize: '0.88rem', color: c.ok ? 'inherit' : '#8a1f17' }}>{c.ok ? '✅' : '⬜'} {c.text}</div>)}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" type="button" disabled={a.status === 'Completed' || status.isPending} onClick={closeCase}>
              {a.status === 'Completed' ? 'Case closed' : 'Close case'}
            </button>
            {!a.feedback && (
              <button className="btn btn-secondary" type="button" disabled={declineFeedback.isPending} onClick={() => declineFeedback.mutate({ id: a.id, declined: !a.feedbackDeclined }, { onError: failed })}>
                {a.feedbackDeclined ? 'Undo “family declined feedback”' : 'Family declined feedback'}
              </button>
            )}
          </div>
          <p className="comms-help" style={{ marginBottom: 0 }}>Feedback is a separate follow up. It never stops the service being completed.</p>
        </div>
      </div>

      <div>
        <div className="crm-section-card">
          <div className="crm-card-header">
            <h3>3 · On the day</h3>
            {task && <span className="status-badge status-enroute">{DRIVER_STATUS_LABEL[task.task.status]}</span>}
          </div>
          <div className="exec-timeline">
            {EXEC_STAGES.map((st, i) => {
              const n = i + 1;
              return (
                <div key={st.name} className={`exec-node-item ${n < stage ? 'done' : n === stage ? 'active' : ''}`}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{st.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>{st.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12, fontSize: '0.85rem' }}>
            {fix ? (
              <>
                📍 Driver last seen {new Date(fix.at).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })} ·{' '}
                <a href={mapUrl(fix)} target="_blank" rel="noreferrer noopener">Open on map</a>
              </>
            ) : (
              <span style={{ color: 'var(--ink-muted)' }}>📍 No location yet. It appears once the driver shares it from the Driver App.</span>
            )}
          </div>
        </div>

        <div className="crm-section-card">
          <div className="crm-card-header"><h3>4 · Update the family</h3></div>
          <p className="comms-help" style={{ marginTop: 0 }}>
            One tap opens WhatsApp with the message ready to send to {a.contactName || a.family}{a.phone ? ` (${a.phone})` : ''}. It is also saved in Communications.
          </p>
          {!a.phone && <p style={{ color: '#8a1f17', fontSize: '0.85rem' }}>No phone number on this case.</p>}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {FAMILY_UPDATES.map((u) => (
              <button key={u.key} type="button" className="btn btn-sm btn-secondary" disabled={!a.phone} onClick={() => sendUpdate(u.key)}>
                {u.label} ↗
              </button>
            ))}
          </div>
          {isAssigned(a.driver) && !fix && <p className="comms-help">“On the way” will include a map link once the driver’s location is available.</p>}
        </div>

        <div className="crm-section-card">
          <div className="crm-card-header"><h3>Handover record</h3></div>
          <p className="comms-help" style={{ marginTop: 0 }}>Write down who received the family or the body, so there is always a record.</p>
          <div className="form-group" style={{ marginBottom: 10 }}>
            <label className="form-label">Received by</label>
            <input className="form-input" value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)} placeholder="Name and relation, e.g. Ramesh, son" />
          </div>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="form-label">Note (optional)</label>
            <input className="form-input" value={handoverNote} onChange={(e) => setHandoverNote(e.target.value)} placeholder="Anything worth remembering" />
          </div>
          <button className="btn btn-secondary" type="button" disabled={log.isPending} onClick={saveHandover}>Save handover</button>
        </div>
      </div>
    </div>
    </>
  );
}
