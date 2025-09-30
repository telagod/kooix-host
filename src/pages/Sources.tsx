// Sources.tsx - 订阅源管理页面（点击展开交互）
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save, TestTube, ChevronDown, ChevronRight } from 'lucide-react';
import { saveConfig, testSource } from '@/api';
import type { AppConfig, HostSource } from '@/types';
import { useState } from 'react';

interface SourcesProps {
  config: AppConfig | null;
  onConfigChange: () => void;
}

export function Sources({ config, onConfigChange }: SourcesProps) {
  const [localConfig, setLocalConfig] = useState(config);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [testingIndex, setTestingIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleToggleSource = async (index: number) => {
    if (!localConfig) return;
    const newConfig = { ...localConfig };
    newConfig.sources[index].enabled = !newConfig.sources[index].enabled;
    setLocalConfig(newConfig);

    // 自动保存启用状态
    try {
      await saveConfig(newConfig);
      onConfigChange();
    } catch (error) {
      showMessage('error', `❌ 保存失败: ${error}`);
    }
  };

  const handleAddSource = () => {
    if (!localConfig) return;
    const newSource: HostSource = {
      name: '新订阅源',
      url: 'https://',
      enabled: false,
    };
    const newConfig = { ...localConfig };
    newConfig.sources.push(newSource);
    setLocalConfig(newConfig);
    setExpandedIndex(newConfig.sources.length - 1);
  };

  const handleDeleteSource = async (index: number) => {
    if (!localConfig) return;
    const newConfig = { ...localConfig };
    newConfig.sources.splice(index, 1);
    setLocalConfig(newConfig);

    try {
      await saveConfig(newConfig);
      onConfigChange();
      showMessage('success', '✅ 订阅源已删除');
      if (expandedIndex === index) {
        setExpandedIndex(null);
      }
    } catch (error) {
      showMessage('error', `❌ 删除失败: ${error}`);
    }
  };

  const handleSourceChange = (index: number, field: keyof HostSource, value: string) => {
    if (!localConfig) return;
    const newConfig = { ...localConfig };
    (newConfig.sources[index][field] as string) = value;
    setLocalConfig(newConfig);
  };

  const handleSaveSource = async (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _index: number
  ) => {
    if (!localConfig) return;
    try {
      await saveConfig(localConfig);
      onConfigChange();
      showMessage('success', '✅ 订阅源已保存');
    } catch (error) {
      showMessage('error', `❌ 保存失败: ${error}`);
    }
  };

  const handleTestSource = async (index: number) => {
    if (!localConfig) return;
    const source = localConfig.sources[index];
    setTestingIndex(index);
    try {
      await testSource(source.url);
      showMessage('success', `✅ 订阅源 "${source.name}" 测试成功`);
    } catch (error) {
      showMessage('error', `❌ 测试失败: ${error}`);
    } finally {
      setTestingIndex(null);
    }
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  if (!localConfig) return null;

  return (
    <div className="space-y-4">
      {/* 消息提示 */}
      {message && (
        <div
          className={`p-4 rounded-xl border-2 animate-in slide-in-from-top duration-300 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-900 border-green-200 dark:bg-green-950/50 dark:text-green-100 dark:border-green-800'
              : 'bg-red-50 text-red-900 border-red-200 dark:bg-red-950/50 dark:text-red-100 dark:border-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 顶部统计和操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-2xl font-bold">
              {localConfig.sources.length} <span className="text-sm font-normal text-muted-foreground">个订阅源</span>
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">
              已启用 {localConfig.sources.filter(s => s.enabled).length} 个
            </div>
          </div>
        </div>
        <Button onClick={handleAddSource} variant="default" className="btn-flat">
          <Plus className="w-4 h-4 mr-2" />
          添加订阅源
        </Button>
      </div>

      {/* 订阅源列表 */}
      <div className="space-y-3">
        {localConfig.sources.map((source, index) => {
          const isExpanded = expandedIndex === index;

          return (
            <Card
              key={index}
              className={`overflow-hidden transition-all duration-200 border-2 ${
                source.enabled
                  ? 'border-primary/30 shadow-sm'
                  : 'border-border hover:border-border/60'
              }`}
            >
              {/* 折叠的头部 */}
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleExpand(index)}
                    className="flex items-center gap-3 flex-1 text-left group"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground transition-transform" />
                    )}

                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={source.enabled}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleToggleSource(index);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer transition-all"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-base group-hover:text-primary transition-colors truncate">
                          {source.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate mt-0.5">
                          {source.url}
                        </div>
                      </div>

                      {source.enabled && (
                        <Badge variant="success" className="ml-auto">
                          活跃
                        </Badge>
                      )}
                    </div>
                  </button>

                  {!isExpanded && (
                    <div className="flex gap-2 ml-3">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTestSource(index);
                        }}
                        disabled={testingIndex === index}
                        variant="ghost"
                        size="sm"
                        className="btn-flat"
                      >
                        {testingIndex === index ? (
                          <TestTube className="w-4 h-4 animate-spin" />
                        ) : (
                          <TestTube className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSource(index);
                        }}
                        variant="ghost"
                        size="sm"
                        className="btn-flat text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>

              {/* 展开的编辑区域 */}
              {isExpanded && (
                <CardContent className="px-4 pb-4 space-y-4 animate-in border-t">
                  <div>
                    <label className="text-sm font-medium mb-2 block text-muted-foreground">
                      订阅源名称
                    </label>
                    <Input
                      value={source.name}
                      onChange={(e) => handleSourceChange(index, 'name', e.target.value)}
                      placeholder="订阅源名称"
                      className="font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block text-muted-foreground">
                      订阅源 URL
                    </label>
                    <Input
                      value={source.url}
                      onChange={(e) => handleSourceChange(index, 'url', e.target.value)}
                      placeholder="https://..."
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleSaveSource(index)}
                      size="sm"
                      className="btn-flat flex-1"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      保存更改
                    </Button>
                    <Button
                      onClick={() => handleTestSource(index)}
                      disabled={testingIndex === index}
                      variant="outline"
                      size="sm"
                      className="btn-flat"
                    >
                      {testingIndex === index ? (
                        <>
                          <TestTube className="w-4 h-4 mr-2 animate-spin" />
                          测试中...
                        </>
                      ) : (
                        <>
                          <TestTube className="w-4 h-4 mr-2" />
                          测试连接
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleDeleteSource(index)}
                      variant="outline"
                      size="sm"
                      className="btn-flat text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      删除
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {localConfig.sources.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground mb-4 text-center">
              还没有添加任何订阅源
              <br />
              <span className="text-sm">点击上方按钮添加第一个订阅源</span>
            </p>
            <Button onClick={handleAddSource} variant="outline" className="btn-flat">
              <Plus className="w-4 h-4 mr-2" />
              立即添加
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}