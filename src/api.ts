// api.ts - Tauri API 调用封装
import { invoke } from '@tauri-apps/api/core';
import type { AppConfig, ApiResponse, ConnectivityTestResult } from './types';

export async function readHostsFile(): Promise<string> {
  const response: ApiResponse<string> = await invoke('read_hosts_file');
  if (!response.success) {
    throw new Error(response.error || '读取 hosts 文件失败');
  }
  return response.data || '';
}

export async function getConfig(): Promise<AppConfig> {
  const response: ApiResponse<AppConfig> = await invoke('get_config');
  if (!response.success) {
    throw new Error(response.error || '获取配置失败');
  }
  return response.data!;
}

export async function saveConfig(config: AppConfig): Promise<void> {
  const response: ApiResponse<void> = await invoke('save_config', { newConfig: config });
  if (!response.success) {
    throw new Error(response.error || '保存配置失败');
  }
}

export async function updateHosts(): Promise<string> {
  const response: ApiResponse<string> = await invoke('update_hosts');
  if (!response.success) {
    throw new Error(response.error || '更新 hosts 失败');
  }
  return response.data || '';
}

export async function backupHostsFile(): Promise<string> {
  const response: ApiResponse<string> = await invoke('backup_hosts_file');
  if (!response.success) {
    throw new Error(response.error || '备份 hosts 文件失败');
  }
  return response.data || '';
}

export async function testSource(url: string): Promise<string> {
  const response: ApiResponse<string> = await invoke('test_source', { url });
  if (!response.success) {
    throw new Error(response.error || '测试订阅源失败');
  }
  return response.data || '';
}

export async function testConnectivity(domain: string): Promise<ConnectivityTestResult> {
  const response: ApiResponse<ConnectivityTestResult> = await invoke('test_connectivity', { domain });
  if (!response.success) {
    throw new Error(response.error || '测试域名连通性失败');
  }
  return response.data!;
}

export async function testMultipleConnectivity(domains: string[]): Promise<ConnectivityTestResult[]> {
  const response: ApiResponse<ConnectivityTestResult[]> = await invoke('test_multiple_connectivity', { domains });
  if (!response.success) {
    throw new Error(response.error || '批量测试域名连通性失败');
  }
  return response.data!;
}

export async function testHostsConnectivity(hostsContent: string): Promise<ConnectivityTestResult[]> {
  const response: ApiResponse<ConnectivityTestResult[]> = await invoke('test_hosts_connectivity', { hostsContent });
  if (!response.success) {
    throw new Error(response.error || '测试 hosts 连通性失败');
  }
  return response.data!;
}