import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../auth/useAuth';
import { useArrangements, useToggleChecklistItem } from '../../../data/useArrangements';
import { CHECKLIST_ITEMS } from '../checklist';
import { DRIVER_STATUS_LABEL, DRIVER_STEPS, useAddDriverExpense, useDriverAction, useDriverBoard } from '../../../data/useDriverTasks';
import { useProfiles } from '../../../data/useProfiles';
import { useUpdateRoute } from '../../../data/useArrangements';
import { LocationRow } from '../LocationRow';
import { todayIso, useAttendance, useMarkAttendance } from '../../../data/useHr';
import { useToast } from '../../../toast/useToast';

const rupees = (value: number) => `₹${value.toLocaleString('en-IN')}`;

function timeAgo(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return hours < 24 ? `${hours} h ago` : new Date(iso).toLocaleDateString('en-IN');
}

function currentPosition(): Promise<{ latitude: number; longitude: number } | 'unavailable'> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve('unavailable');
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => resolve('unavailable'),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  });
}

export function DriverAppScreen() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const arrangements = useArrangements();
  const profiles = useProfiles();
  const board = useDriverBoard();
  const act = useDriverAction();
  const addExpense = useAddDriverExpense();
  const toggleChecklist = useToggleChecklistItem();

  const updateRoute = useUpdateRoute();
  const attendance = useAttendance();
  const markAttendance = useMarkAttendance();
  const todayRow = (attendance.data ?? []).find((r) => r.profile_id === user?.id && r.work_date === todayIso());
  const checkedIn = Boolean(todayRow?.check_in);
  const checkedOut = Boolean(todayRow?.check_out);
  const clock = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '');
  const hoursWorked =
    todayRow?.check_in && todayRow?.check_out
      ? ((new Date(todayRow.check_out).getTime() - new Date(todayRow.check_in).getTime()) / 3_600_000).toFixed(1)
      : null;

  const [dutyMessage, setDutyMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const dutyAction = (kind: 'in' | 'out') => {
    if (!user) {
      setDutyMessage({ ok: false, text: 'You are not signed in. Please sign out and sign in again.' });
      return;
    }
    setDutyMessage(null);
    const now = new Date().toISOString();
    markAttendance.mutate(
      kind === 'in'
        ? { profileId: user.id, status: 'Present', checkIn: now, checkOut: null }
        : { profileId: user.id, status: 'Present', checkOut: now },
      {
        onSuccess: () => {
          const text = kind === 'in' ? 'You are checked in. Have a safe day.' : 'You are checked out. Thank you for today.';
          setDutyMessage({ ok: true, text });
          showToast(text, 'info');
        },
        onError: (err) => {
          console.error('Check-in/out failed:', err);
          setDutyMessage({ ok: false, text: `Could not save your ${kind === 'in' ? 'check-in' : 'check-out'}: ${(err as { message?: string }).message ?? 'please try again'}` });
          showToast('Could not save this. Please try again.', 'info');
        },
      },
    );
  };

  const [selectedId, setSelectedId] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Fuel');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!selectedId && arrangements.data?.length) setSelectedId(arrangements.data[0].id);
  }, [arrangements.data, selectedId]);

  const selected = arrangements.data?.find((item) => item.id === selectedId);
  const view = board.data?.get(selectedId);
  const status = view?.task.status ?? 'Assigned';
  const progress = DRIVER_STEPS.indexOf(status);
  const nextStatus = DRIVER_STEPS[progress + 1];
  const activeCount = useMemo(() => arrangements.data?.filter((item) => item.status !== 'Completed').length ?? 0, [arrangements.data]);
  const inField = [...(board.data?.values() ?? [])].filter((item) => item.task.status !== 'Assigned' && item.task.status !== 'Completed');
  const nameOf = (id: string | null) => profiles.data?.find((member) => member.id === id)?.name ?? '—';
  const familyOf = (arrangementId: string) => arrangements.data?.find((item) => item.id === arrangementId)?.family ?? arrangementId;

  const failed = () => showToast('Could not save — has supabase/009_driver_live_tracking.sql been run?', 'info');
  const run = (action: Parameters<typeof act.mutate>[0], message: string) =>
    act.mutate(action, { onSuccess: () => showToast(message, 'info'), onError: failed });

  const advance = () => {
    if (!user || !nextStatus) return;
    run({ arrangementId: selectedId, driverId: user.id, status: nextStatus, note: note.trim() || undefined }, `Marked ${DRIVER_STATUS_LABEL[nextStatus].toLowerCase()}. The office can see this now.`);
    setNote('');
  };

  const confirmAttendance = () => user && run({ arrangementId: selectedId, driverId: user.id, confirmAttendance: true }, 'Attendance confirmed.');

  const updateLocation = async () => {
    if (!user) return;
    const location = await currentPosition();
    run({ arrangementId: selectedId, driverId: user.id, location }, location === 'unavailable' ? 'Location unavailable — logged the update without coordinates.' : 'Location shared with the office.');
  };

  const submitExpense = () => {
    const amount = Number(expenseAmount);
    if (!user || !amount || amount < 0) return;
    addExpense.mutate(
      { arrangementId: selectedId, driverId: user.id, category: expenseCategory, amount },
      { onSuccess: () => { setExpenseAmount(''); showToast('Expense added.', 'info'); }, onError: failed },
    );
  };

  return (
    <div className="crm-screen active">
      <section className="driver-hero">
        <div>
          <span>Driver application</span>
          <h3>Today’s field tasks</h3>
          <p>Check in, record task progress, confirm arrival and pickup, add expenses. Every update reaches the office live.</p>
        </div>
        <div><strong>{activeCount}</strong><small>active assignments</small></div>
      </section>

      <section className="crm-section-card" style={{ marginBottom: 16 }}>
        <div className="crm-card-header">
          <div>
            <h3>My duty today</h3>
            <p className="comms-help" style={{ margin: 0 }}>
              {!checkedIn && 'You have not checked in yet.'}
              {checkedIn && !checkedOut && `Checked in at ${clock(todayRow?.check_in)}.`}
              {checkedOut && `Checked in ${clock(todayRow?.check_in)} · checked out ${clock(todayRow?.check_out)}${hoursWorked ? ` · ${hoursWorked} h on duty` : ''}.`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" type="button" disabled={checkedIn || markAttendance.isPending} onClick={() => dutyAction('in')}>
              Check in
            </button>
            <button className="btn btn-secondary" type="button" disabled={!checkedIn || checkedOut || markAttendance.isPending} onClick={() => dutyAction('out')}>
              Check out
            </button>
          </div>
        </div>
        {dutyMessage && (
          <p role={dutyMessage.ok ? 'status' : 'alert'} style={{ margin: '4px 0 0', fontSize: '0.85rem', color: dutyMessage.ok ? 'var(--moss-700)' : 'var(--crimson-600)' }}>
            {dutyMessage.text}
          </p>
        )}
        {attendance.isError && (
          <p role="alert" style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--crimson-600)' }}>
            Today's attendance could not be loaded. Please refresh.
          </p>
        )}
      </section>

      {board.isError && (
        <div className="crm-section-card">
          <p className="comms-help">Field data could not be loaded. Run <code>supabase/009_driver_live_tracking.sql</code> in the Supabase SQL Editor, then refresh.</p>
        </div>
      )}

      <section className="crm-section-card">
        <div className="crm-card-header">
          <div><h3>Live field tracking</h3><p className="comms-help">{inField.length} in the field now · updates automatically</p></div>
        </div>
        <div className="crm-table-wrapper">
          <table className="crm-table">
            <thead><tr><th>Case</th><th>Family</th><th>Driver</th><th>Status</th><th>Last update</th><th>Location</th><th>Expenses</th></tr></thead>
            <tbody>
              {(board.data?.size ?? 0) === 0 && <tr><td colSpan={7}>No driver activity yet. Tasks appear here as soon as a driver checks in.</td></tr>}
              {[...(board.data?.values() ?? [])].map(({ task, expenseTotal, latestNote, lastFix }) => (
                <tr key={task.id} onClick={() => setSelectedId(task.arrangement_id)} style={{ cursor: 'pointer' }} title={latestNote?.note ?? undefined}>
                  <td><strong>{task.arrangement_id}</strong></td>
                  <td>{familyOf(task.arrangement_id)}</td>
                  <td>{nameOf(task.driver_id)}</td>
                  <td><span className={`status-badge ${task.status === 'Completed' ? 'status-confirmed' : task.status === 'Assigned' ? 'status-inquiry' : 'status-enroute'}`}>{DRIVER_STATUS_LABEL[task.status]}</span></td>
                  <td>{timeAgo(task.updated_at)}{latestNote?.note ? ` · “${latestNote.note}”` : ''}</td>
                  <td>
                    {lastFix
                      ? <a href={`https://www.google.com/maps?q=${lastFix.latitude},${lastFix.longitude}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>Map · {timeAgo(lastFix.at)}</a>
                      : '—'}
                  </td>
                  <td>{expenseTotal ? rupees(expenseTotal) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="driver-layout">
        <section className="crm-section-card" style={{ marginBottom: 0 }}>
          <div className="crm-card-header">
            <h3>Task card</h3>
            <select className="comms-control driver-select" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
              {(arrangements.data ?? []).map((item) => <option value={item.id} key={item.id}>{item.id} — {item.family}</option>)}
            </select>
          </div>
          {selected && (
            <>
              <div className="mini-list">
                <LocationRow
                  label="Pickup"
                  value={selected.pickupLocation}
                  saving={updateRoute.isPending}
                  onSave={(v) => updateRoute.mutate({ id: selected.id, pickup: v }, { onError: () => showToast('Could not save the pickup.', 'info') })}
                />
                <LocationRow
                  label="Destination"
                  value={selected.destinationLocation}
                  saving={updateRoute.isPending}
                  onSave={(v) => updateRoute.mutate({ id: selected.id, destination: v }, { onError: () => showToast('Could not save the destination.', 'info') })}
                />
                <div className="mini-row"><span>Service time</span><strong>{selected.date} · {selected.time}</strong></div>
                <div className="mini-row"><span>Customer contact</span><strong>{selected.contactName} · {selected.phone}</strong></div>
              </div>
              <div className="driver-checklist">
                <label className="comms-label">Duty checklist · {CHECKLIST_ITEMS.filter((item) => selected.checklist[item.key]).length}/{CHECKLIST_ITEMS.length} done</label>
                <div className="checklist-container">
                  {CHECKLIST_ITEMS.map((item) => (
                    <div
                      key={item.key}
                      className={`checklist-row ${selected.checklist[item.key] ? 'checked' : ''}`}
                      onClick={() => toggleChecklist.mutate({ id: selected.id, key: item.key, value: !selected.checklist[item.key] }, { onError: () => showToast('Could not update the checklist.', 'info') })}
                    >
                      <div className="checklist-checkbox">{selected.checklist[item.key] ? '✓' : ''}</div>
                      <span className="checklist-text">{item.label.replace(/^✓ /, '')}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="driver-stepper">
                {DRIVER_STEPS.map((step, index) => (
                  <div className={index <= progress ? 'done' : ''} key={step}>
                    <i>{index < progress ? '✓' : index + 1}</i><span>{DRIVER_STATUS_LABEL[step]}</span>
                  </div>
                ))}
              </div>
              <label className="comms-label" htmlFor="driver-note">Activity note</label>
              <textarea id="driver-note" className="comms-control comms-message" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional update for operations…" />
              <div className="driver-actions">
                <button className="btn btn-secondary" type="button" onClick={confirmAttendance}>✓ Confirm attendance</button>
                <button className="btn btn-secondary" type="button" onClick={() => void updateLocation()}>⌖ Update location</button>
                <button className="btn btn-primary" type="button" disabled={!nextStatus || act.isPending} onClick={advance}>
                  {nextStatus ? `Mark ${DRIVER_STATUS_LABEL[nextStatus].toLowerCase()}` : 'Task completed'}
                </button>
              </div>
              <p className="driver-timestamp">
                {view?.task.attendance_confirmed_at ? `Attendance confirmed ${new Date(view.task.attendance_confirmed_at).toLocaleString('en-IN')}` : 'Attendance not confirmed'}
                {' · '}
                {view?.task.last_location_at ? `Location updated ${new Date(view.task.last_location_at).toLocaleTimeString('en-IN')}` : 'No location update yet'}
              </p>
            </>
          )}
        </section>

        <section className="crm-section-card" style={{ marginBottom: 0 }}>
          <div className="crm-card-header"><h3>Expenses</h3><span className="status-badge status-enroute">{rupees(view?.expenseTotal ?? 0)}</span></div>
          <label className="comms-label">Category</label>
          <select className="comms-control" value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)}>
            <option>Fuel</option><option>Toll</option><option>Parking</option><option>Supplies</option><option>Other</option>
          </select>
          <label className="comms-label">Amount (₹)</label>
          <input className="comms-control" type="number" min="0" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} placeholder="0" />
          <button type="button" className="btn btn-primary" disabled={addExpense.isPending} onClick={submitExpense}>Add expense</button>
          <div className="expense-list">
            {view?.expenses.length
              ? view.expenses.map((expense) => <div key={expense.id}><span>{expense.category}</span><strong>{rupees(expense.amount)}</strong></div>)
              : <p>No expenses added for this task.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
