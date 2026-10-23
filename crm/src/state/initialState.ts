import type { AppState } from '../types';

export const STORAGE_KEY = 'ETERNAL_CRM_UI_STATE_V2';

export function createInitialState(): AppState {
  return {
    activeCrmSidebarItem: 'dashboard',
    activeOpsCaseId: null,
    opsOpenRequest: false,
    searchFilter: '',
  };
}

export function loadInitialState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...createInitialState(), ...(JSON.parse(saved) as Partial<AppState>) };
    }
  } catch (e) {
    console.warn('Failed to load UI state from localStorage:', e);
  }
  return createInitialState();
}
