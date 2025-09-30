// useAutoUpdate.ts - 自动更新 Hook
import { useContext } from 'react';
import { AutoUpdateContext } from '@/contexts/AutoUpdateContext';

export function useAutoUpdate() {
  const context = useContext(AutoUpdateContext);
  if (context === undefined) {
    throw new Error('useAutoUpdate must be used within AutoUpdateProvider');
  }
  return context;
}