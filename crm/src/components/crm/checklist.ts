import type { ChecklistState } from '../../types';

/** The duty checklist shared by the Operations screen and the Driver App. */
export const CHECKLIST_ITEMS: { key: keyof ChecklistState; label: string }[] = [
  { key: 'vehicleAvailable', label: '✓ Vehicle available & operational' },
  { key: 'vehicleCleaned', label: '✓ Vehicle cleaned, sanitised & interior dressed' },
  { key: 'equipmentReady', label: '✓ Equipment & ceremonial lowering gear ready' },
  { key: 'driverAssigned', label: '✓ Driver assigned & briefed on family customs' },
  { key: 'destinationConfirmed', label: '✓ Destination slot confirmed with ground warden' },
  { key: 'customerContacted', label: '✓ Customer contacted with ETA update' },
  { key: 'docsChecked', label: '✓ Hospital Death Summary & Police NOC verified' },
  { key: 'additionalServicesConfirmed', label: '✓ Additional services & floral garlands confirmed' },
];
