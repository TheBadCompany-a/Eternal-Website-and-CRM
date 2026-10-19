import { useAppDispatch, useAppState } from '../../state/useAppState';

export function CrmTopbar() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  return (
    <div className="crm-topbar">
      <div className="crm-topbar-title">
        <h2>Operations Control Center</h2>
        <p>Technology handles the coordination. People handle the care.</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="crm-search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by Family, ID, Service, Phone..."
            value={state.searchFilter}
            onChange={(e) => dispatch({ type: 'SET_SEARCH_FILTER', term: e.target.value.toLowerCase() })}
          />
        </div>
      </div>
    </div>
  );
}
