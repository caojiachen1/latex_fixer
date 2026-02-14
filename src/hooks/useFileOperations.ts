import { useCallback } from 'react';
import { open, save } from '@tauri-apps/plugin-dialog';
import { readMarkdownFile, writeMarkdownFile } from '../services/tauri/commands';
import { useDocumentStore } from '../stores/documentStore';
import { useUIStore } from '../stores/uiStore';

export function useFileOperations() {
  const loadDocument = useDocumentStore((s) => s.loadDocument);
  const filePath = useDocumentStore((s) => s.filePath);
  const applyAcceptedFixes = useDocumentStore((s) => s.applyAcceptedFixes);
  const setLoading = useUIStore((s) => s.setLoading);

  const openFile = useCallback(async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: 'Markdown',
            extensions: ['md', 'mdx', 'markdown'],
          },
        ],
      });

      if (!selected) return;

      const path = selected;
      setLoading(true, 'Loading file...');
      const file = await readMarkdownFile(path);
      loadDocument(file.path, file.content);
    } catch (err) {
      console.error('Failed to open file:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadDocument, setLoading]);

  const exportFile = useCallback(async () => {
    if (!filePath) return;

    try {
      const defaultName = filePath.replace(/(\.\w+)$/, '_fixed$1');
      const savePath = await save({
        defaultPath: defaultName,
        filters: [
          {
            name: 'Markdown',
            extensions: ['md', 'mdx', 'markdown'],
          },
        ],
      });

      if (!savePath) return;

      setLoading(true, 'Exporting...');
      applyAcceptedFixes();
      // Read latest content from the store at call time to avoid stale closure values
      const content = useDocumentStore.getState().currentContent;
      await writeMarkdownFile(savePath, content);
    } catch (err) {
      console.error('Failed to export file:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filePath, setLoading, applyAcceptedFixes]);

  return { openFile, exportFile };
}
