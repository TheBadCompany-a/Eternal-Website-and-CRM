import { useNavigate } from 'react-router-dom';
import type { Arrangement, ArrangementStatus } from '../../types';
import { quotedFor } from '../../lib/paymentCategory';
import { useAppDispatch } from '../../state/useAppState';
import { useDeleteArrangement, useUpdateArrangementStatus } from '../../data/useArrangements';
import { useAuth } from '../../auth/useAuth';
import { useToast } from '../../toast/useToast';

export function KanbanCard({ item, target }: { item: Arrangement; target: ArrangementStatus | null }) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const updateStatus = useUpdateArrangementStatus();
  const deleteArrangement = useDeleteArrangement();
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  return (
    <div
      className="kanban-card"
      style={{ position: 'relative' }}
      onClick={() => {
        dispatch({ type: 'OPEN_OPS_CASE', caseId: item.id });
        navigate('/crm/operations');
      }}
    >
      {isAdmin && (
        <button
          title="Remove lead"
          aria-label="Remove lead"
          onClick={(e) => {
            e.stopPropagation();
            if (!window.confirm(`Remove ${item.family} (${item.id})? This hides it from the CRM but keeps the record for audit purposes.`)) {
              return;
            }
            deleteArrangement.mutate(item.id, {
              onSuccess: () => showToast(`${item.id} removed.`, 'info'),
              onError: () => showToast('Could not remove this lead — please try again.', 'info'),
            });
          }}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            background: 'transparent',
            color: 'var(--ink-muted)',
            cursor: 'pointer',
            borderRadius: 4,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--crimson-100)';
            e.currentTarget.style.color = 'var(--crimson-600)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--ink-muted)';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      )}

      <div className="kanban-card-id">{item.id}</div>
      <div className="kanban-card-title">{item.family}</div>
      <div className="kanban-card-meta">
        <div>
          <strong>{item.serviceType}</strong>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
          {item.date} · {item.time}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--ink-secondary)', marginTop: 2 }}>
          📍 {item.pickupLocation.split(',')[0]}
        </div>
        <div style={{ fontWeight: 700, color: 'var(--moss-900)', marginTop: 4 }}>
          {quotedFor(item) > 0 ? `₹${quotedFor(item).toLocaleString('en-IN')}` : 'Quote pending'}
        </div>
      </div>
      <div className="kanban-card-actions">
        <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>{item.coordinator}</span>
        {target ? (
          <button
            className="btn btn-sm btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              updateStatus.mutate(
                { id: item.id, status: target },
                {
                  onSuccess: () => showToast(`Arrangement ${item.id} transitioned to "${target}"`, 'info'),
                  onError: () => showToast(`Could not update ${item.id} — please try again.`, 'info'),
                },
              );
            }}
          >
            Next →
          </button>
        ) : (
          <span style={{ fontSize: '0.75rem', color: 'var(--moss-700)', fontWeight: 700 }}>✓ Closed</span>
        )}
      </div>
    </div>
  );
}
