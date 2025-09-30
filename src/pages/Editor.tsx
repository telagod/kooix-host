// Editor.tsx - Hosts 文件编辑器页面（原生App风格）
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Save, RotateCcw, FileText, AlertCircle, X } from 'lucide-react';
import { readHostsFile } from '@/api';
import { useTheme } from '@/hooks/useTheme';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode';

export function Editor() {
  const { theme } = useTheme();
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showWarning, setShowWarning] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const showMessage = (type: 'success' | 'error' | 'warning', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const loadHostsFile = async () => {
    setLoading(true);
    try {
      const hostsContent = await readHostsFile();
      setContent(hostsContent);
      setOriginalContent(hostsContent);
      setHasChanges(false);
    } catch (error) {
      showMessage('error', `❌ 读取失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHostsFile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setHasChanges(content !== originalContent);
  }, [content, originalContent]);

  const handleSave = async () => {
    setSaving(true);
    try {
      showMessage('warning', '⚠️ 直接保存功能暂未实现，请使用"更新 Hosts"功能');
    } catch (error) {
      showMessage('error', `❌ 保存失败: ${error}`);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('确定要放弃所有更改吗？')) {
      setContent(originalContent);
      showMessage('success', '✅ 已恢复到原始内容');
    }
  };

  const handleReload = () => {
    if (hasChanges) {
      if (!confirm('当前有未保存的更改，确定要重新加载吗？')) {
        return;
      }
    }
    loadHostsFile();
    showMessage('success', '✅ 已重新加载');
  };

  const lineCount = content.split('\n').length;

  return (
    <div className="space-y-4">
      {/* 消息提示 */}
      {message && (
        <div
          className={`p-4 rounded-xl border-2 animate-in slide-in-from-top duration-300 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-900 border-green-200 dark:bg-green-950/50 dark:text-green-100 dark:border-green-800'
              : message.type === 'warning'
              ? 'bg-yellow-50 text-yellow-900 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-100 dark:border-yellow-800'
              : 'bg-red-50 text-red-900 border-red-200 dark:bg-red-950/50 dark:text-red-100 dark:border-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 工具栏 */}
      <div className="flex items-center justify-between p-4 bg-card rounded-xl border-2">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-primary" />
          <div>
            <div className="font-semibold text-sm">Hosts 文件</div>
            <div className="text-xs text-muted-foreground">
              {lineCount} 行{hasChanges && <span className="text-orange-500 ml-2">• 未保存</span>}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleReload} variant="ghost" size="sm" disabled={loading} className="btn-flat">
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button onClick={handleReset} variant="ghost" size="sm" disabled={!hasChanges || loading} className="btn-flat">
            恢复
          </Button>
          <Button onClick={handleSave} size="sm" disabled={!hasChanges || loading || saving} className="btn-flat">
            <Save className="w-4 h-4 mr-2" />
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>

      {/* 警告提示 */}
      {showWarning && (
        <div className="flex gap-3 p-4 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/50 relative">
          <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-orange-800 dark:text-orange-200 flex-1">
            <strong>注意:</strong>直接编辑 hosts 文件需要谨慎操作。错误的配置可能导致网络问题。建议在修改前先备份文件。
          </div>
          <button
            onClick={() => setShowWarning(false)}
            className="text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded p-1 transition-colors"
            aria-label="关闭警告"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 编辑器容器 */}
      <Card className="overflow-hidden border-2">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RotateCcw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">加载中...</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <CodeMirror
              value={content}
              onChange={(value) => setContent(value)}
              height="calc(100vh - 350px)"
              minHeight="450px"
              theme={theme === 'dark' ? vscodeDark : vscodeLight}
              extensions={[EditorView.lineWrapping]}
              basicSetup={{
                lineNumbers: true,
                highlightActiveLineGutter: true,
                highlightActiveLine: true,
                foldGutter: false,
                dropCursor: true,
                indentOnInput: false,
                bracketMatching: false,
                closeBrackets: false,
                autocompletion: false,
                rectangularSelection: true,
                highlightSelectionMatches: false,
                syntaxHighlighting: false,
              }}
              className="text-sm font-mono custom-scrollbar"
              style={{
                fontSize: '13px',
                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "Courier New", monospace',
              }}
            />
          </div>
        )}
      </Card>

      {/* 底部提示 */}
      <div className="text-xs text-muted-foreground text-center">
        编辑器使用 Ctrl/Cmd + F 搜索 · Ctrl/Cmd + S 保存
      </div>
    </div>
  );
}