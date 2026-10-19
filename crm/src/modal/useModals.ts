import { useState } from 'react';

export type ModalKey = 'sos' | null;

export function useModals() {
  const [activeModal, setActiveModal] = useState<ModalKey>(null);
  return {
    activeModal,
    open: (key: Exclude<ModalKey, null>) => setActiveModal(key),
    close: () => setActiveModal(null),
  };
}
