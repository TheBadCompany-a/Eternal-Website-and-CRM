import { useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '../../../auth/useAuth';
import { useSaveSetting } from '../../../data/useSettings';
import { useToast } from '../../../toast/useToast';
import type { AllSettings } from '../../../lib/settings';

/** A card that edits one settings group and saves it with one button. */
export function SettingCard<K extends keyof AllSettings>({
  title,
  help,
  settingKey,
  value,
  children,
}: {
  title: string;
  help?: string;
  settingKey: K;
  value: AllSettings[K];
  children: (draft: AllSettings[K], set: (patch: Partial<AllSettings[K]>) => void) => ReactNode;
}) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const save = useSaveSetting();
  const [draft, setDraft] = useState<AllSettings[K]>(value);
  const json = JSON.stringify(value);
  useEffect(() => setDraft(value), [json]); // eslint-disable-line react-hooks/exhaustive-deps
  const dirty = JSON.stringify(draft) !== json;

  return (
    <section className="crm-section-card" style={{ marginBottom: 0 }}>
      <div className="crm-card-header">
        <div>
          <h3>{title}</h3>
          {help && <p className="comms-help" style={{ margin: 0 }}>{help}</p>}
        </div>
      </div>
      {children(draft, (patch) => setDraft({ ...draft, ...patch }))}
      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <button
          className="btn btn-primary"
          type="button"
          disabled={!dirty || save.isPending}
          onClick={() =>
            save.mutate(
              { key: settingKey, value: draft, userId: user?.id },
              { onSuccess: () => showToast(`${title} saved.`, 'info'), onError: () => showToast('Could not save. Only an admin can change settings.', 'info') },
            )
          }
        >
          {save.isPending ? 'Saving…' : 'Save'}
        </button>
        {dirty && <button className="btn btn-secondary" type="button" onClick={() => setDraft(value)}>Undo changes</button>}
      </div>
    </section>
  );
}

export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="form-group"><label className="form-label">{label}</label>{children}</div>
);
