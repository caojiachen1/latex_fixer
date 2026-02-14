import { useEffect, useCallback } from 'react';
import { listen } from '@tauri-apps/api/event';
import { readMarkdownFile, getStartupArgs } from './services/tauri/commands';
import { AppShell } from './components/layout/AppShell';
import { useDocumentStore } from './stores/documentStore';
import { useUIStore } from './stores/uiStore';
import { useLatexParser } from './hooks/useLatexParser';
import { useFileOperations } from './hooks/useFileOperations';
import { getCurrentWindow } from '@tauri-apps/api/window';

function App() {
  const originalContent = useDocumentStore((s) => s.originalContent);
  const loadDocument = useDocumentStore((s) => s.loadDocument);
  const filePath = useDocumentStore((s) => s.filePath);
  const applyAcceptedFixes = useDocumentStore((s) => s.applyAcceptedFixes);
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen);
  const setLoading = useUIStore((s) => s.setLoading);
  const { parseAndValidate } = useLatexParser();
  const { openFile, exportFile } = useFileOperations();

  // Handle window dragging and double click to maximize
  useEffect(() => {
    const appWindow = getCurrentWindow();
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if clicked in the title bar area and not on any buttons or menus
      const isTitleBar = target.closest('.title-bar');
      const isButton = target.closest('.window-control-button') || 
                       target.closest('.menu-button') || 
                       target.closest('.panel-toggle-button');

      if (isTitleBar && !isButton) {
        // If double-click (detail === 2), toggle maximize state
        if (e.detail === 2) {
          appWindow.toggleMaximize();
        } else {
          // Otherwise start dragging
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

  // Listen for files passed from the OS (e.g., when a user drags a file onto the exe)
  useEffect(() => {
    let unlisten: (() => void) | undefined;
    (async () => {
      // `listen` returns an UnlistenFn (a function) which we can call to stop listening.
      const un = await listen<string>('open-file', async (event) => {
        const path = event.payload;
        if (!path) return;
        try {
          setLoading(true, 'Loading file...');
          const file = await readMarkdownFile(path);
          loadDocument(file.path, file.content);
        } catch (err) {
          console.error('Failed to open file from OS:', err);
        } finally {
          setLoading(false);
        }
      });

      unlisten = un;
    })();

    return () => {
      if (unlisten) {
        try {
          unlisten();
        } catch {}
      }
    };
  }, [loadDocument, setLoading]);

  // On startup, explicitly ask backend for any startup args in case events were emitted before listener attached
  useEffect(() => {
    (async () => {
      try {
        const args = await getStartupArgs();
        if (args && args.length > 0) {
          for (const path of args) {
            try {
              setLoading(true, 'Loading file...');
              const file = await readMarkdownFile(path);
              loadDocument(file.path, file.content);
            } catch (err) {
              console.error('Failed to open startup file:', err);
            } finally {
              setLoading(false);
            }
          }
        }
      } catch (err) {
        console.error('Failed to get startup args:', err);
      }
    })();
  }, [loadDocument, setLoading]);

  return <AppShell />;
}

export default App;
