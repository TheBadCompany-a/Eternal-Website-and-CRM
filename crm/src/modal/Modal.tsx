import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  headerContent: ReactNode;
  headerStyle?: React.CSSProperties;
  children: ReactNode;
  footer: ReactNode;
  /** A large window for tables and lists. */
  wide?: boolean;
}

export function Modal({ isOpen, onClose, headerContent, headerStyle, children, footer, wide }: ModalProps) {
  return (
    <div
      className={`modal-overlay ${isOpen ? 'active' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`modal-card ${wide ? 'modal-card--wide' : ''}`}>
        <div className="modal-header" style={headerStyle}>
          {headerContent}
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">{footer}</div>
      </div>
    </div>
  );
}
