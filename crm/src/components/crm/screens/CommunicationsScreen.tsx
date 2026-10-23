import { quotedFor } from '../../../lib/paymentCategory';
import { whatsappLink } from '../../../lib/whatsapp';
import { useAppSettings } from '../../../data/useSettings';
import { useEffect, useMemo, useState } from 'react';
import { useAppState } from '../../../state/useAppState';
import { useArrangements } from '../../../data/useArrangements';
import { useCommunications, useSendCommunication } from '../../../data/useCommunications';
import { useToast } from '../../../toast/useToast';

export function CommunicationsScreen() {
  const state = useAppState();
  const arrangements = useArrangements();
  const communications = useCommunications();
  const sendCommunication = useSendCommunication();
  const { showToast } = useToast();
  const [reference, setReference] = useState('');
  const [message, setMessage] = useState('');
  const { settings } = useAppSettings();
  const [showAllChannels, setShowAllChannels] = useState(false);

  useEffect(() => {
    if (reference || !arrangements.data?.length) return;
    setReference(state.activeOpsCaseId || arrangements.data[0].id);
  }, [arrangements.data, reference, state.activeOpsCaseId]);

  const selectedLead = arrangements.data?.find((lead) => lead.id === reference);
  const filtered = useMemo(
    () => (communications.data ?? []).filter((item) => showAllChannels || item.channel === 'WhatsApp'),
    [communications.data, showAllChannels],
  );

  const [customStatus, setCustomStatus] = useState<Record<string, 'Prepared' | 'Logged' | 'Sent' | 'Delivered'>>({});

  const getStatus = (item: { id: string; text: string; channel: string }): { label: string; cls: string } => {
    if (customStatus[item.id]) {
      const s = customStatus[item.id];
      if (s === 'Delivered') return { label: '✓ Delivered', cls: 'status-confirmed' };
      if (s === 'Sent') return { label: '📤 Sent', cls: 'status-enroute' };
      if (s === 'Prepared') return { label: '💬 Prepared in WhatsApp', cls: 'status-inquiry' };
      return { label: '📝 Logged', cls: 'status-inquiry' };
    }
    if (item.text.includes('[Prepared in WhatsApp')) {
      return { label: '💬 Prepared in WhatsApp (Not Delivered)', cls: 'status-inquiry' };
    }
    if (item.channel === 'WhatsApp') {
      return { label: '💬 Prepared in WhatsApp', cls: 'status-inquiry' };
    }
    return { label: '📝 Logged internally', cls: 'status-inquiry' };
  };

  const markStatus = (id: string, s: 'Prepared' | 'Logged' | 'Sent' | 'Delivered') => {
    setCustomStatus((prev) => ({ ...prev, [id]: s }));
    showToast(`Message marked as ${s}.`, 'info');
  };

  const logWhatsAppUpdate = (isPreparedOnly = false) => {
    if (!reference || !message.trim()) return;
    const body = isPreparedOnly
      ? `[Prepared in WhatsApp — chat opened, pending delivery proof] ${message.trim()}`
      : message.trim();

    sendCommunication.mutate(
      { arrangementId: reference, channel: 'WhatsApp', text: body },
      {
        onSuccess: () => {
          setMessage('');
          showToast(
            isPreparedOnly
              ? `Chat opened in WhatsApp. Message recorded as 'Prepared' (not delivered).`
              : `Communication logged under ${reference}.`,
            'info',
          );
        },
        onError: () => showToast('Could not log the communication — please try again.', 'info'),
      },
    );
  };

  const sendViaWhatsApp = () => {
    if (!selectedLead || !message.trim()) return;
    const link = whatsappLink(selectedLead.phone, message.trim());
    if (!link) return showToast('This lead has no valid phone number for WhatsApp.', 'info');
    window.open(link, '_blank', 'noopener');
    logWhatsAppUpdate(true);
  };

  return (
    <div className="crm-screen active">
      <section className="whatsapp-header">
        <div>
          <span>WhatsApp lead tracking</span>
          <h3>Every conversation tied to its lead reference.</h3>
          <p>Log an update against the customer’s CRM reference to give sales, operations and accounts one shared timeline.  “Send via WhatsApp” opens the chat with your message ready to send, and logs it here.</p>
        </div>
        <div className="whatsapp-reference-card">
          <small>Selected reference</small>
          <strong>{reference || 'Select a lead'}</strong>
          <span>{selectedLead ? `${selectedLead.contactName} · ${selectedLead.phone}` : 'No lead selected'}</span>
        </div>
      </section>

      <div className="comms-grid">
        <section className="crm-section-card" style={{ marginBottom: 0 }}>
          <div className="crm-card-header"><div><h3>Log WhatsApp update</h3><p className="comms-help">The lead reference is saved automatically with this entry.</p></div><span className="whatsapp-pill">● WhatsApp</span></div>
          <label className="comms-label" htmlFor="lead-reference">Lead reference</label>
          <select id="lead-reference" className="comms-control" value={reference} onChange={(e) => setReference(e.target.value)}>
            <option value="">Select a lead reference</option>
            {(arrangements.data ?? []).map((lead) => <option key={lead.id} value={lead.id}>{lead.id} — {lead.contactName || lead.family}</option>)}
          </select>
          <label className="comms-label" htmlFor="message-template">Start from a template</label>
          <select
            id="message-template"
            className="comms-control"
            value=""
            disabled={!selectedLead}
            onChange={(e) => {
              const text = settings.templates[e.target.value as 'new_lead' | 'payment_received' | 'feedback'];
              if (!text || !selectedLead) return;
              setMessage(
                text
                  .replace(/\{name\}/g, selectedLead.contactName || selectedLead.family)
                  .replace(/\{ref\}/g, selectedLead.id)
                  .replace(/\{service\}/g, selectedLead.serviceType)
                  .replace(/\{phone\}/g, settings.business.phone)
                  .replace(/\{amount\}/g, `₹${selectedLead.paidAmount.toLocaleString('en-IN')}`)
                  .replace(/\{total\}/g, `₹${quotedFor(selectedLead).toLocaleString('en-IN')}`),
              );
            }}
          >
            <option value="">{selectedLead ? 'Choose a template…' : 'Choose a customer first'}</option>
            <option value="new_lead">New lead welcome</option>
            <option value="payment_received">Payment received</option>
            <option value="feedback">Feedback request</option>
          </select>
          <label className="comms-label" htmlFor="whatsapp-message">Conversation update</label>
          <textarea className="comms-control comms-message" id="whatsapp-message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Example: Shared the quotation and scheduled a callback for 4:30 PM." rows={5} />
          <button className="btn btn-primary" type="button" disabled={!reference || !message.trim() || sendCommunication.isPending} onClick={() => logWhatsAppUpdate(false)}>{sendCommunication.isPending ? 'Saving…' : 'Log internally'}</button>
          {' '}
          <button className="btn btn-secondary" type="button" disabled={!selectedLead || !message.trim() || sendCommunication.isPending} onClick={sendViaWhatsApp}>Send via WhatsApp ↗</button>
        </section>

        <section className="crm-section-card" style={{ marginBottom: 0 }}>
          <div className="crm-card-header"><div><h3>Tracking & Evidence Rules</h3><p className="comms-help">Reference-first communication hygiene.</p></div></div>
          <ol className="tracking-rules">
            <li>Find the customer by CRM reference before recording any update.</li>
            <li>Keep messages factual: response, promise, follow-up, document or status.</li>
            <li>Use the same reference for every team handover and booking conversion.</li>
            <li><strong>Proof of delivery:</strong> Opening a WhatsApp chat window is NOT proof of delivery. Outgoing WhatsApp actions are marked <em>Prepared in WhatsApp</em> until confirmed sent or delivered.</li>
          </ol>
        </section>
      </div>

      <section className="crm-section-card comms-timeline-card">
        <div className="crm-card-header">
          <div>
            <h3>Communication timeline</h3>
            <p className="comms-help">{showAllChannels ? 'All channels' : 'WhatsApp updates only'} · newest first</p>
          </div>
          <button className="btn btn-sm btn-secondary" type="button" onClick={() => setShowAllChannels((current) => !current)}>
            {showAllChannels ? 'Show WhatsApp only' : 'Show all channels'}
          </button>
        </div>
        {communications.isLoading ? (
          <p className="leads-empty">Loading communications…</p>
        ) : filtered.length === 0 ? (
          <p className="leads-empty">No {showAllChannels ? '' : 'WhatsApp '}updates have been logged yet.</p>
        ) : (
          <div className="comms-timeline">
            {filtered.map((item) => {
              const statusInfo = getStatus(item);
              return (
                <article className="comms-entry" key={item.id}>
                  <div className={`comms-channel ${item.channel === 'WhatsApp' ? 'is-whatsapp' : ''}`}>
                    {item.channel === 'WhatsApp' ? 'WA' : item.channel.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="comms-entry-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                      <div>
                        <strong>{item.caseId}</strong>
                        <span>{item.channel} · {item.sender} · {item.time}</span>
                      </div>
                      <span className={`status-badge ${statusInfo.cls}`} style={{ fontSize: '0.74rem' }}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p style={{ margin: '6px 0 8px' }}>{item.text}</p>
                    <div style={{ display: 'flex', gap: 8, fontSize: '0.76rem' }}>
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        style={{ padding: '2px 8px', fontSize: '0.74rem' }}
                        onClick={() => markStatus(item.id, 'Sent')}
                      >
                        Mark as Sent
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        style={{ padding: '2px 8px', fontSize: '0.74rem' }}
                        onClick={() => markStatus(item.id, 'Delivered')}
                      >
                        ✓ Confirm Delivered
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
