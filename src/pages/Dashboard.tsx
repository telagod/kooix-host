// Dashboard.tsx - 仪表盘页面
import { useState } from 'react';
import { RefreshCw, Save, AlertCircle, Activity, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { updateHosts, backupHostsFile, readHostsFile, testHostsConnectivity } from '@/api';
import type { AppConfig, ConnectivityTestResult } from '@/types';

interface DashboardProps {
  config: AppConfig | null;
  onConfigChange: () => void;
}

export function Dashboard({ config, onConfigChange }: DashboardProps) {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<ConnectivityTestResult[] | null>(null);
  const [testResultsExpanded, setTestResultsExpanded] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleUpdateHosts = async () => {
    setLoading(true);
    try {
      await updateHosts();
      showMessage('success', '✨ 更新 Hosts 成功！');
      onConfigChange();
    } catch (error) {
      showMessage('error', `❌ 更新失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    try {
      const result = await backupHostsFile();
      showMessage('success', `💾 ${result}`);
    } catch (error) {
      showMessage('error', `❌ 备份失败: ${error}`);
    }
  };

  const handleTestConnectivity = async () => {
    setTesting(true);
    setTestResults(null);
    setTestResultsExpanded(true);
    try {
      showMessage('success', '📡 正在读取 hosts 文件...');
      const hostsContent = await readHostsFile();

      showMessage('success', '🔍 正在提取关键域名...');
      const results = await testHostsConnectivity(hostsContent);

      setTestResults(results);
      const successCount = results.filter((r) => r.success).length;
      const totalCount = results.length;

      if (successCount === totalCount) {
        showMessage('success', `🎯 太棒了！所有 ${totalCount} 个域名都可以访问！`);
      } else if (successCount > 0) {
        showMessage('success', `✅ 测试完成！${successCount}/${totalCount} 个域名可访问`);
      } else {
        showMessage('error', `❌ 测试完成，但所有域名都无法访问，请检查网络连接`);
      }
    } catch (error) {
      showMessage('error', `❌ 测试失败: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  const enabledSources = config?.sources.filter((s) => s.enabled).length || 0;
  const totalSources = config?.sources.length || 0;

  return (
    <div className="space-y-4">
      {/* 消息提示 */}
      {message && (
        <div
          className={`p-3 rounded-lg border animate-in slide-in-from-top duration-300 text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-100 dark:border-green-800'
              : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-100 dark:border-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 状态统计卡片网格 */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardDescription className="text-xs">订阅源状态</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-primary">{enabledSources}</div>
              <div className="text-sm text-muted-foreground">/ {totalSources}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">已启用订阅源</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardDescription className="text-xs">上次更新</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-sm font-medium">
              {config?.last_update
                ? new Date(config.last_update).toLocaleString('zh-CN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '从未更新'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {config?.last_update
                ? `${Math.floor((Date.now() - new Date(config.last_update).getTime()) / 3600000)} 小时前`
                : '等待首次同步'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardDescription className="text-xs">自动更新</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="mb-2">
              {config?.auto_update ? (
                <Badge variant="success">已启用</Badge>
              ) : (
                <Badge variant="secondary">已禁用</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {config?.auto_update ? `每 ${config.update_interval_hours || 24} 小时` : '手动更新'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 快速操作 */}
      <Card>
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-base">快速操作</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleUpdateHosts}
              disabled={loading}
              size="default"
              className="h-12"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  正在更新...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  更新 Hosts
                </>
              )}
            </Button>
            <Button
              onClick={handleBackup}
              variant="outline"
              size="default"
              className="h-12"
            >
              <Save className="w-4 h-4 mr-2" />
              备份 Hosts
            </Button>
            <Button
              onClick={handleTestConnectivity}
              disabled={testing}
              variant="secondary"
              size="default"
              className="col-span-2 h-12"
            >
              {testing ? (
                <>
                  <Activity className="w-4 h-4 mr-2 animate-pulse" />
                  正在测试连通性...
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4 mr-2" />
                  测试域名连通性
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 启用的订阅源列表 */}
      {config && enabledSources > 0 && (
        <Card>
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-base">已启用的订阅源</CardTitle>
            <CardDescription>当前正在使用的 Hosts 订阅源</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-2">
              {config.sources
                .filter((s) => s.enabled)
                .map((source, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2.5 rounded-lg border bg-card/50"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{source.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {source.url}
                        </div>
                      </div>
                    </div>
                    <Badge variant="success" className="text-xs flex-shrink-0 ml-2">活跃</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 连通性测试结果 */}
      {testResults && testResults.length > 0 && (
        <Card>
          <CardHeader
            className="cursor-pointer hover:bg-muted/50 transition-colors pb-3 pt-4 px-4"
            onClick={() => setTestResultsExpanded(!testResultsExpanded)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <CardTitle className="text-base">域名连通性测试结果</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" className="font-mono text-xs">
                  {testResults.filter((r) => r.success).length} 成功
                </Badge>
                <Badge variant="destructive" className="font-mono text-xs">
                  {testResults.filter((r) => !r.success).length} 失败
                </Badge>
                {testResultsExpanded ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>

          {testResultsExpanded && (
            <CardContent className="pt-0 px-4 pb-4">
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left py-2 px-3 font-medium text-xs">域名</th>
                      <th className="text-center py-2 px-3 font-medium text-xs w-20">状态</th>
                      <th className="text-center py-2 px-3 font-medium text-xs w-20">响应时间</th>
                      <th className="text-center py-2 px-3 font-medium text-xs w-20">HTTP 码</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testResults.map((result, index) => (
                      <tr
                        key={index}
                        className={`border-b last:border-b-0 ${
                          result.success
                            ? 'bg-green-50/30 dark:bg-green-950/10 hover:bg-green-50/50 dark:hover:bg-green-950/20'
                            : 'bg-red-50/30 dark:bg-red-950/10 hover:bg-red-50/50 dark:hover:bg-red-950/20'
                        } transition-colors`}
                      >
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                              result.success ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            <span className="font-mono text-xs truncate">{result.domain}</span>
                          </div>
                          {result.error && (
                            <div className="text-xs text-muted-foreground mt-0.5 pl-3.5 truncate">
                              {result.error}
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {result.success ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400 mx-auto" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400 mx-auto" />
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {result.response_time_ms !== null ? (
                            <span className="font-mono text-xs">{result.response_time_ms}ms</span>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {result.status_code !== null ? (
                            <Badge
                              variant={result.success ? 'secondary' : 'destructive'}
                              className="font-mono text-xs px-1.5 py-0"
                            >
                              {result.status_code}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}