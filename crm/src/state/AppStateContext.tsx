import { createContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react';
import type { AppState } from '../types';
import { loadInitialState, STORAGE_KEY } from './initialState';
import { appReducer, type Action } from './reducer';

export const AppStateContextObj = createContext<AppState | null>(null);
export const AppDispatchContextObj = createContext<Dispatch<Action> | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, loadInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }, [state]);

  return (
    <AppStateContextObj.Provider value={state}>
      <AppDispatchContextObj.Provider value={dispatch}>{children}</AppDispatchContextObj.Provider>
    </AppStateContextObj.Provider>
  );
}
