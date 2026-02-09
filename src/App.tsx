import { useEffect, useCallback } from 'react';
import { AppShell } from './components/layout/AppShell';
import { useDocumentStore } from './stores/documentStore';
import { useUIStore } from './stores/uiStore';
import { useLatexParser } from './hooks/useLatexParser';
import { useFileOperations } from './hooks/useFileOperations';
import { getCurrentWindow } from '@tauri-apps/api/window';

function App() {
  const originalContent = useDocumentStore((s) => s.originalContent);
  const filePath = useDocumentStore((s) => s.filePath);
  const applyAcceptedFixes = useDocumentStore((s) => s.applyAcceptedFixes);
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen);
  const { parseAndValidate } = useLatexParser();
  const { openFile, exportFile } = useFileOperations();

  // Handle window dragging and double click to maximize
  useEffect(() => {
    const appWindow = getCurrentWindow();
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // 检查是否点击在标题栏区域，且不在任何按钮或菜单上
      const isTitleBar = target.closest('.title-bar');
      const isButton = target.closest('.window-control-button') || 
                       target.closest('.menu-button') || 
                       target.closest('.panel-toggle-button');

      if (isTitleBar && !isButton) {
        // 如果是双击 (detail === 2)，切换最大化状态
        if (e.detail === 2) {
          appWindow.toggleMaximize();
        } else {
          // 否则开始拖拽
          appWindow.startDragging();
        }
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    return () => window.removeEventListener('mousedown', handleMouseDown);
  }, []);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;

      switch (e.key.toLowerCase()) {
        case 'o':
          e.preventDefault();
          openFile();
          break;
        case 's':
          if (filePath) {
            e.preventDefault();
            applyAcceptedFixes();
            setTimeout(() => exportFile(), 50);
          }
          break;
        case ',':
          e.preventDefault();
          setSettingsOpen(true);
          break;
      }
    },
    [openFile, exportFile, filePath, applyAcceptedFixes, setSettingsOpen]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Auto-parse when content is loaded
  useEffect(() => {
    if (originalContent) {
      parseAndValidate();
    }
  }, [originalContent, parseAndValidate]);

  return <AppShell />;
}

export default App;
