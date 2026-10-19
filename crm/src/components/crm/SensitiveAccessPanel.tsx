import { useAuth } from '../../auth/useAuth';
import { useLeadAccess, useSetLeadAccess } from '../../data/useLeadAccess';
import { useProfiles } from '../../data/useProfiles';
import { useToast } from '../../toast/useToast';

/** Admin-only: choose which staff may open a sensitive lead. */
export function SensitiveAccessPanel({ arrangementId, isSensitive }: { arrangementId: string; isSensitive: boolean }) {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const profiles = useProfiles();
  const access = useLeadAccess(arrangementId, isAdmin && isSensitive);
  const setAccess = useSetLeadAccess(arrangementId);

  if (!isAdmin) return null;
  if (!isSensitive) return <p className="sensitive-note">Mark the lead as sensitive and save to choose who can open it.</p>;

  const staff = (profiles.data ?? []).filter((member) => member.appRole !== 'admin');

  return (
    <div className="sensitive-access">
      <strong>Who can open this lead</strong>
      <p className="sensitive-note">Administrators always can. Tick anyone else who needs access.</p>
      {access.isError && <p className="sensitive-note">Could not load access. Has supabase/006_platform_expansion.sql been run?</p>}
      {staff.map((member) => (
        <label key={member.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0' }}>
          <input
            type="checkbox"
            checked={access.data?.has(member.id) ?? false}
            disabled={access.isLoading || setAccess.isPending}
            onChange={(e) =>
              setAccess.mutate(
                { profileId: member.id, granted: e.target.checked },
                { onSuccess: () => showToast(`${member.name} ${e.target.checked ? 'can now open' : 'can no longer open'} ${arrangementId}.`, 'info'), onError: () => showToast('Could not change access.', 'info') },
              )
            }
          />
          {member.name} <span style={{ color: 'var(--ink-muted)', fontSize: '0.78rem' }}>· {member.appRole}</span>
        </label>
      ))}
      {staff.length === 0 && <p className="sensitive-note">No other staff accounts yet.</p>}
    </div>
  );
}
