import { useState, useEffect } from 'react';
import { LayoutDashboard, Database, FileEdit, Settings as SettingsIcon, Moon, Sun } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { ThemeProvider } from './contexts/ThemeContext';
import { useTheme } from '@/hooks/useTheme';
import { AutoUpdateProvider } from './contexts/AutoUpdateContext';
import { getConfig } from './api';
import type { AppConfig } from './types';
import { Dashboard } from './pages/Dashboard';
import { Sources } from './pages/Sources';
import { Editor } from './pages/Editor';
import { Settings } from './pages/Settings';
import './App.css';

type TabValue = 'dashboard' | 'sources' | 'editor' | 'settings';

function AppContent() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>('dashboard');
  const { theme, toggleTheme } = useTheme();

  const loadConfig = async () => {
    try {
      const cfg = await getConfig();
      setConfig(cfg);
    } catch (error) {
      console.error('加载配置失败:', error);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleConfigChange = () => {
    loadConfig();
  };

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col px-4 sm:px-6 py-4">
        {/* 顶部标题栏 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Kooix Host Manager
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">轻量化跨平台 Hosts 管理工具</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-green-100 text-green-800 text-xs font-medium dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800">
              ● 运行中
            </div>
            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="icon"
              className="btn-flat rounded-full"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* 导航标签页 */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)} className="flex-1 flex flex-col">
          <TabsList className="w-full grid grid-cols-4 mb-6 h-10 sm:h-11 bg-muted/50">
            <TabsTrigger
              value="dashboard"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-background"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">仪表盘</span>
            </TabsTrigger>
            <TabsTrigger
              value="sources"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-background"
            >
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">订阅源</span>
            </TabsTrigger>
            <TabsTrigger
              value="editor"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-background"
            >
              <FileEdit className="w-4 h-4" />
              <span className="hidden sm:inline">编辑器</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-background"
            >
              <SettingsIcon className="w-4 h-4" />
              <span className="hidden sm:inline">设置</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
            <TabsContent value="dashboard" className="mt-0 h-full">
              {activeTab === 'dashboard' && (
                <Dashboard config={config} onConfigChange={handleConfigChange} />
              )}
            </TabsContent>

            <TabsContent value="sources" className="mt-0 h-full">
              {activeTab === 'sources' && (
                <Sources config={config} onConfigChange={handleConfigChange} />
              )}
            </TabsContent>

            <TabsContent value="editor" className="mt-0 h-full">
              {activeTab === 'editor' && <Editor />}
            </TabsContent>

            <TabsContent value="settings" className="mt-0 h-full">
              {activeTab === 'settings' && <Settings />}
            </TabsContent>
          </div>
        </Tabs>

        {/* 页脚 */}
        <div className="mt-6 pt-4 border-t text-center text-xs text-muted-foreground">
          <p>Powered by Tauri + React · v0.1.0</p>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AutoUpdateProvider>
        <AppContent />
      </AutoUpdateProvider>
    </ThemeProvider>
  );
}

export default App;