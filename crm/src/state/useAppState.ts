import { useContext } from 'react';
import { AppDispatchContextObj, AppStateContextObj } from './AppStateContext';

export function useAppState() {
  const state = useContext(AppStateContextObj);
  if (!state) throw new Error('useAppState must be used within AppStateProvider');
  return state;
}

export function useAppDispatch() {
  const dispatch = useContext(AppDispatchContextObj);
  if (!dispatch) throw new Error('useAppDispatch must be used within AppStateProvider');
  return dispatch;
}
