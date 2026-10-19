/**
 * Single source of truth for status → badge-class mapping.
 * Ported from crm.js's getStatusBadgeClass, extended to also cover the
 * Vehicles/Team status vocab (previously duplicated inline in renderVehicles/renderTeam).
 */
export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'New Inquiry':
      return 'status-inquiry';
    case 'Confirmed':
    case 'Available':
      return 'status-confirmed';
    case 'In Execution':
    case 'On Duty':
      return 'status-enroute';
    case 'Completed':
    case 'Off Duty':
    case 'Under Maintenance':
      return 'status-completed';
    default:
      return 'status-inprogress';
  }
}
