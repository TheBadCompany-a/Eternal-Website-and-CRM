import { useState } from 'react';
import { Modal } from '../../../modal/Modal';

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export interface SalaryBreakdownData {
  name: string;
  role: string;
  month: string;
  baseSalary: number;
  totalDays: number;
  presentDays: number;
  halfDays: number;
  paidLeaveDays: number;
  unpaidDays: number;
  lateArrivals: number;
  earlyDepartures: number;
  adjustments: number;
  onSaveAdjustments?: (val: number) => void;
}

export function SalaryExplainModal({
  data,
  onClose,
}: {
  data: SalaryBreakdownData;
  onClose: () => void;
}) {
  const [adjustmentInput, setAdjustmentInput] = useState(String(data.adjustments || 0));

  const dailyRate = data.totalDays > 0 ? data.baseSalary / data.totalDays : 0;
  const adj = Number(adjustmentInput) || 0;

  // Unpaid deduction calculation
  const totalUnpaidDayUnits = data.unpaidDays + data.halfDays * 0.5;
  const unpaidDeduction = totalUnpaidDayUnits * dailyRate;

  // Total paid days equivalent
  const totalPaidDayUnits = data.presentDays + data.paidLeaveDays + data.halfDays * 0.5;

  const netPayable = Math.max(0, Math.round(data.baseSalary - unpaidDeduction + adj));

  return (
    <Modal
      wide
      isOpen
      onClose={onClose}
      headerContent={<h3>Salary Explanation · {data.name} ({data.month})</h3>}
      footer={
        <button type="button" className="btn btn-primary" onClick={onClose}>
          Done
        </button>
      }
    >
      <div style={{ maxWidth: 580 }}>
        <p className="comms-help" style={{ marginTop: 0, marginBottom: 16 }}>
          Itemized calculation based on recorded attendance, approved paid leaves, and unpaid absences for <strong>{data.name}</strong> ({data.role}).
        </p>

        <div style={{ display: 'grid', gap: 12 }}>
          {/* Base figures */}
          <div style={{ background: 'var(--bg-sand-light, #fbf9f5)', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border-delicate)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: 4 }}>
              <span>Base Monthly Salary:</span>
              <strong>{inr(data.baseSalary)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: 'var(--ink-secondary)' }}>
              <span>Month Calendar Days:</span>
              <span>{data.totalDays} days ({inr(dailyRate)} / day)</span>
            </div>
          </div>

          {/* Attendance breakdown */}
          <div style={{ border: '1px solid var(--border-delicate)', borderRadius: 8, padding: '12px 14px' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '0.86rem', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
              Attendance & Leave Audit
            </h4>
            <div style={{ display: 'grid', gap: 6, fontSize: '0.86rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>✓ Present Days:</span>
                <strong>{data.presentDays} days</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>✓ Approved Paid Leave (Casual / Sick / Earned):</span>
                <strong style={{ color: 'var(--moss-700)' }}>+{data.paidLeaveDays} days (Paid)</strong>
              </div>
              {data.halfDays > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>½ Half Days ({data.halfDays} occurrences):</span>
                  <span>{data.halfDays * 0.5} paid, {data.halfDays * 0.5} unpaid</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: data.unpaidDays > 0 ? 'var(--crimson-700)' : undefined }}>
                <span>✗ Unpaid Leave / Unexcused Absences:</span>
                <strong>{data.unpaidDays} days (Deduction: −{inr(data.unpaidDays * dailyRate)})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid var(--border-delicate)' }}>
                <span>Total Paid Days:</span>
                <strong>{totalPaidDayUnits} of {data.totalDays} days</strong>
              </div>
            </div>

            {(data.lateArrivals > 0 || data.earlyDepartures > 0) && (
              <div style={{ marginTop: 10, padding: '6px 10px', background: 'var(--bg-sand)', borderRadius: 6, fontSize: '0.8rem' }}>
                {data.lateArrivals > 0 && <span style={{ marginRight: 12 }}>⏰ {data.lateArrivals} late arrival(s)</span>}
                {data.earlyDepartures > 0 && <span>🚪 {data.earlyDepartures} early departure(s)</span>}
              </div>
            )}
          </div>

          {/* Adjustments */}
          <div style={{ border: '1px solid var(--border-delicate)', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.86rem' }}>Adjustments & Allowances (₹)</strong>
                <p className="comms-help" style={{ margin: 0 }}>Overtime, performance bonus, or travel allowance.</p>
              </div>
              <input
                className="form-input"
                type="number"
                style={{ width: 110, textAlign: 'right' }}
                value={adjustmentInput}
                onChange={(e) => {
                  setAdjustmentInput(e.target.value);
                  if (data.onSaveAdjustments) data.onSaveAdjustments(Number(e.target.value) || 0);
                }}
              />
            </div>
          </div>

          {/* Final Payable */}
          <div style={{ background: 'var(--bg-sand)', padding: '14px 16px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '2px solid var(--accent, #b48c48)' }}>
            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--ink-muted)' }}>
                Net Payable for {data.month}
              </span>
              <div style={{ fontSize: '0.78rem', color: 'var(--ink-secondary)' }}>
                Base ({inr(data.baseSalary)}) − Unpaid Deductions ({inr(unpaidDeduction)}) {adj !== 0 ? `+ Adj (${inr(adj)})` : ''}
              </div>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--moss-800, #22543d)' }}>
              {inr(netPayable)}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
