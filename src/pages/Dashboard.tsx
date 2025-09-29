// Dashboard.tsx - 仪表盘页面
import { useState } from 'react';
import { RefreshCw, Save, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { updateHosts, backupHostsFile } from '@/api';
import type { AppConfig } from '@/types';

interface DashboardProps {
  config: AppConfig | null;
  onConfigChange: () => void;
}

export function Dashboard({ config, onConfigChange }: DashboardProps) {
  const [loading, setLoading] = useState(false);
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

  const enabledSources = config?.sources.filter((s) => s.enabled).length || 0;
  const totalSources = config?.sources.length || 0;

  return (
    <div className="space-y-6">
      {/* 消息提示 */}
      {message && (
        <div
          className={`p-4 rounded-lg border animate-in slide-in-from-top duration-300 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-100 dark:border-green-800'
              : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-100 dark:border-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 状态卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">订阅源状态</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enabledSources}/{totalSources}</div>
            <p className="text-xs text-muted-foreground mt-1">已启用订阅源</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">上次更新</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
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
            <p className="text-xs text-muted-foreground mt-1">最近同步时间</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">自动更新</CardTitle>
            <AlertCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {config?.auto_update ? (
                <Badge variant="success">已启用</Badge>
              ) : (
                <Badge variant="secondary">已禁用</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">定时更新状态</p>
          </CardContent>
        </Card>
      </div>

      {/* 快速操作 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">快速操作</CardTitle>
          <CardDescription>一键更新或备份您的 Hosts 文件</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleUpdateHosts}
            disabled={loading}
            size="lg"
            className="flex-1 h-20 text-base"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                正在更新...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5 mr-2" />
                更新 Hosts
              </>
            )}
          </Button>
          <Button
            onClick={handleBackup}
            variant="outline"
            size="lg"
            className="flex-1 h-20 text-base"
          >
            <Save className="w-5 h-5 mr-2" />
            备份 Hosts
          </Button>
        </CardContent>
      </Card>

      {/* 启用的订阅源列表 */}
      {config && enabledSources > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">已启用的订阅源</CardTitle>
            <CardDescription>当前正在使用的 Hosts 订阅源</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {config.sources
                .filter((s) => s.enabled)
                .map((source, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <div>
                        <div className="font-medium">{source.name}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-md">
                          {source.url}
                        </div>
                      </div>
                    </div>
                    <Badge variant="success">活跃</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}