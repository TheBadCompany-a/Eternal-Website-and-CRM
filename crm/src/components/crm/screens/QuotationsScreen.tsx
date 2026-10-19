import { useEffect, useState } from 'react';
import type { Quotation } from '../../../types';
import { useAppDispatch, useAppState } from '../../../state/useAppState';
import { useArrangements } from '../../../data/useArrangements';
import { useApproveQuote, useMarkQuoteSent, useQuotationItems, useSetQuotationItem, useUpdateQuotation } from '../../../data/useQuotations';
import { useServiceCatalog } from '../../../data/usePackages';
import { useAppSettings } from '../../../data/useSettings';
import { whatsappLink } from '../../../lib/whatsapp';
import { downloadQuotationPdf, quotationMessage } from '../../../lib/quotationShare';
import { useToast } from '../../../toast/useToast';
import { StatusBadge } from '../StatusBadge';

type LineItemKey = keyof Omit<Quotation, 'total' | 'status'>;

// Extra charges that are not services on the price list.
const EXTRA_FIELDS: { key: LineItemKey; label: string }[] = [
  { key: 'distance', label: 'Distance & Toll Charges (₹)' },
  { key: 'waitingCharges', label: 'Waiting & Detention Charges (₹)' },
  { key: 'other', label: 'Other Expenses (₹)' },
];

// Older cost boxes. Services on the price list replace them, so they only show when a
// quotation already has an amount in them (so no existing money is hidden).
const OLD_FIELDS: { key: LineItemKey; label: string }[] = [
  { key: 'vehicle', label: 'Hearse / Vehicle Cost (₹)' },
  { key: 'staff', label: 'Attendants & Staff (₹)' },
  { key: 'additionalServices', label: 'Additional Family Transportation (₹)' },
  { key: 'florals', label: 'Floral Garlands & Wreaths (₹)' },
  { key: 'rituals', label: 'Priest & Ritual Materials (₹)' },
];

