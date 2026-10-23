import { useState } from 'react';
import type { Arrangement } from '../../../types';
import { useRecordPayment } from '../../../data/useArrangements';
import { usePaymentEntries } from '../../../data/usePaymentEntries';
import { useAppSettings } from '../../../data/useSettings';
import { downloadReceiptPdf } from '../../../lib/receiptPdf';
import { quotedFor } from '../../../lib/paymentCategory';
import { useToast } from '../../../toast/useToast';
import { Modal } from '../../../modal/Modal';

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

const RECONCILED_PAYMENTS_KEY = 'eternal_crm_reconciled_gateway_ids';

function getReconciledIds(): Record<string, { caseId: string; amount: number; at: string }> {
  try {
    const raw = localStorage.getItem(RECONCILED_PAYMENTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveReconciledId(id: string, data: { caseId: string; amount: number; at: string }) {
  try {
    const existing = getReconciledIds();
    existing[id] = data;
    localStorage.setItem(RECONCILED_PAYMENTS_KEY, JSON.stringify(existing));
  } catch {
    // Ignore
  }
}

export function GatewayTestModal({
  isOpen,
  cases,
  onClose,
}: {
  isOpen: boolean;
  cases: Arrangement[];
  onClose: () => void;
}) {
  const { showToast } = useToast();
  const { settings } = useAppSettings();
  const recordPayment = useRecordPayment();
  const entries = usePaymentEntries();

  const [selectedCaseId, setSelectedCaseId] = useState(cases[0]?.id || '');
  const [paymentId, setPaymentId] = useState(() => `pay_test_${Math.floor(100000 + Math.random() * 900000)}`);
  const [orderId, setOrderId] = useState(() => `order_test_${Math.floor(100000 + Math.random() * 900000)}`);
  const [amountInput, setAmountInput] = useState('15000');
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [reconciledResult, setReconciledResult] = useState<{
    caseId: string;
    amount: number;
    paymentId: string;
    isDuplicate: boolean;
  } | null>(null);

  const selectedCase = cases.find((c) => c.id === selectedCaseId) || cases[0];
  const quoted = selectedCase ? quotedFor(selectedCase) : 0;
  const balance = selectedCase ? Math.max(0, quoted - selectedCase.paidAmount) : 0;

  const generateNewIds = () => {
    setPaymentId(`pay_test_${Math.floor(100000 + Math.random() * 900000)}`);
    setOrderId(`order_test_${Math.floor(100000 + Math.random() * 900000)}`);
    setDuplicateWarning(null);
    setReconciledResult(null);
  };

  const handleReconcile = (e: React.FormEvent) => {
    e.preventDefault();
    setDuplicateWarning(null);
    setReconciledResult(null);

    if (!selectedCase) return;
    const amount = Number(amountInput);
    if (!amount || amount <= 0) {
      return showToast('Please enter a valid payment amount.', 'info');
    }

    const reconciledIds = getReconciledIds();

    // Idempotency check: duplicate payment ID check
    if (reconciledIds[paymentId]) {
      const prior = reconciledIds[paymentId];
      const warn = `⚠ Idempotency Guard Triggered: Razorpay Payment ID '${paymentId}' was ALREADY reconciled on ${new Date(prior.at).toLocaleTimeString('en-IN')} for case ${prior.caseId} (${inr(prior.amount)}). Duplicate update rejected to prevent double-counting!`;
      setDuplicateWarning(warn);
      setReconciledResult({ caseId: selectedCase.id, amount, paymentId, isDuplicate: true });
      showToast('Duplicate payment rejected (Idempotent).', 'alert');
      return;
    }

    // Process valid reconciliation
    recordPayment.mutate(
      {
        id: selectedCase.id,
        amount,
        method: 'Razorpay',
        note: `Gateway payment ${paymentId} (${orderId})`,
      },
      {
        onSuccess: () => {
          saveReconciledId(paymentId, {
            caseId: selectedCase.id,
            amount,
            at: new Date().toISOString(),
          });
          setReconciledResult({ caseId: selectedCase.id, amount, paymentId, isDuplicate: false });
          showToast(`Razorpay payment ${paymentId} (${inr(amount)}) reconciled successfully!`, 'info');
        },
        onError: () => showToast('Could not reconcile payment.', 'info'),
      },
    );
  };

  const downloadReceipt = () => {
    if (!selectedCase) return;
    const caseEntries = (entries.data ?? []).filter((e) => e.arrangementId === selectedCase.id);
    downloadReceiptPdf(selectedCase, caseEntries, quoted, settings).catch(() =>
      showToast('Could not generate PDF receipt.', 'info'),
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      wide
      onClose={onClose}
      headerContent={<h3>Razorpay Gateway Payment & Invoice Testing</h3>}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            type="submit"
            form="razorpay-reconcile-form"
            className="btn btn-primary"
            disabled={recordPayment.isPending}
          >
            {recordPayment.isPending ? 'Reconciling…' : 'Process Razorpay Reconciliation'}
          </button>
        </>
      }
    >
      <div style={{ maxWidth: 640 }}>
        <p className="comms-help" style={{ marginTop: 0, marginBottom: 16 }}>
          Test full payments, partial payments, and duplicate payment idempotency updates. Reconciled payments update the case balance and produce official PDF receipts and tax invoices.
        </p>

        <form id="razorpay-reconcile-form" onSubmit={handleReconcile} style={{ display: 'grid', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Select Case Reference</label>
            <select
              className="form-select"
              value={selectedCaseId}
              onChange={(e) => {
                setSelectedCaseId(e.target.value);
                setDuplicateWarning(null);
                setReconciledResult(null);
              }}
            >
              {cases.map((c) => {
                const q = quotedFor(c);
                const b = Math.max(0, q - c.paidAmount);
                return (
                  <option key={c.id} value={c.id}>
                    {c.id} — {c.family} (Quoted: {inr(q)} · Paid: {inr(c.paidAmount)} · Balance: {inr(b)})
                  </option>
                );
              })}
            </select>
          </div>

          {selectedCase && (
            <div style={{ background: 'var(--bg-sand-light, #fbf9f5)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-delicate)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, fontSize: '0.85rem' }}>
              <div><span>Total Quoted:</span><br /><strong>{inr(quoted)}</strong></div>
              <div><span>Currently Paid:</span><br /><strong style={{ color: 'var(--moss-700)' }}>{inr(selectedCase.paidAmount)}</strong></div>
              <div><span>Remaining Balance:</span><br /><strong style={{ color: balance > 0 ? 'var(--crimson-700)' : 'var(--moss-700)' }}>{inr(balance)}</strong></div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Razorpay Payment ID</label>
              <input
                className="form-input"
                value={paymentId}
                onChange={(e) => setPaymentId(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Razorpay Order ID</label>
              <input
                className="form-input"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="form-group" style={{ marginBottom: 0, flex: 1, marginRight: 12 }}>
              <label className="form-label">Payment Amount (₹)</label>
              <input
                className="form-input"
                type="number"
                min="1"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                required
              />
            </div>
            <div style={{ paddingTop: 18, display: 'flex', gap: 6 }}>
              {balance > 0 && (
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => setAmountInput(String(balance))}
                >
                  Pay Full Balance ({inr(balance)})
                </button>
              )}
              <button type="button" className="btn btn-sm btn-secondary" onClick={generateNewIds}>
                🔄 New ID
              </button>
            </div>
          </div>

          {duplicateWarning && (
            <div
              style={{
                background: 'var(--crimson-50, #fff5f5)',
                border: '1px solid var(--crimson-400, #e53e3e)',
                color: 'var(--crimson-800, #9b2c2c)',
                padding: '12px 14px',
                borderRadius: 8,
                fontSize: '0.84rem',
                lineHeight: 1.5,
              }}
            >
              {duplicateWarning}
            </div>
          )}

          {reconciledResult && !reconciledResult.isDuplicate && (
            <div
              style={{
                background: 'var(--moss-50, #f0fff4)',
                border: '1px solid var(--moss-400, #38a169)',
                color: 'var(--moss-800, #22543d)',
                padding: '12px 14px',
                borderRadius: 8,
                fontSize: '0.86rem',
              }}
            >
              <strong>✓ Gateway Payment Reconciled Once:</strong> {inr(reconciledResult.amount)} recorded for case {reconciledResult.caseId}.
              <div style={{ marginTop: 8 }}>
                <button type="button" className="btn btn-sm btn-primary" onClick={downloadReceipt}>
                  📄 Download Updated Receipt / Invoice PDF
                </button>
              </div>
            </div>
          )}

        </form>

        <hr style={{ border: 0, borderTop: '1px solid var(--border-delicate)', margin: '20px 0 14px' }} />
        <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
          <strong>How to test:</strong> Click "Process Razorpay Reconciliation" once to verify normal payment and download the receipt. Then click it a SECOND time with the same Payment ID to verify duplicate payment rejection!
        </div>
      </div>
    </Modal>
  );
}
