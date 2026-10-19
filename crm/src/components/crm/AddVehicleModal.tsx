import { useState, type FormEvent } from 'react';
import { Modal } from '../../modal/Modal';
import { useAddVehicle } from '../../data/useFleet';
import { useToast } from '../../toast/useToast';

const EMPTY = { model: '', reg: '', type: '', location: '', driver: '' };

export function AddVehicleModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const addVehicle = useAddVehicle();
  const { showToast } = useToast();
  const [form, setForm] = useState(EMPTY);
  const set = (key: keyof typeof EMPTY) => (e: { target: { value: string } }) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    addVehicle.mutate(
      { ...form, model: form.model.trim(), reg: form.reg.trim().toUpperCase() },
      {
        onSuccess: () => {
          showToast(`${form.model.trim()} (${form.reg.trim().toUpperCase()}) added to the fleet.`, 'info');
          setForm(EMPTY);
          onClose();
        },
        onError: (err) =>
          showToast(
            /duplicate|unique/i.test(err.message)
              ? 'A vehicle with this registration already exists.'
              : /row-level security/i.test(err.message)
                ? 'Only admins can add vehicles.'
                : 'Could not save the vehicle — please try again.',
            'info',
          ),
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      headerContent={<h3>Add vehicle</h3>}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" form="add-vehicle-form" className="btn btn-primary" disabled={addVehicle.isPending}>
            {addVehicle.isPending ? 'Saving…' : 'Save vehicle'}
          </button>
        </>
      }
    >
      <form id="add-vehicle-form" onSubmit={handleSubmit}>
        <div className="form-group"><label className="form-label">Model & tier *</label>
          <input className="form-input" value={form.model} onChange={set('model')} placeholder="e.g. Premium Hearse" required /></div>
        <div className="form-group"><label className="form-label">Registration *</label>
          <input className="form-input" value={form.reg} onChange={set('reg')} placeholder="e.g. DL 01 AB 1234" required /></div>
        <div className="form-group"><label className="form-label">Type</label>
          <input className="form-input" value={form.type} onChange={set('type')} placeholder="Hearse, Van, Ambulance…" /></div>
        <div className="form-group"><label className="form-label">Driver</label>
          <input className="form-input" value={form.driver} onChange={set('driver')} /></div>
        <div className="form-group"><label className="form-label">Location</label>
          <input className="form-input" value={form.location} onChange={set('location')} /></div>
      </form>
    </Modal>
  );
}
