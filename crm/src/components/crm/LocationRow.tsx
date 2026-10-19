import { useEffect, useState } from 'react';

const PLACEHOLDER = 'To be confirmed';

/**
 * A pickup or destination line with two ways to fill it:
 * 1. the address the customer gave in the website form (shown as it arrived), or
 * 2. typed in by staff when the customer did not give one.
 */
export function LocationRow({
  label,
  value,
  onSave,
  saving,
}: {
  label: string;
  value: string;
  onSave: (next: string) => void;
  saving?: boolean;
}) {
  const given = value && value !== PLACEHOLDER;
  const [editing, setEditing] = useState(!given);
  const [draft, setDraft] = useState(given ? value : '');

  useEffect(() => {
    setEditing(!given);
    setDraft(given ? value : '');
  }, [value, given]);

  const commit = () => {
    if (draft.trim() === (given ? value : '')) {
      setEditing(!given);
      return;
    }
    onSave(draft);
  };

  return (
    <div className="mini-row" style={{ alignItems: 'flex-start' }}>
      <span>{label}</span>
      {editing ? (
        <span style={{ display: 'flex', gap: 6, alignItems: 'center', maxWidth: 320, flex: 1, justifyContent: 'flex-end' }}>
          <input
            className="form-input"
            style={{ fontSize: '0.85rem', padding: '6px 10px' }}
            value={draft}
            placeholder={`Enter ${label.toLowerCase()} (not given by customer)`}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && commit()}
          />
          <button type="button" className="btn btn-sm btn-primary" disabled={saving || !draft.trim()} onClick={commit}>
            Save
          </button>
        </span>
      ) : (
        <span style={{ textAlign: 'right' }}>
          <strong>{value}</strong>
          <br />
          <span style={{ fontSize: '0.72rem', color: 'var(--ink-muted)' }}>
            From the customer's form ·{' '}
            <button type="button" onClick={() => setEditing(true)} style={{ background: 'none', border: 0, padding: 0, color: 'inherit', textDecoration: 'underline', cursor: 'pointer', font: 'inherit' }}>
              Change
            </button>
          </span>
        </span>
      )}
    </div>
  );
}
