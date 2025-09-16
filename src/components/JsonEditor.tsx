import React, { useMemo, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import type { OnMount } from '@monaco-editor/react';
import { Button, Space, message } from 'antd';

export interface JsonEditorProps {
  value: unknown;
  readOnly?: boolean;
  height?: string | number;
  className?: string;
  language?: 'json' | 'javascript';
  showToolbar?: boolean;
}

/**
 * 基于 Monaco 的 JSON 只读编辑器
 * - 默认只读
 * - 自动格式化对象为 JSON 字符串
 * - 自动布局，适应容器大小
 */
const JsonEditor: React.FC<JsonEditorProps> = ({
  value,
  readOnly = true,
  height = '100%',
  className,
  language = 'json',
  showToolbar = true,
}) => {
  const text = useMemo(() => {
    if (typeof value === 'string') return value;
    try {
      return JSON.stringify(value ?? {}, null, 2);
    } catch {
      return '{}';
    }
  }, [value]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      message.success('已复制到剪贴板');
    } catch {
      message.error('复制失败');
    }
  }, [text]);

  const handleDownload = useCallback(() => {
    try {
      const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'result.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      message.error('下载失败');
    }
  }, [text]);

  const onMount: OnMount = (_editor, monaco) => {
    // 应用 VS Code 暗色主题
    monaco.editor.setTheme('vs-dark');
    // JSON 语言服务提示（monaco 内置）
    if (language === 'json') {
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        allowComments: true,
        schemas: [],
      });
    }
  };

  return (
    <div style={{ height }} className={className}>
      {showToolbar && (
        <div className="flex items-center justify-end mb-2">
          <Space size={8}>
            <Button size="small" onClick={handleCopy}>复制 JSON</Button>
            <Button size="small" onClick={handleDownload}>下载 JSON</Button>
          </Space>
        </div>
      )}
      <Editor
        height={showToolbar ? `calc(100% - 36px)` : '100%'}
        defaultLanguage={language}
        value={text}
        onMount={onMount}
        options={{
          readOnly,
          minimap: { enabled: false },
          lineNumbers: 'on',
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          renderWhitespace: 'none',
          formatOnPaste: true,
          formatOnType: true,
          folding: true,
          bracketPairColorization: { enabled: true },
          guides: { bracketPairs: true },
          quickSuggestions: true,
          suggestOnTriggerCharacters: true,
        }}
        theme="vs-dark"
      />
    </div>
  );
};

JsonEditor.displayName = 'JsonEditor';

export default JsonEditor;
