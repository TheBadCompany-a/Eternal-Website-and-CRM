import { useState } from 'react';
import type { Arrangement } from '../../../types';
import { useProfiles } from '../../../data/useProfiles';
import { useCaseHandovers, useHandOverCase } from '../../../data/useHandovers';
import { useToast } from '../../../toast/useToast';
import { Modal } from '../../../modal/Modal';

export function HandoverModal({ a, onClose }: { a: Arrangement; onClose: () => void }) {
  const { showToast } = useToast();
  const profiles = useProfiles();
  const handovers = useCaseHandovers(a.id);
  const handOver = useHandOverCase();

  const team = (profiles.data ?? []).filter((p) => p.appRole !== 'driver');
  const [toProfileId, setToProfileId] = useState('');
  const [reason, setReason] = useState('');
  const [nextAction, setNextAction] = useState(a.nextAction || '');
  const [dueTime, setDueTime] = useState('');

  const targetMember = team.find((m) => m.id === toProfileId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toProfileId || !targetMember) {
      return showToast('Please select a staff member to hand over to.', 'info');
    }
    if (!reason.trim()) {
      return showToast('Please provide a reason for the handover.', 'info');
    }
    if (!nextAction.trim()) {
      return showToast('Please define the next action for the new executive.', 'info');
    }

    handOver.mutate(
      {
        arrangementId: a.id,
        toProfileId,
        toName: targetMember.name,
        reason: reason.trim(),
        nextAction: nextAction.trim(),
        dueIso: dueTime ? new Date(dueTime).toISOString() : undefined,
      },
      {
        onSuccess: () => {
          showToast(`Case ${a.id} handed over to ${targetMember.name}. Next action saved.`, 'info');
          onClose();
        },
        onError: () => showToast('Could not complete the handover.', 'info'),
      },
    );
  };

  const history = handovers.data ?? [];

  return (
    <Modal
      wide
      isOpen
      onClose={onClose}
      headerContent={<h3>Case Handover · {a.id}</h3>}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            type="submit"
            form="handover-case-form"
            className="btn btn-primary"
            disabled={handOver.isPending}
          >
            {handOver.isPending ? 'Saving Handover…' : 'Confirm Handover'}
          </button>
        </>
      }
    >
      <div style={{ maxWidth: 640 }}>
        <p className="comms-help" style={{ marginTop: 0, marginBottom: 16 }}>
          Transfer responsibility for <strong>{a.family}</strong> ({a.serviceType}). Both staff members will see the next action and handover history without needing to contact the family again.
        </p>

        <div style={{ background: 'var(--bg-sand-light, #fbf9f5)', padding: '12px 14px', borderRadius: 8, marginBottom: 18, border: '1px solid var(--border-delicate)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.86rem' }}>
            <div>
              <span style={{ color: 'var(--ink-muted)' }}>Current Back end Executive:</span><br />
              <strong>{a.executive || a.coordinator}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--ink-muted)' }}>Operations Coordinator:</span><br />
              <strong>{a.coordinator || 'Unassigned'}</strong>
            </div>
          </div>
          {a.nextAction && (
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed var(--border-delicate)', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--moss-700)', fontWeight: 600 }}>Current Next Action:</span> {a.nextAction}
            </div>
          )}
        </div>

        <form id="handover-case-form" onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Hand over to (Back end Executive) *</label>
            <select
              className="form-select"
              value={toProfileId}
              onChange={(e) => setToProfileId(e.target.value)}
              required
            >
              <option value="">Select staff member…</option>
              {team.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role} · {m.activeCases} active cases)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Reason for handover *</label>
            <input
              className="form-input"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. End of shift, escalation for special rituals, regional coverage"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Next Action (What must be done next) *</label>
            <textarea
              className="form-input"
              rows={2}
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              placeholder="e.g. Call family at 4:00 PM to confirm hearse van arrival and priest items."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Next Action Target Due Date & Time (Optional)</label>
            <input
              type="datetime-local"
              className="form-input"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
            />
          </div>

        </form>

        <hr style={{ border: 0, borderTop: '1px solid var(--border-delicate)', margin: '24px 0 16px' }} />

        <div>
          <h4 style={{ margin: '0 0 10px', fontSize: '0.95rem' }}>Handover History ({history.length})</h4>
          {history.length === 0 ? (
            <p className="comms-help" style={{ margin: 0 }}>No prior handovers recorded for this case.</p>
          ) : (
            <div style={{ display: 'grid', gap: 10, maxHeight: 220, overflowY: 'auto' }}>
              {history.map((h) => (
                <div
                  key={h.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--border-delicate)',
                    background: 'var(--bg-card, #fff)',
                    fontSize: '0.84rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                    <strong>{h.fromName} ➔ {h.toName}</strong>
                    <span style={{ fontSize: '0.76rem', color: 'var(--ink-muted)' }}>
                      {new Date(h.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ color: 'var(--ink-secondary)', marginBottom: 2 }}>
                    <em>Reason:</em> {h.reason}
                  </div>
                  {h.nextAction && (
                    <div style={{ color: 'var(--moss-700)', fontWeight: 500 }}>
                      👉 <em>Next action:</em> {h.nextAction}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
