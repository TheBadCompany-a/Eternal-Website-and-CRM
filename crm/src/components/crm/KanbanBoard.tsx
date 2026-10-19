import type { Arrangement, ArrangementStatus } from '../../types';
import { KanbanCard } from './KanbanCard';

const COLUMNS: { key: ArrangementStatus; title: string; target: ArrangementStatus | null }[] = [
  { key: 'New Inquiry', title: 'Step 10 · New Inquiry', target: 'Contacted' },
  { key: 'Contacted', title: 'Step 11 · Contacted', target: 'Plan Review' },
  { key: 'Plan Review', title: 'Step 12 · Plan Review', target: 'Quotation' },
  { key: 'Quotation', title: 'Step 13 · Quotation', target: 'Confirmed' },
  { key: 'Confirmed', title: 'Step 14 · Confirmed Order', target: 'In Execution' },
  { key: 'In Execution', title: 'Step 17 · In Execution', target: 'Completed' },
  { key: 'Completed', title: 'Step 20 · Completed & Closed', target: null },
];

export function KanbanBoard({ arrangements }: { arrangements: Arrangement[] }) {
  return (
    <div className="kanban-board">
      {COLUMNS.map((col) => {
        const items = arrangements.filter((a) => a.status === col.key);
        return (
          <div className="kanban-column" key={col.key}>
            <div className="kanban-col-header">
              <span className="kanban-col-title">{col.title}</span>
              <span className="kanban-count">{items.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              {items.length > 0 ? (
                items.map((item) => <KanbanCard key={item.id} item={item} target={col.target} />)
              ) : (
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--ink-muted)',
                    padding: 14,
                    textAlign: 'center',
                    border: '1px dashed var(--border-delicate)',
                    borderRadius: 4,
                  }}
                >
                  No cases
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
