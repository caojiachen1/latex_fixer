import { useEffect, useCallback } from 'react';
import { AppShell } from './components/layout/AppShell';
import { useDocumentStore } from './stores/documentStore';
import { useUIStore } from './stores/uiStore';
import { useLatexParser } from './hooks/useLatexParser';
import { useFileOperations } from './hooks/useFileOperations';

function App() {
  const originalContent = useDocumentStore((s) => s.originalContent);
  const filePath = useDocumentStore((s) => s.filePath);
  const applyAcceptedFixes = useDocumentStore((s) => s.applyAcceptedFixes);
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen);
  const { parseAndValidate } = useLatexParser();
  const { openFile, exportFile } = useFileOperations();

  // Auto-parse when content is loaded
  useEffect(() => {
    if (originalContent) {
      parseAndValidate();
    }
  }, [originalContent, parseAndValidate]);

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

  return <AppShell />;
}

export default App;
