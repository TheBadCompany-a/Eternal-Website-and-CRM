import type { Callback } from '../../../types';
import { useResolveCallback } from '../../../data/useCallbacks';
import { useToast } from '../../../toast/useToast';

export function CallbacksList({ callbacks }: { callbacks: Callback[] }) {
  const resolveCallback = useResolveCallback();
  const { showToast } = useToast();

  const handleAction = (cb: Callback, action: 'call' | 'whatsapp' | 'complete') => {
    const digits = cb.phone.replace(/\D/g, '');
    if (action === 'call') {
      window.location.href = `tel:${cb.phone.replace(/[^\d+]/g, '')}`;
      return;
    }
    if (action === 'whatsapp') {
      window.open(`https://wa.me/${digits}`, '_blank', 'noopener');
      return;
    }
    resolveCallback.mutate(cb.id, {
      onSuccess: () => showToast(`Callback request ${cb.id} marked as handled.`, 'info'),
      onError: () => showToast('Could not update the callback — please try again.', 'info'),
    });
  };

  return (
    <div className="crm-section-card">
      <div className="crm-card-header">
        <h3>5. Coordinator Callbacks</h3>
        <span className="status-badge status-enroute">Action Required</span>
      </div>
      <div>
        {callbacks.length === 0 ? (
          <div style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', padding: '10px 0' }}>No customers waiting.</div>
        ) : (
          callbacks.map((cb) => (
            <div
              key={cb.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: '1px solid var(--border-delicate)',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{cb.family}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--amber-700)' }}>
                  {cb.phone} · Waiting {cb.waitingMins}m
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--ink-muted)' }}>{cb.reason}</div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="btn btn-sm btn-primary" onClick={() => handleAction(cb, 'call')}>
                  Call
                </button>
                <button className="btn btn-sm btn-secondary" onClick={() => handleAction(cb, 'whatsapp')}>
                  WhatsApp
                </button>
                <button className="btn btn-sm btn-secondary" onClick={() => handleAction(cb, 'complete')}>
                  Complete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
