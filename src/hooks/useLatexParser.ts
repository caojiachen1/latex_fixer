import { useCallback } from 'react';
import { extractFormulas } from '../services/latex/parser';
import { validateAllFormulas } from '../services/latex/validator';
import { useDocumentStore } from '../stores/documentStore';

export function useLatexParser() {
  const originalContent = useDocumentStore((s) => s.originalContent);
  const setFormulas = useDocumentStore((s) => s.setFormulas);
  const loadId = useDocumentStore((s) => s.loadId);

  const parseAndValidate = useCallback(() => {
    if (!originalContent) return;

    const extracted = extractFormulas(originalContent);
    const validated = validateAllFormulas(extracted);
    setFormulas(validated);
  }, [loadId, originalContent, setFormulas]);

  return { parseAndValidate };
}
