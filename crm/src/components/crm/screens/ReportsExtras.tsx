import { useAuth } from '../../../auth/useAuth';
import type { Arrangement } from '../../../types';
import { todayIso, useAttendance, useLeaveRequests } from '../../../data/useHr';
import { useProfiles } from '../../../data/useProfiles';

const rupees = (value: number) => `₹${value.toLocaleString('en-IN')}`;
const SETTLED = ['Payment Received', 'Receipt Generated'];

/** Accounts, HR and service-performance cards for the management dashboard. */
export function ReportsExtras({ rows }: { rows: Arrangement[] }) {
  const { profile } = useAuth();
  const canSeeHr = profile?.app_role === 'hr' || profile?.app_role === 'admin';
  const attendance = useAttendance();
  const leave = useLeaveRequests();
  const profiles = useProfiles();

  const quoted = rows.reduce((sum, item) => sum + (item.quotation?.total || 0), 0);
  const collected = rows.reduce((sum, item) => sum + item.paidAmount, 0);
  const awaitingPayment = rows.filter((item) => item.status !== 'New Inquiry' && !SETTLED.includes(item.paymentStatus)).length;
  const collectionRate = quoted ? Math.round((collected / quoted) * 100) : 0;

  const completed = rows.filter((item) => item.status === 'Completed');
  const rated = rows.filter((item) => item.feedback);
  const avgRating = rated.length ? (rated.reduce((sum, item) => sum + (item.feedback?.rating ?? 0), 0) / rated.length).toFixed(1) : '—';
  const lowRated = rated.filter((item) => (item.feedback?.rating ?? 5) <= 3).length;
  const inField = rows.filter((item) => item.status === 'In Execution').length;
  const completionRate = rows.length ? Math.round((completed.length / rows.length) * 100) : 0;

  const today = todayIso();
  const presentToday = (attendance.data ?? []).filter((row) => row.work_date === today && (row.status === 'Present' || row.status === 'Half day')).length;
  const pendingLeave = (leave.data ?? []).filter((item) => item.status === 'Pending').length;
  const onLeave = (leave.data ?? []).filter((item) => item.status === 'Approved' && item.start_date <= today && item.end_date >= today).length;

  return (
    <div className="dashboard-grid-layout" style={{ marginTop: 18 }}>
      <section className="crm-section-card">
        <div className="crm-card-header"><h3>Accounts</h3></div>
        <div className="mini-list">
          <div className="mini-row"><span>Total quoted</span><strong>{rupees(quoted)}</strong></div>
          <div className="mini-row"><span>Collected</span><strong>{rupees(collected)}</strong></div>
          <div className="mini-row"><span>Outstanding</span><strong>{rupees(Math.max(0, quoted - collected))}</strong></div>
          <div className="mini-row"><span>Collection rate</span><strong>{collectionRate}%</strong></div>
          <div className="mini-row"><span>Cases awaiting payment</span><strong>{awaitingPayment}</strong></div>
        </div>
      </section>

      <section className="crm-section-card">
        <div className="crm-card-header"><h3>Service performance</h3></div>
        <div className="mini-list">
          <div className="mini-row"><span>Completed services</span><strong>{completed.length} ({completionRate}%)</strong></div>
          <div className="mini-row"><span>In the field now</span><strong>{inField}</strong></div>
          <div className="mini-row"><span>Average family rating</span><strong>{avgRating}{rated.length ? ` / 5 (${rated.length} reviews)` : ''}</strong></div>
          <div className="mini-row"><span>Ratings of 3 or below</span><strong>{lowRated}</strong></div>
        </div>
      </section>

      {canSeeHr && (
        <section className="crm-section-card">
          <div className="crm-card-header"><h3>HR</h3></div>
          <div className="mini-list">
            <div className="mini-row"><span>Headcount</span><strong>{profiles.data?.length ?? 0}</strong></div>
            <div className="mini-row"><span>Present today</span><strong>{presentToday}</strong></div>
            <div className="mini-row"><span>On approved leave</span><strong>{onLeave}</strong></div>
            <div className="mini-row"><span>Leave awaiting decision</span><strong>{pendingLeave}</strong></div>
          </div>
        </section>
      )}
    </div>
  );
}
