import type { ChecklistState } from '../../types';

/** The duty checklist shared by the Operations screen and the Driver App. */
export const CHECKLIST_ITEMS: { key: keyof ChecklistState; label: string }[] = [
  { key: 'vehicleAvailable', label: 'Vehicle ready' },
  { key: 'vehicleCleaned', label: 'Vehicle clean' },
  { key: 'equipmentReady', label: 'Equipment ready' },
  { key: 'driverAssigned', label: 'Driver briefed' },
  { key: 'destinationConfirmed', label: 'Destination confirmed' },
  { key: 'customerContacted', label: 'Family told ETA' },
  { key: 'docsChecked', label: 'Documents checked' },
  { key: 'additionalServicesConfirmed', label: 'Extras confirmed' },
];
