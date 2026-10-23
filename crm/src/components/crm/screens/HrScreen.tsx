import { useMemo, useState } from 'react';
import { useAuth } from '../../../auth/useAuth';
import type { HrAttendanceStatusRow, HrLeaveTypeRow } from '../../../data/database.types';
import { todayIso, useAttendance, useDecideLeave, useLeaveRequests, useMarkAttendance, useRequestLeave, useSalaries, useSalaryPayments, useSaveSalary, useSetSalaryPaid } from '../../../data/useHr';
import { useArrangements } from '../../../data/useArrangements';
import { BarList, ChartCard, StackedBars } from '../charts/Charts';
import { useProfiles } from '../../../data/useProfiles';
import { useToast } from '../../../toast/useToast';
import { SalaryExplainModal, type SalaryBreakdownData } from '../modal/SalaryExplainModal';

const ATTENDANCE_STATUSES: HrAttendanceStatusRow[] = ['Present', 'Half day', 'Absent', 'On leave'];
const LEAVE_TYPES: HrLeaveTypeRow[] = ['Casual', 'Sick', 'Earned', 'Unpaid', 'Other'];

const formatTime = (iso: string | null) => (iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—');
const formatDate = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
const daysBetween = (a: string, b: string) => Math.round((new Date(`${b}T00:00:00`).getTime() - new Date(`${a}T00:00:00`).getTime()) / 86_400_000) + 1;
const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const leaveBadge = (status: string) => (status === 'Approved' ? 'status-confirmed' : status === 'Rejected' ? 'status-urgent' : 'status-inquiry');

export function HrScreen() {
  const { profile, user } = useAuth();
  const { showToast } = useToast();
  const profiles = useProfiles();
  const attendance = useAttendance();
  const leave = useLeaveRequests();
  const markAttendance = useMarkAttendance();
  const requestLeave = useRequestLeave();
  const decideLeave = useDecideLeave();
  const salaries = useSalaries();
  const payments = useSalaryPayments();
  const saveSalary = useSaveSalary();
  const setPaid = useSetSalaryPaid();
  const arrangements = useArrangements();
  const selfService = profile?.app_role === 'driver' || profile?.app_role === 'backend_executive';
  const [tab, setTab] = useState<'overview' | 'leaves' | 'salary' | 'performance'>(selfService ? 'leaves' : 'overview');
  const [payMonth, setPayMonth] = useState(() => todayIso().slice(0, 7));
  const [explainTarget, setExplainTarget] = useState<SalaryBreakdownData | null>(null);
  const [customAdjustments, setCustomAdjustments] = useState<Record<string, number>>({});

  const canManage = profile?.app_role === 'hr' || profile?.app_role === 'admin';
  const today = todayIso();
  const team = profiles.data ?? [];
  const nameOf = (id: string) => team.find((member) => member.id === id)?.name ?? id.slice(0, 8);

  const [leaveType, setLeaveType] = useState<HrLeaveTypeRow>('Casual');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [reason, setReason] = useState('');

  const todayByPerson = useMemo(() => {
    const map = new Map<string, NonNullable<typeof attendance.data>[number]>();
    (attendance.data ?? []).filter((row) => row.work_date === today).forEach((row) => map.set(row.profile_id, row));
    return map;
  }, [attendance.data, today]);

  const monthRate = useMemo(() => {
    const counts = new Map<string, { worked: number; total: number }>();
    (attendance.data ?? []).forEach((row) => {
      const entry = counts.get(row.profile_id) ?? { worked: 0, total: 0 };
      entry.total += 1;
      entry.worked += row.status === 'Present' ? 1 : row.status === 'Half day' ? 0.5 : 0;
      counts.set(row.profile_id, entry);
    });
    return counts;
  }, [attendance.data]);

  const leaveRows = leave.data ?? [];
  const pending = leaveRows.filter((item) => item.status === 'Pending');
  const [leaveFilter, setLeaveFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>(() => 'All');
  // Waiting requests first, so the ones that need a decision are at the top.
  const shownLeave = [...leaveRows]
    .filter((item) => leaveFilter === 'All' || item.status === leaveFilter)
    .sort((a, b) => Number(b.status === 'Pending') - Number(a.status === 'Pending'));
  const presentToday = [...todayByPerson.values()].filter((row) => row.status === 'Present' || row.status === 'Half day').length;
  const roleCounts = team.reduce<Record<string, number>>((all, member) => ({ ...all, [member.appRole]: (all[member.appRole] ?? 0) + 1 }), {});

  const onError = () => showToast('Could not save — has supabase/007_hr_overview.sql been run?', 'info');

  const mark = (profileId: string, status: HrAttendanceStatusRow) =>
    markAttendance.mutate(
      { profileId, status, checkIn: status === 'Present' || status === 'Half day' ? todayByPerson.get(profileId)?.check_in ?? new Date().toISOString() : null },
      { onSuccess: () => showToast(`${nameOf(profileId)} marked ${status.toLowerCase()}.`, 'info'), onError },
    );

  const addDays = (iso: string, n: number) => {
    const d = new Date(`${iso}T00:00:00`);
    d.setDate(d.getDate() + n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const leaveDays = endDate >= startDate ? Math.round((new Date(`${endDate}T00:00:00`).getTime() - new Date(`${startDate}T00:00:00`).getTime()) / 86_400_000) + 1 : 0;
  const myOverlap = (leave.data ?? []).find(
    (item) => item.profile_id === user?.id && item.status !== 'Rejected' && item.start_date <= endDate && item.end_date >= startDate,
  );
  const leaveHints: Record<HrLeaveTypeRow, string> = {
    Casual: 'A short break for personal work.',
    Sick: 'You are unwell. Add what you can in the reason.',
    Earned: 'Planned leave from your earned days.',
    Unpaid: 'Leave without pay.',
    Other: 'Anything else. Please explain in the reason.',
  };
  const reasonMissing = reason.trim().length < 3;

  const submitLeave = () => {
    if (!user) return;
    if (endDate < startDate) return showToast('The last day must be on or after the first day.', 'info');
    if (reasonMissing) return showToast('Please add a short reason.', 'info');
    if (myOverlap) return showToast('You already have a request for some of these days.', 'info');
    requestLeave.mutate(
      { profileId: user.id, leaveType, startDate, endDate, reason: reason.trim() },
      {
        onSuccess: () => {
          setReason('');
          setLeaveType('Casual');
          setStartDate(today);
          setEndDate(today);
          showToast('Leave request sent. HR will review it.', 'info');
        },
        onError,
      },
    );
  };

  const decide = (id: string, status: 'Approved' | 'Rejected') => {
    if (!user) return;
    decideLeave.mutate({ id, status, deciderId: user.id }, { onSuccess: () => showToast(`Leave ${status.toLowerCase()}.`, 'info'), onError });
  };

  const failed = attendance.isError || leave.isError;

  const onSalaryError = (err: unknown) => showToast(`Could not save: ${(err as { message?: string })?.message ?? 'unknown error'}. Has supabase/031_hr_salary_leave.sql been run?`, 'info');
  const salaryOf = (id: string) => salaries.data?.find((row) => row.profile_id === id);
  const paymentOf = (id: string) => payments.data?.find((row) => row.profile_id === id && row.pay_month === payMonth);
  const people = team.filter((member) => canManage || member.id === user?.id);
  const year = today.slice(0, 4);
  // Paid leave = any approved leave that is not Unpaid, counted by the year it starts in.
  const paidLeaveUsed = (id: string) =>
    leaveRows
      .filter((item) => item.profile_id === id && item.status === 'Approved' && item.leave_type !== 'Unpaid' && item.start_date.startsWith(year))
      .reduce((sum, item) => sum + daysBetween(item.start_date, item.end_date), 0);
  const saveNumber = (id: string, field: 'monthlySalary' | 'paidLeaveQuota', raw: string, current: number) => {
    const value = Number(raw);
    if (raw === '' || !Number.isFinite(value) || value < 0 || value === current) return;
    saveSalary.mutate({ profileId: id, [field]: value }, { onSuccess: () => showToast(`${nameOf(id)} updated.`, 'info'), onError: onSalaryError });
  };
  const paidTotal = people.reduce((sum, m) => sum + (paymentOf(m.id)?.status === 'Paid' ? paymentOf(m.id)!.amount : 0), 0);
  const dueTotal = people.reduce((sum, m) => sum + (paymentOf(m.id)?.status === 'Paid' ? 0 : salaryOf(m.id)?.monthly_salary ?? 0), 0);
  const togglePaid = (id: string, paid: boolean) => {
    const amount = salaryOf(id)?.monthly_salary ?? 0;
    if (paid && amount <= 0) return showToast(`Set ${nameOf(id)}'s monthly salary first, then mark it paid.`, 'info');
    setPaid.mutate({ profileId: id, month: payMonth, amount, paid }, {
      onSuccess: () => showToast(paid ? `${nameOf(id)} marked paid for ${payMonth}.` : `${nameOf(id)} set back to pending.`, 'info'),
      onError: onSalaryError,
    });
  };

  const attendanceBars = team
    .filter((m) => monthRate.has(m.id))
    .map((m) => {
      const rate = monthRate.get(m.id)!;
      return { label: m.name, value: Math.round((rate.worked / rate.total) * 100), note: `${rate.total} ${rate.total === 1 ? 'day' : 'days'} logged` };
    })
    .sort((a, b) => b.value - a.value);
  const caseRows = team
    .map((m) => {
      const mine = (arrangements.data ?? []).filter((a) => a.coordinator === m.name);
      const done = mine.filter((a) => a.status === 'Completed').length;
      return { label: m.name, a: done, b: mine.length - done };
    })
    .filter((row) => row.a + row.b > 0)
    .sort((x, y) => y.a + y.b - (x.a + x.b));

  return (
    <div className="crm-screen active">
      <section className="reports-hero">
        <div>
          <span>{selfService ? 'Salary & leave' : 'HR overview'}</span>
          <h3>{selfService ? 'Your salary and leave in one place.' : 'Attendance, leave and team strength in one place.'}</h3>
          <p>{canManage ? 'Mark attendance for the team and decide leave requests.' : 'Check in for the day and request leave. HR will review it.'}</p>
        </div>
        <div><strong>{pending.length}</strong><small>pending leave requests</small></div>
      </section>

      {failed && (
        <div className="crm-section-card">
          <p className="comms-help">HR data could not be loaded. Run <code>supabase/007_hr_overview.sql</code> in the Supabase SQL Editor, then refresh.</p>
        </div>
      )}

      {!selfService && <div className="leads-kpis">
        <div><strong>{team.length}</strong><span>Total headcount</span></div>
        <div><strong>{presentToday}</strong><span>Present today</span></div>
        {([['leaves', pending.length, 'Leaves'], ['salary', inr(dueTotal), 'Salary']] as const).map(([key, value, label]) => (
          <div
            key={key}
            role="button"
            tabIndex={0}
            aria-pressed={tab === key}
            style={{ cursor: 'pointer', outline: tab === key ? '2px solid var(--moss-700, #3c5a3c)' : undefined }}
            onClick={() => setTab(key)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTab(key); } }}
          >
            <strong>{value}</strong><span>{label}</span>
          </div>
        ))}
      </div>}

      <div className="lead-filter-tabs" role="tablist" aria-label="HR sections" style={{ marginBottom: 14 }}>
        {([['overview', 'Overview'], ['leaves', 'Leaves'], ['salary', 'Salary'], ['performance', 'Performance']] as const).filter(([key]) => !selfService || key === 'leaves' || key === 'salary').map(([key, label]) => (
          <button key={key} type="button" role="tab" aria-selected={tab === key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
      <div className="dashboard-grid-layout">
        <section className="crm-section-card">
          <div className="crm-card-header"><h3>Team by role</h3></div>
          <div className="mini-list">
            {Object.entries(roleCounts).sort((a, b) => b[1] - a[1]).map(([role, count]) => (
              <div className="mini-row" key={role}><span>{role[0].toUpperCase() + role.slice(1)}</span><strong>{count}</strong></div>
            ))}
          </div>
        </section>
      </div>

      <section className="crm-section-card">
        <div className="crm-card-header">
          <h3>Today’s attendance · {formatDate(today)}</h3>
          {!canManage && <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>You can see your own record only.</span>}
        </div>
        <div className="crm-table-wrapper">
          <table className="crm-table">
            <thead>
              <tr><th>Name</th><th>Job title</th><th>Today</th><th>In</th><th>Out</th><th>Last 30 days</th>{canManage && <th>Mark</th>}</tr>
            </thead>
            <tbody>
              {team.filter((member) => canManage || member.id === user?.id).map((member) => {
                const row = todayByPerson.get(member.id);
                const rate = monthRate.get(member.id);
                const inDate = row?.check_in ? new Date(row.check_in) : null;
                const outDate = row?.check_out ? new Date(row.check_out) : null;
                const isLate = inDate ? inDate.getHours() > 9 || (inDate.getHours() === 9 && inDate.getMinutes() > 30) : false;
                const isEarly = outDate ? outDate.getHours() < 18 : false;

                return (
                  <tr key={member.id}>
                    <td><strong>{member.name}</strong></td>
                    <td>{member.role}</td>
                    <td>{row?.status ?? '—'}</td>
                    <td>
                      {formatTime(row?.check_in ?? null)}
                      {isLate && <span style={{ marginLeft: 6, fontSize: '0.72rem', color: 'var(--amber-700)', fontWeight: 600 }}>⏰ Late</span>}
                    </td>
                    <td>
                      {formatTime(row?.check_out ?? null)}
                      {isEarly && <span style={{ marginLeft: 6, fontSize: '0.72rem', color: 'var(--amber-700)', fontWeight: 600 }}>🚪 Early</span>}
                    </td>
                    <td>{rate ? `${Math.round((rate.worked / rate.total) * 100)}% (${rate.total} ${rate.total === 1 ? 'day' : 'days'} logged)` : '—'}</td>
                    {canManage && (
                      <td>
                        <select className="form-select" style={{ fontSize: '0.82rem', padding: '4px 8px' }} value={row?.status ?? ''} onChange={(e) => mark(member.id, e.target.value as HrAttendanceStatusRow)}>
                          <option value="" disabled>Mark…</option>
                          {ATTENDANCE_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
        </>
      )}

      {tab === 'leaves' && (
        <>
        <section className="crm-section-card">
        <div className="crm-card-header">
          <div>
            <h3>Paid leaves · {year}</h3>
            <p className="comms-help" style={{ margin: 0 }}>Approved Casual, Sick, Earned and Other leave uses up the yearly allowance. Unpaid leave does not.</p>
          </div>
        </div>
        <div className="crm-table-wrapper">
          <table className="crm-table">
            <thead><tr><th>Name</th><th>Yearly paid leaves</th><th>Used</th><th>Remaining</th></tr></thead>
            <tbody>
              {people.map((member) => {
                const quota = salaryOf(member.id)?.paid_leave_quota ?? 12;
                const used = paidLeaveUsed(member.id);
                return (
                  <tr key={member.id}>
                    <td><strong>{member.name}</strong></td>
                    <td>
                      {canManage ? (
                        <input key={`${member.id}-${quota}`} className="form-input" type="number" min={0} style={{ width: 80, padding: '4px 8px' }} defaultValue={quota} aria-label={`Yearly paid leaves for ${member.name}`} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()} onBlur={(e) => saveNumber(member.id, 'paidLeaveQuota', e.target.value, quota)} />
                      ) : quota}
                    </td>
                    <td>{used}</td>
                    <td><strong style={{ color: quota - used < 0 ? 'var(--crimson-600)' : undefined }}>{quota - used}</strong></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <div className="dashboard-grid-layout">
        <section className="crm-section-card">
          <div className="crm-card-header">
            <div>
              <h3>Request leave</h3>
              <p className="comms-help" style={{ margin: 0 }}>Your request goes to HR. You will see the decision in the list.</p>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 18 }}>
            <label className="form-label" htmlFor="leave-type">Type of leave</label>
            <select id="leave-type" className="form-select" value={leaveType} onChange={(e) => setLeaveType(e.target.value as HrLeaveTypeRow)}>
              {LEAVE_TYPES.map((type) => <option key={type}>{type}</option>)}
            </select>
            <p className="comms-help" style={{ margin: '4px 0 0' }}>{leaveHints[leaveType]}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="leave-from">First day</label>
              <input id="leave-from" className="form-input" type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); if (endDate < e.target.value) setEndDate(e.target.value); }} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="leave-to">Last day</label>
              <input id="leave-to" className="form-input" type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', margin: '0 0 20px' }}>
            <span className="comms-help" style={{ margin: 0 }}>Quick pick:</span>
            <button type="button" className="btn btn-sm btn-secondary" onClick={() => { setStartDate(today); setEndDate(today); }}>Today</button>
            <button type="button" className="btn btn-sm btn-secondary" onClick={() => { setStartDate(addDays(today, 1)); setEndDate(addDays(today, 1)); }}>Tomorrow</button>
            <button type="button" className="btn btn-sm btn-secondary" onClick={() => { setStartDate(today); setEndDate(addDays(today, 2)); }}>Next 3 days</button>
            <strong style={{ marginLeft: 'auto', color: leaveDays > 0 ? 'var(--moss-900)' : 'var(--crimson-600)' }}>
              {leaveDays > 0 ? `${leaveDays} day${leaveDays === 1 ? '' : 's'}` : 'Check the dates'}
            </strong>
          </div>

          {startDate < today && (
            <p style={{ fontSize: '0.82rem', color: 'var(--amber-700)', margin: '0 0 10px' }}>The first day is in the past. That is fine for sick leave you are reporting late.</p>
          )}
          {myOverlap && (
            <p role="alert" style={{ fontSize: '0.82rem', color: 'var(--crimson-600)', margin: '0 0 10px' }}>
              You already have a {myOverlap.status.toLowerCase()} {myOverlap.leave_type.toLowerCase()} leave request ({formatDate(myOverlap.start_date)} to {formatDate(myOverlap.end_date)}) that overlaps these days.
            </p>
          )}

          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label" htmlFor="leave-reason">Reason</label>
            <textarea id="leave-reason" className="form-textarea" rows={3} maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="A few words are enough. For example: family function, fever, travel." />
            <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', textAlign: 'right', marginTop: 2 }}>{reason.length}/300</div>
          </div>

          <div className="attribution-actions">
            <button className="btn btn-primary" type="button" disabled={requestLeave.isPending || leaveDays === 0 || reasonMissing || Boolean(myOverlap)} onClick={submitLeave}>
              {requestLeave.isPending ? 'Sending…' : 'Send request'}
            </button>
          </div>
        </section>

        <section className="crm-section-card">
          <div className="crm-card-header"><h3>Leave requests</h3></div>
          <div className="lead-filter-tabs" role="tablist" aria-label="Leave status" style={{ marginBottom: 14 }}>
            {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((f) => (
              <button key={f} type="button" role="tab" aria-selected={leaveFilter === f} className={leaveFilter === f ? 'active' : ''} onClick={() => setLeaveFilter(f)}>
                {f} ({f === 'All' ? leaveRows.length : leaveRows.filter((i) => i.status === f).length})
              </button>
            ))}
          </div>
          <div className="crm-table-wrapper">
            <table className="crm-table">
              <thead><tr><th>Who</th><th>Type</th><th>Dates</th><th>Reason</th><th>Status</th>{canManage && <th>Decision</th>}</tr></thead>
              <tbody>
                {shownLeave.length === 0 && <tr><td colSpan={canManage ? 6 : 5}>{leaveRows.length === 0 ? 'No leave requests yet.' : 'No requests in this view.'}</td></tr>}
                {shownLeave.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{nameOf(item.profile_id)}</strong></td>
                    <td>{item.leave_type}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {item.start_date === item.end_date ? formatDate(item.start_date) : `${formatDate(item.start_date)} – ${formatDate(item.end_date)}`}
                      <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>{daysBetween(item.start_date, item.end_date)} {daysBetween(item.start_date, item.end_date) === 1 ? 'day' : 'days'}</div>
                    </td>
                    <td style={{ maxWidth: 220, color: 'var(--ink-secondary)' }}>{item.reason || '—'}</td>
                    <td><span className={`status-badge ${leaveBadge(item.status)}`}>{item.status}</span></td>
                    {canManage && (
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {item.status === 'Pending' ? (
                          <>
                            <button className="btn btn-sm btn-primary" type="button" onClick={() => decide(item.id, 'Approved')}>Approve</button>{' '}
                            <button className="btn btn-sm btn-secondary" type="button" onClick={() => decide(item.id, 'Rejected')}>Reject</button>
                          </>
                        ) : '—'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
        </>
      )}

      {tab === 'salary' && (
        <>
      <section className="crm-section-card">
        <div className="crm-card-header">
          <div>
            <h3>Salary records</h3>
            <p className="comms-help" style={{ margin: 0 }}>{canManage ? 'Type each person salary in their own box and press Enter (or click away) to save it, then mark the month paid once it is sent.' : 'You can see your own salary record only.'}</p>
          </div>
          <input className="form-input" type="month" value={payMonth} onChange={(e) => e.target.value && setPayMonth(e.target.value)} aria-label="Salary month" style={{ width: 'auto' }} />
        </div>
        {canManage && (
          <div className="leads-kpis" style={{ marginBottom: 14 }}>
            <div><strong>{inr(paidTotal)}</strong><span>Paid for the month</span></div>
            <div><strong>{inr(dueTotal)}</strong><span>Still to pay</span></div>
          </div>
        )}
        <div className="crm-table-wrapper">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Job title</th>
                <th>Base salary</th>
                <th>Attendance & Leaves</th>
                <th>Calculated Net Pay</th>
                <th>Status</th>
                <th>Paid on</th>
                <th>Explain / Action</th>
              </tr>
            </thead>
            <tbody>
              {people.map((member) => {
                const base = salaryOf(member.id)?.monthly_salary ?? 0;
                const pay = paymentOf(member.id);
                const paid = pay?.status === 'Paid';

                const [pYear, pMonth] = payMonth.split('-').map(Number);
                const totalDaysInMonth = new Date(pYear, pMonth, 0).getDate();
                const personAttendance = (attendance.data ?? []).filter(
                  (a) => a.profile_id === member.id && a.work_date.startsWith(payMonth),
                );
                const presentDays = personAttendance.filter((a) => a.status === 'Present').length;
                const halfDays = personAttendance.filter((a) => a.status === 'Half day').length;
                const absentDays = personAttendance.filter((a) => a.status === 'Absent').length;
                const lateArrivals = personAttendance.filter(
                  (a) =>
                    a.check_in &&
                    (new Date(a.check_in).getHours() > 9 ||
                      (new Date(a.check_in).getHours() === 9 && new Date(a.check_in).getMinutes() > 30)),
                ).length;
                const earlyDepartures = personAttendance.filter(
                  (a) => a.check_out && new Date(a.check_out).getHours() < 18,
                ).length;
                const approvedPaidLeaveDays = leaveRows
                  .filter(
                    (l) =>
                      l.profile_id === member.id &&
                      l.status === 'Approved' &&
                      l.leave_type !== 'Unpaid' &&
                      (l.start_date.startsWith(payMonth) || l.end_date.startsWith(payMonth)),
                  )
                  .reduce((sum, l) => sum + daysBetween(l.start_date, l.end_date), 0);
                const unpaidLeaveDays = leaveRows
                  .filter(
                    (l) =>
                      l.profile_id === member.id &&
                      l.status === 'Approved' &&
                      l.leave_type === 'Unpaid' &&
                      (l.start_date.startsWith(payMonth) || l.end_date.startsWith(payMonth)),
                  )
                  .reduce((sum, l) => sum + daysBetween(l.start_date, l.end_date), 0);

                const totalUnpaidUnits = unpaidLeaveDays + absentDays + halfDays * 0.5;
                const dailyRate = totalDaysInMonth > 0 ? base / totalDaysInMonth : 0;
                const adj = customAdjustments[member.id] || 0;
                const calculatedPayable = Math.max(0, Math.round(base - totalUnpaidUnits * dailyRate + adj));

                const openExplain = () => {
                  setExplainTarget({
                    name: member.name,
                    role: member.role,
                    month: payMonth,
                    baseSalary: base,
                    totalDays: totalDaysInMonth,
                    presentDays,
                    halfDays,
                    paidLeaveDays: approvedPaidLeaveDays,
                    unpaidDays: unpaidLeaveDays + absentDays,
                    lateArrivals,
                    earlyDepartures,
                    adjustments: adj,
                    onSaveAdjustments: (val) =>
                      setCustomAdjustments((prev) => ({ ...prev, [member.id]: val })),
                  });
                };

                return (
                  <tr key={member.id}>
                    <td><strong>{member.name}</strong></td>
                    <td>{member.role}</td>
                    <td>
                      {canManage ? (
                        <input
                          key={`${member.id}-${base}`}
                          className="form-input"
                          type="number"
                          min={0}
                          style={{ width: 110, padding: '4px 8px' }}
                          defaultValue={base}
                          aria-label={`Monthly salary for ${member.name}`}
                          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                          onBlur={(e) => saveNumber(member.id, 'monthlySalary', e.target.value, base)}
                        />
                      ) : (
                        inr(base)
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem' }}>
                        <span>{presentDays} present</span>
                        {approvedPaidLeaveDays > 0 && <span style={{ color: 'var(--moss-700)' }}> · {approvedPaidLeaveDays} paid leave</span>}
                        {totalUnpaidUnits > 0 && <span style={{ color: 'var(--crimson-700)', fontWeight: 600 }}> · {totalUnpaidUnits} unpaid day(s)</span>}
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--moss-800)' }}>{inr(calculatedPayable)}</strong>
                      {totalUnpaidUnits > 0 && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--crimson-600)' }}>
                          (−{inr(totalUnpaidUnits * dailyRate)} unpaid)
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${paid ? 'status-confirmed' : 'status-inquiry'}`}>{paid ? 'Paid' : 'Pending'}</span>
                      {paid && pay && <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>{inr(pay.amount)}</div>}
                    </td>
                    <td>{pay?.paid_on ? formatDate(pay.paid_on) : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button type="button" className="btn btn-sm btn-secondary" onClick={openExplain} title="Explain calculation breakdown">
                          🔍 Explain
                        </button>
                        {canManage && (
                          <button
                            className={`btn btn-sm ${paid ? 'btn-secondary' : 'btn-primary'}`}
                            type="button"
                            disabled={setPaid.isPending}
                            onClick={() => togglePaid(member.id, !paid)}
                          >
                            {paid ? 'Undo' : 'Mark paid'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {explainTarget && <SalaryExplainModal data={explainTarget} onClose={() => setExplainTarget(null)} />}
        </>
      )}

      {tab === 'performance' && canManage && (
        <>
        <div className="dashboard-grid-layout">
          <ChartCard
            title="Performance · attendance"
            subtitle="Share of logged days worked in the last 30 days"
            table={{ head: ['Name', 'Attendance %'], rows: attendanceBars.map((b) => [b.label, `${b.value}%`]) }}
          >
            {attendanceBars.length === 0 ? <p className="comms-help">No attendance logged yet.</p> : <BarList items={attendanceBars} format={(n) => `${n}%`} />}
          </ChartCard>
          <ChartCard
            title="Performance · cases handled"
            subtitle="Cases each coordinator owns, completed and still open"
            table={{ head: ['Name', 'Completed', 'Open'], rows: caseRows.map((row) => [row.label, row.a, row.b]) }}
          >
            {caseRows.length === 0 ? <p className="comms-help">No cases assigned to a coordinator yet.</p> : <StackedBars rows={caseRows} aLabel="Completed" bLabel="Open" format={(n) => String(n)} />}
          </ChartCard>
        </div>
        </>
      )}

    </div>
  );
}
