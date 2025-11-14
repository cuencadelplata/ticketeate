'use client';

import { create } from 'zustand';
import { ScannerState, ScannerStatus, ValidationResponse } from '@/types/scanner';

interface ScannerStore extends ScannerState {
  setStatus: (status: ScannerStatus) => void;
  setResult: (result?: ValidationResponse) => void;
  setError: (error?: string) => void;
  reset: () => void;
}

const initialState: ScannerState = {
  status: 'idle',
  result: undefined,
  error: undefined,
  lastScanTime: undefined,
};

export const useScannerStore = create<ScannerStore>((set) => ({
  ...initialState,
  setStatus: (status) => set({ status }),
  setResult: (result) => set({ result, status: result ? 'success' : 'idle' }),
  setError: (error) => set({ error, status: error ? 'error' : 'idle' }),
  reset: () => set(initialState),
}));
