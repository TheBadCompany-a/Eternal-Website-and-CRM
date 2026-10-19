import { useArrangements } from '../../../data/useArrangements';

export function FeedbackScreen() {
  const arrangements = useArrangements();
  const feedbackItems = (arrangements.data ?? []).filter((a) => a.feedback);

  return (
    <div className="crm-screen active">
      <div className="crm-section-card">
        <div className="crm-card-header">
          <h3>Step 20 · Respectful Bereavement Feedback & Care Quality</h3>
        </div>
        <div className="mini-list">
          {feedbackItems.map((f) => (
            <div
              key={f.id}
              style={{
                padding: 14,
                border: '1px solid var(--border-delicate)',
                borderRadius: 6,
                marginBottom: 10,
                background: 'var(--bg-sand-light)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <strong>
                  {f.family} ({f.id})
                </strong>
                <span style={{ color: 'var(--amber-600)', fontWeight: 700 }}>★ {f.feedback?.rating}/5</span>
              </div>
              <p style={{ fontSize: '0.88rem', fontStyle: 'italic', color: 'var(--ink-primary)', marginTop: 4 }}>
                "{f.feedback?.comment}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
