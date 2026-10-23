import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Modal } from '../../../modal/Modal';
import { useAppState } from '../../../state/useAppState';
import { useArrangements, useRecordPayment } from '../../../data/useArrangements';
import { useAppSettings } from '../../../data/useSettings';
import { usePaymentEntries, type PaymentEntry } from '../../../data/usePaymentEntries';
import { useGatewayPayments, usePaymentClaims, useRejectClaim, useVerifyClaim } from '../../../data/useWebsite';
import { categoryOf, quotedFor } from '../../../lib/paymentCategory';
import { downloadReceiptPdf } from '../../../lib/receiptPdf';
import { whatsappLink } from '../../../lib/whatsapp';
import { useToast } from '../../../toast/useToast';
import type { Arrangement } from '../../../types';
import { GatewayTestModal } from '../modal/GatewayTestModal';

type Kind = 'all' | 'star' | 'package' | 'service' | 'diya';
type StatusKey = 'all' | 'unpaid' | 'part' | 'paid';
const KIND_LABELS: Record<Kind, string> = { all: 'All', star: 'Stars', package: 'Packages', service: 'Services', diya: 'Diya donations' };
const STATUS_LABELS: Record<StatusKey, string> = { all: 'All', unpaid: 'Unpaid', part: 'Part paid', paid: 'Paid' };
const METHODS = ['UPI', 'Cash', 'Card', 'Bank transfer', 'Cheque'];

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const shortDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

type RowStatus = Exclude<StatusKey, 'all'> | 'none';

interface Row {
  a: Arrangement;
  quoted: number;
  paid: number;
  balance: number;
  status: RowStatus;
}

function toRow(a: Arrangement): Row {
  const quoted = quotedFor(a);
  const paid = a.paidAmount;
  const balance = Math.max(0, quoted - paid);
  const status: RowStatus = quoted > 0 && paid >= quoted ? 'paid' : paid > 0 ? 'part' : quoted > 0 ? 'unpaid' : 'none';
  return { a, quoted, paid, balance, status };
}

const BADGE: Record<RowStatus, { label: string; cls: string }> = {
  paid: { label: 'Paid', cls: 'status-confirmed' },
  part: { label: 'Part paid', cls: 'status-enroute' },
  unpaid: { label: 'Unpaid', cls: 'status-inquiry' },
  none: { label: 'No quote yet', cls: 'status-inquiry' },
};

