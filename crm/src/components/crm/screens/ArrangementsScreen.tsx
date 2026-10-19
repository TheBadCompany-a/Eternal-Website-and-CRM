import { useArrangements } from '../../../data/useArrangements';
import { KanbanBoard } from '../KanbanBoard';

export function ArrangementsScreen() {
  const arrangements = useArrangements();

  return (
    <div className="crm-screen active">
      <div style={{ marginBottom: 18 }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)' }}>
          Arrangement Lifecycle: New Inquiry → Contacted → Plan Review → Quotation → Confirmed → In Execution →
          Completed. New inquiries arrive automatically from the website's "Arrange a Service" wizard.
        </p>
      </div>
      <KanbanBoard arrangements={arrangements.data ?? []} />
    </div>
  );
}
