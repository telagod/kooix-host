// Settings.tsx - 设置页面（完整功能）
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Moon, Sun, Info, Clock } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAutoUpdate } from '@/hooks/useAutoUpdate';

export function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { enabled, intervalHours, lastUpdate, setEnabled, setIntervalHours } = useAutoUpdate();

  return (
    <div className="space-y-4">
      {/* 主题设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="w-5 h-5" />
            外观主题
          </CardTitle>
          <CardDescription>选择您喜欢的界面主题</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => theme === 'dark' && toggleTheme()}
              className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                theme === 'light'
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border hover:border-border/60'
              }`}
            >
              <Sun className="w-8 h-8 mx-auto mb-3" />
              <div className="text-base font-semibold">浅色模式</div>
              <div className="text-xs text-muted-foreground mt-1">清爽明亮</div>
            </button>

            <button
              onClick={() => theme === 'light' && toggleTheme()}
              className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                theme === 'dark'
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border hover:border-border/60'
              }`}
            >
              <Moon className="w-8 h-8 mx-auto mb-3" />
              <div className="text-base font-semibold">深色模式</div>
              <div className="text-xs text-muted-foreground mt-1">护眼舒适</div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 自动更新设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            自动更新
          </CardTitle>
          <CardDescription>配置定时自动同步订阅源</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 启用开关 */}
          <div className="flex items-center justify-between p-4 rounded-xl border-2 bg-card">
            <div>
              <div className="font-semibold">启用自动更新</div>
              <div className="text-sm text-muted-foreground mt-1">
                后台定时自动同步订阅源
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* 更新间隔 */}
          {enabled && (
            <div className="space-y-3 animate-in">
              <label className="text-sm font-medium">更新间隔（小时）</label>
              <Input
                type="number"
                min="1"
                max="168"
                value={intervalHours}
                onChange={(e) => setIntervalHours(parseInt(e.target.value, 10) || 24)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                建议设置为 12-24 小时，避免过于频繁
              </p>
            </div>
          )}

          {/* 上次更新时间 */}
          {lastUpdate && (
            <div className="p-4 rounded-xl bg-muted/50 animate-in">
              <div className="text-sm font-medium mb-1">上次自动更新</div>
              <div className="text-sm text-muted-foreground">
                {lastUpdate.toLocaleString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 关于信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            关于
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium mb-1 text-muted-foreground">应用名称</div>
              <div className="font-semibold">Kooix Host Manager</div>
            </div>
            <div>
              <div className="text-sm font-medium mb-1 text-muted-foreground">版本</div>
              <div className="font-semibold">v0.1.0</div>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-2 text-muted-foreground">技术栈</div>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary">Tauri 2.0</Badge>
              <Badge variant="secondary">React 19</Badge>
              <Badge variant="secondary">TypeScript</Badge>
              <Badge variant="secondary">Rust</Badge>
              <Badge variant="secondary">Tailwind CSS</Badge>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-2 text-muted-foreground">描述</div>
            <div className="text-sm leading-relaxed">
              轻量化全平台 Hosts 多源聚合订阅更新工具，支持 Windows、macOS 和 Linux。
              简洁美观的现代化界面设计，专业可靠的后端架构。
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}