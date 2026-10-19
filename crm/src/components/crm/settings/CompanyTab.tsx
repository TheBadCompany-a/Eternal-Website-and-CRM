import { useAppSettings } from '../../../data/useSettings';
import { Field, SettingCard } from './SettingCard';

const PLACEHOLDERS = '{name}  {ref}  {service}  {items}  {total}  {phone}  {amount}  {balance}  {upi}';

export function CompanyTab() {
  const { settings } = useAppSettings();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 18 }}>
      <SettingCard title="Business details" help="Used in WhatsApp messages and quotations." settingKey="business" value={settings.business}>
        {(d, set) => (
          <>
            <Field label="Company name"><input className="form-input" value={d.company_name} onChange={(e) => set({ company_name: e.target.value })} /></Field>
            <Field label="Legal name"><input className="form-input" value={d.legal_name} onChange={(e) => set({ legal_name: e.target.value })} /></Field>
            <Field label="Tagline"><input className="form-input" value={d.tagline} onChange={(e) => set({ tagline: e.target.value })} /></Field>
            <Field label="Address"><textarea className="form-textarea" rows={2} value={d.address} onChange={(e) => set({ address: e.target.value })} /></Field>
            <Field label="Phone"><input className="form-input" value={d.phone} onChange={(e) => set({ phone: e.target.value })} /></Field>
            <Field label="Email"><input className="form-input" type="email" value={d.email} onChange={(e) => set({ email: e.target.value })} /></Field>
            <Field label="GST number"><input className="form-input" value={d.gst} onChange={(e) => set({ gst: e.target.value })} /></Field>
            <Field label="24-hour emergency line"><input className="form-input" value={d.emergency_line} onChange={(e) => set({ emergency_line: e.target.value })} /></Field>
          </>
        )}
      </SettingCard>

      <SettingCard title="Quotation settings" help="Printed on the quotation PDF." settingKey="quotation" value={settings.quotation}>
        {(d, set) => (
          <>
            <Field label="Quote is valid for (days). 0 means do not print a validity line.">
              <input className="form-input" type="number" min="0" value={d.valid_days} onChange={(e) => set({ valid_days: Math.max(0, Number(e.target.value) || 0) })} />
            </Field>
            <Field label="Tax added to quotations (%). 0 means no tax line.">
              <input className="form-input" type="number" min="0" max="100" step="0.5" value={d.tax_percent} onChange={(e) => set({ tax_percent: Math.max(0, Number(e.target.value) || 0) })} />
            </Field>
            <Field label="Terms and notes (printed at the bottom of the PDF)">
              <textarea className="form-textarea" rows={5} value={d.terms} onChange={(e) => set({ terms: e.target.value })} placeholder="For example: payment terms, what is not included…" />
            </Field>
          </>
        )}
      </SettingCard>

      <SettingCard title="Payment details" help="The UPI ID is also used on the website for star payments." settingKey="payment" value={settings.payment}>
        {(d, set) => (
          <>
            <Field label="UPI ID"><input className="form-input" value={d.upi_id} onChange={(e) => set({ upi_id: e.target.value.trim() })} /></Field>
            <Field label="Name shown in the UPI app"><input className="form-input" value={d.upi_name} onChange={(e) => set({ upi_name: e.target.value })} /></Field>
            <Field label="Bank account for transfers (shown to staff)">
              <textarea className="form-textarea" rows={3} value={d.bank_details} onChange={(e) => set({ bank_details: e.target.value })} placeholder="Bank, account number, IFSC" />
            </Field>
            <p className="comms-help">Razorpay online payments are connected separately, with keys in the Supabase project.</p>
          </>
        )}
      </SettingCard>

      <SettingCard title="Message templates" help={`Write once, reuse. You can use: ${PLACEHOLDERS}`} settingKey="templates" value={settings.templates}>
        {(d, set) => (
          <>
            <Field label="Quotation (WhatsApp)"><textarea className="form-textarea" rows={7} value={d.quotation} onChange={(e) => set({ quotation: e.target.value })} /></Field>
            <Field label="New lead welcome"><textarea className="form-textarea" rows={3} value={d.new_lead} onChange={(e) => set({ new_lead: e.target.value })} /></Field>
            <Field label="Payment received"><textarea className="form-textarea" rows={3} value={d.payment_received} onChange={(e) => set({ payment_received: e.target.value })} /></Field>
            <Field label="Payment reminder"><textarea className="form-textarea" rows={3} value={d.payment_reminder} onChange={(e) => set({ payment_reminder: e.target.value })} /></Field>
            <Field label="Feedback request"><textarea className="form-textarea" rows={3} value={d.feedback} onChange={(e) => set({ feedback: e.target.value })} /></Field>
          </>
        )}
      </SettingCard>
    </div>
  );
}
