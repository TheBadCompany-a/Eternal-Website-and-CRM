import { useNavigate } from 'react-router-dom';
import type { Vehicle } from '../../../types';

export function FleetStatsCard({ fleet }: { fleet: Vehicle[] }) {
  const navigate = useNavigate();
  const onDuty = fleet.filter((v) => v.status === 'On Duty').length;
  const available = fleet.filter((v) => v.status === 'Available').length;
  const maintenance = fleet.filter((v) => v.status === 'Under Maintenance').length;

  return (
    <div className="crm-section-card">
      <div className="crm-card-header">
        <h3>6. Fleet</h3>
        <button className="btn btn-sm btn-secondary" onClick={() => navigate('/crm/vehicles')}>
          Manage Fleet →
        </button>
      </div>
      <div className="mini-list">
        <div className="mini-row">
          <span>Total Vehicles</span>
          <strong>{fleet.length}</strong>
        </div>
        <div className="mini-row">
          <span>On Duty</span>
          <strong style={{ color: 'var(--amber-700)' }}>{onDuty}</strong>
        </div>
        <div className="mini-row">
          <span>Available</span>
          <strong style={{ color: 'var(--moss-700)' }}>{available}</strong>
        </div>
        <div className="mini-row">
          <span>Under Maintenance</span>
          <strong style={{ color: 'var(--clay-700)' }}>{maintenance}</strong>
        </div>
      </div>
    </div>
  );
}
