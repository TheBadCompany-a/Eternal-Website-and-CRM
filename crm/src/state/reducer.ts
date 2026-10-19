import type { AppState, CrmSidebarItem } from '../types';

/**
 * Pure client UI state only. Every action that used to read/write server
 * data (arrangements, callbacks, fleet, profiles, communications) lives in
 * the React Query hooks in src/data/ instead — see that folder's use*.ts
 * files (e.g. UPDATE_ARRANGEMENT_STATUS is now useUpdateArrangementStatus()).
 */
export type Action =
  | { type: 'SET_CRM_SIDEBAR_ITEM'; item: CrmSidebarItem }
  | { type: 'SET_ACTIVE_OPS_CASE'; caseId: string }
  | { type: 'SET_SEARCH_FILTER'; term: string };

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_CRM_SIDEBAR_ITEM':
      return { ...state, activeCrmSidebarItem: action.item };

    case 'SET_ACTIVE_OPS_CASE':
      return { ...state, activeOpsCaseId: action.caseId };

    case 'SET_SEARCH_FILTER':
      return { ...state, searchFilter: action.term };

    default:
      return state;
  }
}
