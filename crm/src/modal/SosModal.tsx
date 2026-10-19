import { Modal } from './Modal';

export function SosModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      headerStyle={{ background: 'var(--crimson-100)' }}
      headerContent={
        <h3 style={{ color: 'var(--crimson-600)', display: 'flex', alignItems: 'center', gap: 8 }}>
          🚨 24/7 Emergency Assistance Line
        </h3>
      }
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <a
            href="tel:18002008899"
            className="btn btn-primary"
            style={{ background: 'var(--crimson-600)', borderColor: 'var(--crimson-600)' }}
          >
            Call 1800-200-8899 Now
          </a>
        </>
      }
    >
      <p style={{ fontSize: '0.95rem', marginBottom: 18 }}>
        Need immediate hearse transport, hospital clearance, or mortuary preservation? Our on-duty directors are
        standing by.
      </p>
      <div
        style={{
          background: 'var(--bg-sand)',
          padding: 18,
          borderRadius: 8,
          textAlign: 'center',
          border: '1.5px solid var(--border-medium)',
          marginBottom: 18,
        }}
      >
        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--ink-muted)' }}>
          Toll-Free 24/7 Hotline
        </div>
        <div
          style={{
            fontSize: '1.8rem',
            fontFamily: 'var(--font-serif)',
            fontWeight: 600,
            color: 'var(--crimson-600)',
            margin: '6px 0',
          }}
        >
          1800-200-8899
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--ink-secondary)' }}>
          Lines open now · Immediate vehicle dispatch
        </div>
      </div>
    </Modal>
  );
}
