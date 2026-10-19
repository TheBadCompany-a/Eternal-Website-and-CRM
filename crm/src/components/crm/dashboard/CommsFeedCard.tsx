import { useNavigate } from 'react-router-dom';
import type { Communication } from '../../../types';

function channelIcon(channel: Communication['channel']) {
  if (channel === 'WhatsApp') return '💬';
  if (channel === 'Call') return '📞';
  return '✉️';
}

export function CommsFeedCard({ communications }: { communications: Communication[] }) {
  const navigate = useNavigate();

  return (
    <div className="crm-section-card">
      <div className="crm-card-header">
        <h3>8. Communications</h3>
        <button className="btn btn-sm btn-secondary" onClick={() => navigate('/crm/communications')}>
          Open Hub →
        </button>
      </div>
      <div>
        {communications.slice(0, 4).map((c) => (
          <div key={c.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-delicate)', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontWeight: 600, marginBottom: 2 }}>
              <span>
                {channelIcon(c.channel)} {c.sender} ({c.caseId})
              </span>
              <span style={{ color: 'var(--ink-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap', flexShrink: 0 }}>{c.time}</span>
            </div>
            <div style={{ color: 'var(--ink-secondary)' }}>{c.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
