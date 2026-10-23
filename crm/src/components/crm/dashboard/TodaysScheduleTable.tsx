import { useNavigate } from 'react-router-dom';
import type { Arrangement } from '../../../types';
import { useAppDispatch } from '../../../state/useAppState';
import { StatusBadge } from '../StatusBadge';
import { todayIso } from '../../../data/useHr';
import { isBooked } from '../../../lib/caseStatus';

export function TodaysScheduleTable({ arrangements, filter }: { arrangements: Arrangement[]; filter: string }) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const today = todayIso();
  // Only services booked for today, in time order. Search narrows them further.
  const filtered = arrangements
    .filter((a) => isBooked(a) && a.date === today)
    .filter((a) => a.family.toLowerCase().includes(filter) || a.id.toLowerCase().includes(filter) || a.serviceType.toLowerCase().includes(filter))
    .sort((x, y) => x.time.localeCompare(y.time));

  return (
    <div className="crm-section-card">
      <div className="crm-card-header">
        <h3>3. Today's Schedule</h3>
      </div>
      <div className="crm-table-wrapper">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Arrangement ID</th>
              <th>Family</th>
              <th>Service</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ color: 'var(--ink-muted)' }}>Nothing is booked for today.</td></tr>
            )}
            {filtered.slice(0, 8).map((a) => (
              <tr key={a.id}>
                <td>
                  <strong>{a.time}</strong>
                </td>
                <td>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--moss-800)' }}>{a.id}</span>
                </td>
                <td>
                  <strong>{a.family}</strong>
                </td>
                <td>{a.serviceType}</td>
                <td>
                  <StatusBadge status={a.status} label={a.status === 'In Execution' ? 'En Route' : a.status} />
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      dispatch({ type: 'OPEN_OPS_CASE', caseId: a.id });
                      navigate('/crm/operations');
                    }}
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