export function PaymentsScreen() {
  const { searchFilter, activeOpsCaseId } = useAppState();
  const { showToast } = useToast();
  const { settings } = useAppSettings();
  const arrangements = useArrangements();
  const entries = usePaymentEntries();
  const gateway = useGatewayPayments();
  const claims = usePaymentClaims();
  const verifyClaim = useVerifyClaim();
  const rejectClaim = useRejectClaim();
  const recordPayment = useRecordPayment();

  const [kind, setKind] = useState<Kind>('all');
  const [statusFilter, setStatusFilter] = useState<StatusKey>('all');
  const [openId, setOpenId] = useState<string | null>(activeOpsCaseId);
  const [payFor, setPayFor] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('UPI');
  const [note, setNote] = useState('');
  const [showGatewayTest, setShowGatewayTest] = useState(false);

  useEffect(() => {
    if (activeOpsCaseId) {
      setOpenId(activeOpsCaseId);
      setKind('all');
    }
  }, [activeOpsCaseId]);

  const all = useMemo(() => (arrangements.data ?? []).map(toRow), [arrangements.data]);
  const byKind = useMemo(() => all.filter((r) => kind === 'all' || categoryOf(r.a) === kind), [all, kind]);
  const query = searchFilter.trim().toLowerCase();
  const rows = useMemo(
    () =>
      byKind
        .filter((r) => statusFilter === 'all' || r.status === statusFilter)
        .filter((r) => !query || [r.a.id, r.a.contactName, r.a.family, r.a.phone, r.a.serviceType].join(' ').toLowerCase().includes(query))
        .sort((x, y) => y.balance - x.balance || new Date(y.a.createdAt).getTime() - new Date(x.a.createdAt).getTime()),
    [byKind, statusFilter, query],
  );

  const entryList = entries.data ?? [];
  const entriesFor = (id: string): PaymentEntry[] => entryList.filter((e) => e.arrangementId === id);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
  const shownIds = new Set(byKind.map((r) => r.a.id));
  const receivedThisMonth = entryList.filter((e) => shownIds.has(e.arrangementId) && new Date(e.createdAt).getTime() >= monthStart).reduce((s, e) => s + e.amount, 0);

  const totalQuoted = byKind.reduce((s, r) => s + r.quoted, 0);
  const totalPaid = byKind.reduce((s, r) => s + r.paid, 0);
  const totalBalance = byKind.reduce((s, r) => s + r.balance, 0);
  const withBalance = byKind.filter((r) => r.balance > 0).length;
  const counts = (key: StatusKey) => (key === 'all' ? byKind.length : byKind.filter((r) => r.status === key).length);

  const pendingClaims = (claims.data ?? []).filter((c) => c.status === 'pending');
  const diyas = (gateway.data ?? []).filter((g) => g.kind === 'diya');
  const diyaTotal = diyas.reduce((s, g) => s + g.amount, 0);

  const opened = all.find((r) => r.a.id === openId) ?? null;
  const paying = all.find((r) => r.a.id === payFor) ?? null;

  const startPay = (r: Row) => {
    setPayFor(r.a.id);
    setAmount(r.balance > 0 ? String(r.balance) : '');
    setMethod('UPI');
    setNote('');
  };
  const submitPayment = (e: FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!paying || !(value > 0)) return;
    recordPayment.mutate(
      { id: paying.a.id, amount: value, method, note },
      {
        onSuccess: () => {
          showToast(`${inr(value)} (${method}) recorded for ${paying.a.contactName || paying.a.family}.`, 'info');
          setPayFor(null);
        },
        onError: () => showToast('Could not record the payment. Please try again.', 'info'),
      },
    );
  };

  const remind = (r: Row) => {
    const text = settings.templates.payment_reminder
      .replace(/\{name\}/g, r.a.contactName || r.a.family)
      .replace(/\{ref\}/g, r.a.id)
      .replace(/\{balance\}/g, inr(r.balance))
      .replace(/\{total\}/g, inr(r.quoted))
      .replace(/\{amount\}/g, inr(r.paid))
      .replace(/\{upi\}/g, settings.payment.upi_id)
      .replace(/\{phone\}/g, settings.business.phone)
      .replace(/\{service\}/g, r.a.serviceType);
    const link = whatsappLink(r.a.phone, text);
    if (!link) return showToast('This customer has no valid phone number for WhatsApp.', 'info');
    window.open(link, '_blank', 'noopener');
  };

  const receipt = (r: Row) =>
    downloadReceiptPdf(r.a, entriesFor(r.a.id), r.quoted, settings).catch(() => showToast('Could not create the receipt. Please try again.', 'info'));

  return (
    <div className="crm-screen active">
      {pendingClaims.length > 0 && (
        <section className="crm-section-card" style={{ marginBottom: 18 }}>
          <div className="crm-card-header">
            <div>
              <h3>UPI payments to check ({pendingClaims.length})</h3>
              <p className="comms-help" style={{ margin: 0 }}>Families reported these from the website. Match the transaction ID in your bank app, then press Verify.</p>
            </div>
          </div>
          <div className="crm-table-wrapper">
            <table className="crm-table">
              <thead><tr><th>Reference</th><th>Customer</th><th>Amount</th><th>UTR / transaction ID</th><th>Reported</th><th aria-label="Actions" /></tr></thead>
              <tbody>
                {pendingClaims.map((c) => {
                  const a = all.find((r) => r.a.id === c.arrangementId)?.a;
                  return (
                    <tr key={c.id}>
                      <td><strong>{c.arrangementId}</strong></td>
                      <td>{a ? `${a.contactName} · ${a.phone}` : '—'}</td>
                      <td>{inr(c.amount)}</td>
                      <td><code>{c.utr}</code></td>
                      <td>{new Date(c.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button className="btn btn-sm btn-primary" type="button" disabled={verifyClaim.isPending}
                          onClick={() => verifyClaim.mutate(c, { onSuccess: () => showToast(`${inr(c.amount)} recorded for ${c.arrangementId}.`, 'info'), onError: () => showToast('Could not record this payment.', 'info') })}>
                          Verify & record
                        </button>
                        <button className="btn btn-sm btn-secondary" type="button" disabled={rejectClaim.isPending}
                          onClick={() => rejectClaim.mutate(c.id, { onSuccess: () => showToast('Claim rejected.', 'info') })}>
                          Reject
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <div className="lead-filter-tabs" role="tablist" aria-label="Kind of booking" style={{ marginBottom: 14 }}>
        {(Object.keys(KIND_LABELS) as Kind[]).map((k) => (
          <button key={k} type="button" className={kind === k ? 'active' : ''} onClick={() => setKind(k)}>
            {KIND_LABELS[k]} ({k === 'all' ? all.length : k === 'diya' ? diyas.length : all.filter((r) => categoryOf(r.a) === k).length})
          </button>
        ))}
      </div>

      {kind === 'diya' && (
        <section className="crm-section-card">
          <div className="crm-card-header">
            <div>
              <h3>Diya donations</h3>
              <p className="comms-help" style={{ margin: 0 }}>₹20 offerings made on the website for the girl child’s education fund. They are kept apart from service money.</p>
            </div>
          </div>
          <div className="leads-kpis" style={{ marginBottom: 16 }} aria-label="Diya summary">
            <div><strong>{inr(diyaTotal)}</strong><span>Total donated</span></div>
            <div><strong>{diyas.length}</strong><span>Offerings</span></div>
          </div>
          {gateway.isLoading ? <p className="leads-empty">Loading…</p> : diyas.length === 0 ? (
            <p className="leads-empty">No diya donations yet.</p>
          ) : (
            <div className="crm-table-wrapper">
              <table className="crm-table">
                <thead><tr><th>Date</th><th>Note</th><th>Amount</th></tr></thead>
                <tbody>
                  {diyas.map((g) => (
                    <tr key={g.id}><td>{shortDate(g.createdAt)}</td><td>{g.note || '—'}</td><td><strong>{inr(g.amount)}</strong></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {kind !== 'diya' && (
        <>
      <div className="leads-kpis" style={{ marginBottom: 18 }} aria-label="Money summary">
        <div><strong>{inr(totalQuoted)}</strong><span>Total quoted</span></div>
        <div><strong>{inr(totalPaid)}</strong><span>Received so far</span><small style={{ color: 'var(--ink-muted)' }}>{inr(receivedThisMonth)} this month</small></div>
        <div><strong>{inr(totalBalance)}</strong><span>Still to collect</span></div>
        <div><strong>{withBalance}</strong><span>Cases with a balance</span></div>
      </div>
      {diyas.length > 0 && (
        <p className="comms-help" style={{ margin: '-6px 0 14px' }}>
          Diya contributions through Razorpay: <strong>{inr(diyaTotal)}</strong> from {diyas.length} offering{diyas.length === 1 ? '' : 's'}, meant for the girl child's education fund.
        </p>
      )}

      <section className="crm-section-card">
        <div className="crm-card-header leads-toolbar">
          <div>
            <h3>Payments</h3>
            <p className="comms-help" style={{ margin: 0 }}>Biggest balance first. Use the search box at the top to find a customer or reference.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => setShowGatewayTest(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              ⚡ Test Gateway & Duplicate Reconciliation
            </button>
            <div className="lead-filter-tabs" role="tablist" aria-label="Payment status">
              {(Object.keys(STATUS_LABELS) as StatusKey[]).map((k) => (
                <button key={k} type="button" className={statusFilter === k ? 'active' : ''} onClick={() => setStatusFilter(k)}>
                  {STATUS_LABELS[k]} ({counts(k)})
                </button>
              ))}
            </div>
          </div>
        </div>

        {arrangements.isLoading ? (
          <p className="leads-empty">Loading payments…</p>
        ) : rows.length === 0 ? (
          <p className="leads-empty">Nothing matches. Try another filter.</p>
        ) : (
          <div className="crm-table-wrapper">
            <table className="crm-table">
              <thead>
                <tr><th>Reference</th><th>Customer</th><th>Quoted</th><th>Received</th><th>Balance</th><th>Status</th><th aria-label="Actions" /></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.a.id} style={{ cursor: 'pointer' }} onClick={() => setOpenId(r.a.id)}>
                    <td><strong>{r.a.id}</strong><br /><span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>{r.a.serviceType}</span></td>
                    <td>{r.a.contactName || r.a.family}<br /><span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>{r.a.phone}</span></td>
                    <td>{r.quoted ? inr(r.quoted) : '—'}</td>
                    <td>{inr(r.paid)}</td>
                    <td><strong style={{ color: r.balance > 0 ? 'var(--amber-700)' : 'var(--moss-700)' }}>{r.quoted ? inr(r.balance) : '—'}</strong></td>
                    <td><span className={`status-badge ${BADGE[r.status].cls}`}>{BADGE[r.status].label}</span></td>
                    <td style={{ whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                      <button className="btn btn-sm btn-primary" type="button" onClick={() => startPay(r)}>Record payment</button>
                      <button className="btn btn-sm btn-secondary" type="button" disabled={r.balance <= 0} onClick={() => remind(r)}>Remind</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
        </>
      )}

      <section className="crm-section-card">
        <div className="crm-card-header"><h3>Where families can pay</h3></div>
        <div className="mini-list">
          <div className="mini-row"><span>UPI</span><strong>{settings.payment.upi_id}</strong></div>
          <div className="mini-row"><span>Bank transfer</span><strong style={{ whiteSpace: 'pre-line', textAlign: 'right' }}>{settings.payment.bank_details || 'Add the bank details in Settings'}</strong></div>
          <div className="mini-row"><span>Card, cash, cheque</span><strong>Record them here when received</strong></div>
        </div>
        <p className="comms-help">Change these in Settings, Company & messages, Payment details.</p>
      </section>

      <Modal
        wide
        isOpen={opened !== null}
        onClose={() => setOpenId(null)}
        headerContent={<h3>{opened ? `${opened.a.contactName || opened.a.family} · ${opened.a.id}` : ''}</h3>}
        footer={
          opened ? (
            <>
              <button className="btn btn-secondary" type="button" onClick={() => setOpenId(null)}>Close</button>
              <button className="btn btn-secondary" type="button" disabled={opened.balance <= 0} onClick={() => remind(opened)}>Send reminder on WhatsApp</button>
              <button className="btn btn-secondary" type="button" disabled={entriesFor(opened.a.id).length === 0} onClick={() => receipt(opened)}>Download receipt (PDF)</button>
              <button className="btn btn-primary" type="button" onClick={() => { startPay(opened); setOpenId(null); }}>Record payment</button>
            </>
          ) : null
        }
      >
        {opened && (
          <>
            <div className="leads-kpis" style={{ marginBottom: 16 }}>
              <div><strong>{opened.quoted ? inr(opened.quoted) : '—'}</strong><span>Quoted</span></div>
              <div><strong>{inr(opened.paid)}</strong><span>Received</span></div>
              <div><strong>{opened.quoted ? inr(opened.balance) : '—'}</strong><span>Balance</span></div>
              <div><span className={`status-badge ${BADGE[opened.status].cls}`}>{BADGE[opened.status].label}</span><span>{opened.a.serviceType}</span></div>
            </div>
            <h4 style={{ margin: '0 0 8px' }}>Payment history</h4>
            {entriesFor(opened.a.id).length === 0 ? (
              <p className="leads-empty">No payments recorded yet.</p>
            ) : (
              <div className="crm-table-wrapper">
                <table className="crm-table">
                  <thead><tr><th>Date</th><th>Method</th><th>Details</th><th>Amount</th></tr></thead>
                  <tbody>
                    {entriesFor(opened.a.id).map((e) => (
                      <tr key={e.id}><td>{shortDate(e.createdAt)}</td><td>{e.method}</td><td>{e.note || '—'}</td><td><strong>{inr(e.amount)}</strong></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </Modal>

      <Modal
        isOpen={paying !== null}
        onClose={() => setPayFor(null)}
        headerContent={<h3>Record payment{paying ? ` · ${paying.a.contactName || paying.a.family}` : ''}</h3>}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setPayFor(null)}>Cancel</button>
            <button type="submit" form="record-payment-form" className="btn btn-primary" disabled={recordPayment.isPending || !(Number(amount) > 0)}>
              {recordPayment.isPending ? 'Saving…' : 'Record payment'}
            </button>
          </>
        }
      >
        {paying && (
          <form id="record-payment-form" onSubmit={submitPayment}>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: 12 }}>
              {paying.a.id} · Quoted {paying.quoted ? inr(paying.quoted) : 'not set yet'} · Received {inr(paying.paid)} · Balance {paying.quoted ? inr(paying.balance) : '—'}
            </p>
            <div className="form-group">
              <label className="form-label">Amount received (₹)</label>
              <input className="form-input" type="number" min="1" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} required autoFocus />
              {paying.balance > 0 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-sm btn-secondary" onClick={() => setAmount(String(paying.balance))}>Full balance {inr(paying.balance)}</button>
                  <button type="button" className="btn btn-sm btn-secondary" onClick={() => setAmount(String(Math.round(paying.balance / 2)))}>Half {inr(Math.round(paying.balance / 2))}</button>
                </div>
              )}
              {paying.quoted > 0 && Number(amount) > paying.balance && (
                <p style={{ fontSize: '0.8rem', color: 'var(--amber-700)', marginTop: 6 }}>This is more than the balance of {inr(paying.balance)}. Check the amount.</p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">How was it paid?</label>
              <select className="form-select" value={method} onChange={(e) => setMethod(e.target.value)}>
                {METHODS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Reference or note (optional)</label>
              <input className="form-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="UPI transaction ID, cheque number, advance…" />
            </div>
          </form>
        )}
      </Modal>
      <GatewayTestModal
        isOpen={showGatewayTest}
        cases={arrangements.data ?? []}
        onClose={() => setShowGatewayTest(false)}
      />
    </div>
  );
}
