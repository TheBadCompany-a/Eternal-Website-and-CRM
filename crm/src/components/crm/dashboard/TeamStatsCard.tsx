import { useNavigate } from 'react-router-dom';
import type { TeamMember } from '../../../types';

export function TeamStatsCard({ team }: { team: TeamMember[] }) {
  const navigate = useNavigate();
  const onDuty = team.filter((t) => t.status === 'On Duty').length;
  const available = team.filter((t) => t.status === 'Available').length;
  const offDuty = team.filter((t) => t.status === 'Off Duty').length;

  return (
    <div className="crm-section-card">
      <div className="crm-card-header">
        <h3>7. Team</h3>
        <button className="btn btn-sm btn-secondary" onClick={() => navigate('/crm/team')}>
          View Roster →
        </button>
      </div>
      <div className="mini-list">
        <div className="mini-row">
          <span>Total Staff</span>
          <strong>{team.length}</strong>
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
          <span>Off Duty</span>
          <strong style={{ color: 'var(--ink-muted)' }}>{offDuty}</strong>
        </div>
      </div>
    </div>
  );
}
