import { getStatusBadgeClass } from '../../state/statusBadge';

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  return <span className={`status-badge ${getStatusBadgeClass(status)}`}>{label ?? status}</span>;
}
