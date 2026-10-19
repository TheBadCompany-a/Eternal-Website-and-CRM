import { useState, type FormEvent } from 'react';
import { Modal } from '../../modal/Modal';
import { useCreateArrangement, type NewArrangementInput } from '../../data/useArrangements';
import { useToast } from '../../toast/useToast';
import { useAppSettings } from '../../data/useSettings';
import type { LeadSource } from '../../types';

const NEEDS = ['Immediate Arrangement', 'Planned Arrangement', 'Transfer / Transportation', 'Not Sure — Guide Me'] as const;
const SOURCES: LeadSource[] = ['Unattributed', 'Website', 'Google Ads', 'Meta Ads', 'WhatsApp', 'Referral', 'Walk-in', 'Other'];
const today = () => new Date().toISOString().slice(0, 10);

const empty = (): NewArrangementInput => ({
  family: '', contactName: '', phone: '', email: '', serviceType: '', needCategory: 'Immediate Arrangement',
  pickupLocation: '', destinationLocation: '', serviceDate: today(), serviceTime: '10:00', notes: '', leadSource: 'Unattributed', city: '',
});

export function NewLeadModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const create = useCreateArrangement();
  const { settings } = useAppSettings();
  const { showToast } = useToast();
  const [form, setForm] = useState(empty);
  const set = <K extends keyof NewArrangementInput>(key: K) => (e: { target: { value: string } }) =>
    setForm({ ...form, [key]: e.target.value as NewArrangementInput[K] });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    create.mutate(form, {
      onSuccess: (id) => {
        showToast(`Lead ${id} created for ${form.family}.`, 'info');
        setForm(empty());
        onClose();
      },
      onError: () => showToast('Could not save the lead — please check the details and try again.', 'info'),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      headerContent={<h3>New lead / arrangement</h3>}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" form="new-lead-form" className="btn btn-primary" disabled={create.isPending}>
            {create.isPending ? 'Saving…' : 'Create lead'}
          </button>
        </>
      }
    >
      <form id="new-lead-form" onSubmit={handleSubmit}>
        <div className="form-group"><label className="form-label">Family name *</label>
          <input className="form-input" value={form.family} onChange={set('family')} required /></div>
        <div className="form-group"><label className="form-label">Contact person *</label>
          <input className="form-input" value={form.contactName} onChange={set('contactName')} required /></div>
        <div className="form-group"><label className="form-label">Phone *</label>
          <input className="form-input" type="tel" value={form.phone} onChange={set('phone')} required /></div>
        <div className="form-group"><label className="form-label">Email</label>
          <input className="form-input" type="email" value={form.email} onChange={set('email')} /></div>
        <div className="form-group"><label className="form-label">City</label>
          <input className="form-input" list="lead-cities" value={form.city} onChange={set('city')} placeholder="e.g. Delhi, Noida, Gurugram" />
          <datalist id="lead-cities">{settings.lists.cities.map((c) => <option key={c.name} value={c.name} />)}</datalist></div>
        <div className="form-group"><label className="form-label">Need *</label>
          <select className="form-select" value={form.needCategory} onChange={set('needCategory')}>
            {NEEDS.map((n) => <option key={n}>{n}</option>)}
          </select></div>
        <div className="form-group"><label className="form-label">Service type *</label>
          <input className="form-input" list="lead-services" value={form.serviceType} onChange={set('serviceType')} placeholder="e.g. Cremation transport" required />
          <datalist id="lead-services">{settings.lists.services.map((c) => <option key={c} value={c} />)}</datalist></div>
        <div className="form-group"><label className="form-label">Pickup location *</label>
          <input className="form-input" value={form.pickupLocation} onChange={set('pickupLocation')} required /></div>
        <div className="form-group"><label className="form-label">Destination *</label>
          <input className="form-input" value={form.destinationLocation} onChange={set('destinationLocation')} required /></div>
        <div className="form-group"><label className="form-label">Service date *</label>
          <input className="form-input" type="date" value={form.serviceDate} onChange={set('serviceDate')} required /></div>
        <div className="form-group"><label className="form-label">Service time *</label>
          <input className="form-input" type="time" value={form.serviceTime} onChange={set('serviceTime')} required /></div>
        <div className="form-group"><label className="form-label">Lead source</label>
          <select className="form-select" value={form.leadSource} onChange={set('leadSource')}>
            {SOURCES.map((s) => <option key={s}>{s}</option>)}
          </select></div>
        <div className="form-group"><label className="form-label">Notes</label>
          <textarea className="form-textarea" value={form.notes} onChange={set('notes')} rows={3} /></div>
      </form>
    </Modal>
  );
}
