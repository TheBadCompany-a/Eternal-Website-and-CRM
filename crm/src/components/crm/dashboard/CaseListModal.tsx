import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../state/useAppState';
import type { Arrangement } from '../../../types';

const fmtDate = (d: string) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

/** Inline list of the cases behind a dashboard number. Each row opens that case in Operations. */
export function CaseListModal({
  title,
  items,
  onClose,
}: {
  title: string | null;
  items: Arrangement[];
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const openCase = (id: string, path: string) => {
    dispatch({ type: 'SET_ACTIVE_OPS_CASE', caseId: id });
    navigate(path);
  };

  if (title === null) return null;

  return (
    <div className="card" style={{ gridColumn: '1 / -1', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h3>{title} ({items.length})</h3>
        <button type="button" className="btn btn-sm btn-secondary" onClick={onClose}>Close</button>
      </div>
      {items.length === 0 ? (
        <p style={{ color: 'var(--ink-muted)', padding: '12px 0' }}>Nothing here right now.</p>
      ) : (
        <div className="crm-table-wrapper">
          <table className="crm-table">
            <thead>
              <tr><th>Reference</th><th>Customer</th><th>Service</th><th>Date</th><th>Status</th><th>Payment</th><th aria-label="Actions" /></tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id}>
                  <td><strong>{a.id}</strong></td>
                  <td>{a.contactName || a.family}<br /><span style={{ color: 'var(--ink-muted)', fontSize: '0.8rem' }}>{a.phone}</span></td>
                  <td>{a.serviceType}</td>
                  <td>{fmtDate(a.date)}</td>
                  <td>{a.status}</td>
                  <td>{a.paymentStatus}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn btn-sm btn-secondary" type="button" onClick={() => openCase(a.id, '/crm/operations')}>Open</button>
                    <button className="btn btn-sm btn-secondary" type="button" onClick={() => openCase(a.id, '/crm/payments')}>Payments</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
