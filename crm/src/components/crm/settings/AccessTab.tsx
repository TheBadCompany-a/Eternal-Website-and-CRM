import { useEffect, useState } from 'react';
import { useAuth } from '../../../auth/useAuth';
import { canOpen } from '../../../auth/access';
import { roleLabel } from '../../../auth/roles';
import { useAppSettings, useSaveSetting } from '../../../data/useSettings';
import { SCREEN_LABELS, type RoleAccess } from '../../../lib/settings';
import { useToast } from '../../../toast/useToast';
import type { CrmSidebarItem } from '../../../types';

const ROLES = ['coordinator', 'sales', 'accounts', 'operations', 'hr', 'backend_executive', 'driver'] as const;

/** A grid of roles and screens. Ticking a box lets that role open that screen. */
export function AccessTab() {
  const { user } = useAuth();
  const { settings } = useAppSettings();
  const save = useSaveSetting();
  const { showToast } = useToast();

  const build = (saved: RoleAccess): RoleAccess =>
    Object.fromEntries(ROLES.map((r) => [r, SCREEN_LABELS.filter((s) => canOpen(r, s.key, saved)).map((s) => s.key)]));
  const [draft, setDraft] = useState<RoleAccess>(() => build(settings.role_access));
  const savedJson = JSON.stringify(settings.role_access);
  useEffect(() => setDraft(build(settings.role_access)), [savedJson]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (role: string, item: CrmSidebarItem, on: boolean) => {
    const current = draft[role] ?? [];
    setDraft({ ...draft, [role]: on ? [...current, item] : current.filter((x) => x !== item) });
  };
  const dirty = JSON.stringify(draft) !== JSON.stringify(build(settings.role_access));

  return (
    <section className="crm-section-card">
      <div className="crm-card-header">
        <div>
          <h3>Who can open which screen</h3>
          <p className="comms-help" style={{ margin: 0 }}>Admins always see everything. Everyone can open Settings for their own account.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {dirty && <button className="btn btn-secondary" type="button" onClick={() => setDraft(build(settings.role_access))}>Undo changes</button>}
          <button
            className="btn btn-primary"
            type="button"
            disabled={!dirty || save.isPending}
            onClick={() => save.mutate({ key: 'role_access', value: draft, userId: user?.id }, { onSuccess: () => showToast('Access saved.', 'info'), onError: () => showToast('Could not save. Only an admin can change access.', 'info') })}
          >
            {save.isPending ? 'Saving…' : 'Save access'}
          </button>
        </div>
      </div>
      <div className="crm-table-wrapper">
        <table className="crm-table">
          <thead>
            <tr><th>Screen</th>{ROLES.map((r) => <th key={r} style={{ textAlign: 'center' }}>{roleLabel(r)}</th>)}</tr>
          </thead>
          <tbody>
            {SCREEN_LABELS.map((s) => (
              <tr key={s.key}>
                <td><strong>{s.label}</strong></td>
                {ROLES.map((r) => (
                  <td key={r} style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      aria-label={`${roleLabel(r)} can open ${s.label}`}
                      checked={s.key === 'settings' ? true : (draft[r] ?? []).includes(s.key)}
                      disabled={s.key === 'settings'}
                      onChange={(e) => toggle(r, s.key, e.target.checked)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="comms-help" style={{ marginTop: 12 }}>
        This controls the menu and which pages open. It does not hide data from someone who calls the database directly.
      </p>
    </section>
  );
}
