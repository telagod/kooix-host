// types.ts - TypeScript 类型定义
export interface HostSource {
  name: string;
  url: string;
  enabled: boolean;
}

export interface AppConfig {
  sources: HostSource[];
  auto_update: boolean;
  update_interval_hours: number;
  last_update: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}