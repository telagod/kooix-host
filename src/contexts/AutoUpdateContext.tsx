// AutoUpdateContext.tsx - 自动更新上下文
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { updateHosts } from '@/api';

interface AutoUpdateContextType {
  enabled: boolean;
  intervalHours: number;
  lastUpdate: Date | null;
  setEnabled: (enabled: boolean) => void;
  setIntervalHours: (hours: number) => void;
}

const AutoUpdateContext = createContext<AutoUpdateContextType | undefined>(undefined);

export function AutoUpdateProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(() => {
    const saved = localStorage.getItem('kooix-auto-update-enabled');
    return saved === 'true';
  });

  const [intervalHours, setIntervalHoursState] = useState(() => {
    const saved = localStorage.getItem('kooix-auto-update-interval');
    return saved ? parseInt(saved, 10) : 24;
  });

  const [lastUpdate, setLastUpdate] = useState<Date | null>(() => {
    const saved = localStorage.getItem('kooix-last-auto-update');
    return saved ? new Date(saved) : null;
  });

  const timerRef = useRef<number | null>(null);

  const setIntervalHours = (hours: number) => {
    setIntervalHoursState(hours);
    localStorage.setItem('kooix-auto-update-interval', hours.toString());
  };

  const performUpdate = async () => {
    try {
      await updateHosts();
      const now = new Date();
      setLastUpdate(now);
      localStorage.setItem('kooix-last-auto-update', now.toISOString());
      console.log('自动更新成功:', now);
    } catch (error) {
      console.error('自动更新失败:', error);
    }
  };

  useEffect(() => {
    localStorage.setItem('kooix-auto-update-enabled', enabled.toString());

    if (enabled) {
      const intervalMs = intervalHours * 60 * 60 * 1000;

      // 首次检查是否需要更新
      if (lastUpdate) {
        const timeSinceLastUpdate = Date.now() - lastUpdate.getTime();
        if (timeSinceLastUpdate >= intervalMs) {
          performUpdate();
        }
      }

      // 设置定时器
      timerRef.current = window.setInterval(() => {
        performUpdate();
      }, intervalMs);

      console.log(`自动更新已启用，间隔 ${intervalHours} 小时`);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      console.log('自动更新已禁用');
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [enabled, intervalHours]);

  return (
    <AutoUpdateContext.Provider
      value={{
        enabled,
        intervalHours,
        lastUpdate,
        setEnabled,
        setIntervalHours,
      }}
    >
      {children}
    </AutoUpdateContext.Provider>
  );
}

export function useAutoUpdate() {
  const context = useContext(AutoUpdateContext);
  if (context === undefined) {
    throw new Error('useAutoUpdate must be used within AutoUpdateProvider');
  }
  return context;
}