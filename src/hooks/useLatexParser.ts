import { useCallback } from 'react';
import { extractFormulas } from '../services/tauri/commands';
import { validateAllFormulas } from '../services/latex/validator';
import { useDocumentStore } from '../stores/documentStore';

export function useLatexParser() {
  const originalContent = useDocumentStore((s) => s.originalContent);
  const setFormulas = useDocumentStore((s) => s.setFormulas);
  const loadId = useDocumentStore((s) => s.loadId);

  const parseAndValidate = useCallback(async () => {
    if (!originalContent) return;

    const extracted = await extractFormulas(originalContent);
    const validated = validateAllFormulas(extracted);
    setFormulas(validated);
  }, [loadId, originalContent, setFormulas]);

  return { parseAndValidate };
}
