import { useNavigate } from 'react-router-dom';
import type { Arrangement } from '../../../types';
import { StatusBadge } from '../StatusBadge';

export function RecentArrangementsTable({ arrangements }: { arrangements: Arrangement[] }) {
  const navigate = useNavigate();

  return (
    <div className="crm-section-card">
      <div className="crm-card-header">
        <h3>4. Recent Arrangements</h3>
        <button className="btn btn-sm btn-secondary" onClick={() => navigate('/crm/arrangements')}>
          View All →
        </button>
      </div>
      <div className="crm-table-wrapper">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Arrangement ID</th>
              <th>Family</th>
              <th>Service</th>
              <th>Location</th>
              <th>Time</th>
              <th>Coordinator</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {arrangements.slice(0, 5).map((a) => (
              <tr key={a.id}>
                <td>
                  <strong style={{ color: 'var(--moss-900)', fontFamily: 'monospace' }}>{a.id}</strong>
                </td>
                <td>{a.family}</td>
                <td>{a.serviceType}</td>
                <td>
                  <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
                    {a.destinationLocation.split(',')[0]}
                  </span>
                </td>
                <td>{a.time}</td>
                <td>{a.coordinator}</td>
                <td>
                  <StatusBadge status={a.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
