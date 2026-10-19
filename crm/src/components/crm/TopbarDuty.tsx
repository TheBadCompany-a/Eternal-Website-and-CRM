import { useAuth } from '../../auth/useAuth';
import { todayIso, useAttendance, useMarkAttendance } from '../../data/useHr';
import { useToast } from '../../toast/useToast';

const clock = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '');

/** Check in / check out for the signed-in person, always visible in the header. */
export function TopbarDuty() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const attendance = useAttendance();
  const mark = useMarkAttendance();
  const row = (attendance.data ?? []).find((r) => r.profile_id === user?.id && r.work_date === todayIso());
  const checkedIn = Boolean(row?.check_in);
  const checkedOut = Boolean(row?.check_out);
  if (!user) return null;

  const act = (kind: 'in' | 'out') => {
    const now = new Date().toISOString();
    mark.mutate(
      kind === 'in' ? { profileId: user.id, status: 'Present', checkIn: now, checkOut: null } : { profileId: user.id, status: 'Present', checkOut: now },
      {
        onSuccess: () => showToast(kind === 'in' ? 'You are checked in. Have a safe day.' : 'You are checked out. Thank you for today.', 'info'),
        onError: () => showToast(`Could not save your ${kind === 'in' ? 'check-in' : 'check-out'}. Please try again.`, 'info'),
      },
    );
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {checkedIn && (
        <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', whiteSpace: 'nowrap' }}>
          {checkedOut ? `${clock(row?.check_in)} – ${clock(row?.check_out)}` : `Checked in ${clock(row?.check_in)}`}
        </span>
      )}
      {!checkedIn || checkedOut ? (
        <button className="btn btn-sm btn-primary" style={{ whiteSpace: 'nowrap' }} type="button" disabled={mark.isPending} onClick={() => act('in')}>
          {checkedOut ? 'Check in again' : 'Check in'}
        </button>
      ) : (
        <button className="btn btn-sm btn-secondary" style={{ whiteSpace: 'nowrap' }} type="button" disabled={mark.isPending} onClick={() => act('out')}>Check out</button>
      )}
    </div>
  );
}