export function QuotationsScreen() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const arrangements = useArrangements();
  const updateQuotation = useUpdateQuotation();
  const approveQuote = useApproveQuote();
  const markSent = useMarkQuoteSent();
  const catalog = useServiceCatalog();
  const { settings } = useAppSettings();
  const setItem = useSetQuotationItem();
  const { showToast } = useToast();

  const list = arrangements.data ?? [];
  const activeCaseId = state.activeOpsCaseId || list[0]?.id;
  const targetCase = list.find((a) => a.id === activeCaseId) || list[0];

  const quoteItems = useQuotationItems(targetCase?.id);
  const picked = quoteItems.data ?? [];
  const pickedByKey = new Map(picked.map((i) => [i.serviceKey, i]));
  const categories = [...new Set((catalog.data ?? []).map((c) => c.category))];

  // Local editable copy so typing feels instant — total is server-computed,
  // so we commit each field onBlur rather than round-tripping per keystroke.
  const [draft, setDraft] = useState<Record<LineItemKey, number> | null>(null);

  useEffect(() => {
    if (targetCase) {
      const { total: _total, status: _status, ...items } = targetCase.quotation;
      setDraft(items);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetCase?.id]);

  if (!targetCase || !draft) return <div className="crm-screen active" />;
  const q = targetCase.quotation;

  const commitField = (key: LineItemKey) => {
    if (draft[key] === q[key]) return;
    updateQuotation.mutate({ arrangementId: targetCase.id, patch: { [key]: draft[key] } });
  };

  return (
    <div className="crm-screen active">
      <div className="crm-section-card" style={{ maxWidth: 1100 }}>
        <div className="form-group" style={{ marginBottom: 18, maxWidth: 520 }}>
          <label className="form-label">Customer</label>
          <select
            className="form-select"
            value={targetCase.id}
            onChange={(e) => dispatch({ type: 'SET_ACTIVE_OPS_CASE', caseId: e.target.value })}
          >
            {list.map((a) => (
              <option key={a.id} value={a.id}>
                {a.contactName || a.family} — {a.id}
              </option>
            ))}
          </select>
        </div>

        <div className="crm-card-header">
          <div>
            <h3>{targetCase.contactName || targetCase.family}</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>
              Came from: {[targetCase.leadSource, targetCase.leadCampaign].filter(Boolean).join(' · ') || 'Not recorded'}
              {targetCase.phone ? ` · ${targetCase.phone}` : ''}
            </p>
          </div>
          <StatusBadge status="Confirmed" label={q.status} />
        </div>


        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--ink-muted)', marginBottom: 10 }}>
            Services
          </div>
          {catalog.isLoading && <p className="comms-help">Loading services…</p>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }}>
          {categories.map((category) => (
            <div key={category} style={{ border: '1px solid var(--border-delicate)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 10, fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--ink-muted)', marginBottom: 6 }}>
                <span style={{ color: 'var(--ink-primary)', fontSize: '0.85rem', textTransform: 'none' }}>{category}</span>
                <span>Price (₹)</span>
              </div>
              {(catalog.data ?? [])
                .filter((c) => c.category === category)
                .map((svc) => {
                  const chosen = pickedByKey.get(svc.key);
                  const save = (patch: Partial<{ unitPrice: number; quantity: number }>) =>
                    setItem.mutate(
                      {
                        arrangementId: targetCase.id,
                        item: {
                          serviceKey: svc.key,
                          label: svc.name,
                          unitPrice: patch.unitPrice ?? chosen?.unitPrice ?? svc.price,
                          quantity: patch.quantity ?? chosen?.quantity ?? 1,
                        },
                      },
                      { onError: () => showToast('Could not update this service.', 'info') },
                    );
                  return (
                    <div
                      key={svc.key}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 120px',
                        gap: 10,
                        alignItems: 'center',
                        padding: '6px 0',
                        borderBottom: '1px solid var(--border-delicate)',
                      }}
                    >
                      <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={!!chosen}
                          onChange={(e) =>
                            e.target.checked
                              ? save({})
                              : setItem.mutate(
                                  { arrangementId: targetCase.id, item: { serviceKey: svc.key, label: svc.name, unitPrice: svc.price, quantity: 1 }, remove: true },
                                  { onError: () => showToast('Could not remove this service.', 'info') },
                                )
                          }
                        />
                        {svc.name}
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="form-input"
                        aria-label={`${svc.name} price`}
                        disabled={!chosen}
                        key={`${svc.key}-${chosen?.unitPrice ?? svc.price}`}
                        defaultValue={chosen?.unitPrice ?? svc.price}
                        onBlur={(e) => {
                          const v = Number(e.target.value);
                          if (chosen && v >= 0 && v !== chosen.unitPrice) save({ unitPrice: v });
                        }}
                      />
                    </div>
                  );
                })}
            </div>
          ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--ink-muted)', marginBottom: 10 }}>
            Extra charges
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[...EXTRA_FIELDS, ...OLD_FIELDS.filter((f) => q[f.key] > 0)].map((f) => (
              <div className="form-group" key={f.key}>
                <label className="form-label">{f.label}</label>
                <input
                  type="number"
                  className="form-input"
                  value={draft[f.key]}
                  onChange={(e) => setDraft({ ...draft, [f.key]: Number(e.target.value) })}
                  onBlur={() => commitField(f.key)}
                />
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-sand)',
            padding: '16px 20px',
            borderRadius: 8,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--ink-muted)' }}>
              Total Verified Quotation
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 600, color: 'var(--moss-900)' }}>
              ₹{q.total.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="btn-group">
            <button
              className="btn btn-secondary"
              onClick={() => {
                const link = whatsappLink(targetCase.phone, quotationMessage(targetCase, picked, settings));
                if (!link) {
                  showToast('This customer has no valid phone number for WhatsApp.', 'info');
                  return;
                }
                window.open(link, '_blank', 'noopener');
                markSent.mutate(targetCase.id);
              }}
            >
              Send on WhatsApp →
            </button>
            <button className="btn btn-secondary" onClick={() =>
                downloadQuotationPdf(targetCase, picked, settings).catch(() => showToast('Could not create the PDF. Please try again.', 'info'))
              }>
              Download PDF
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                approveQuote.mutate(targetCase.id, {
                  onSuccess: () => showToast(`Quotation approved for ${targetCase.id}. Service order created!`, 'alert'),
                  onError: () => showToast('Could not approve the quotation — please try again.', 'info'),
                });
              }}
            >
              Mark as Approved ✓
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
