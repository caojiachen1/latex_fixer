import { useCallback } from 'react';
import { createLLMClient } from '../services/llm/llmClientFactory';
import { validateLatexString } from '../services/latex/validator';
import { wrapWithDelimiters } from '../utils/markdown';
import { useDocumentStore } from '../stores/documentStore';
import { useUIStore } from '../stores/uiStore';
import type { Formula, FormulaFix } from '../services/latex/types';

export function useLLMFix() {
  const addFix = useDocumentStore((s) => s.addFix);
  const originalContent = useDocumentStore((s) => s.originalContent);
  const addFixingFormula = useUIStore((s) => s.addFixingFormula);
  const removeFixingFormula = useUIStore((s) => s.removeFixingFormula);

  const fixFormula = useCallback(
    async (formula: Formula) => {
      addFixingFormula(formula.id);

      try {
        const client = createLLMClient();

        // Get surrounding context (up to 200 chars before and after)
        const contextStart = Math.max(0, formula.startOffset - 200);
        const contextEnd = Math.min(
          originalContent.length,
          formula.endOffset + 200
        );
        const context = originalContent.slice(contextStart, contextEnd);

        const response = await client.fixFormula({
          originalLatex: formula.raw,
          errorMessage: formula.errorMessage || 'Unknown error',
          context,
          delimiterType: formula.delimiterType,
        });

        // Re-validate the fix with KaTeX
        const displayMode =
          formula.delimiterType === 'block-dollar' ||
          formula.delimiterType === 'block-bracket';
        const validation = validateLatexString(response.fixedLatex, displayMode);

        const fix: FormulaFix = {
          formulaId: formula.id,
          originalRaw: formula.raw,
          fixedRaw: response.fixedLatex,
          fixedWithDelimiters: wrapWithDelimiters(
            response.fixedLatex,
            formula.delimiterType
          ),
          fixedIsValid: validation.isValid,
          fixedErrorMessage: validation.errorMessage,
          status: 'pending',
          llmProvider: client.providerName,
          llmModel: response.model,
        };

        addFix(formula.id, fix);
      } catch (err) {
        console.error('LLM fix failed:', err);
        throw err;
      } finally {
        removeFixingFormula(formula.id);
      }
    },
    [addFix, originalContent, addFixingFormula, removeFixingFormula]
  );

  const fixAllFormulas = useCallback(
    async (formulas: Formula[]) => {
      for (const formula of formulas) {
        try {
          await fixFormula(formula);
        } catch {
          // Continue fixing other formulas even if one fails
        }
      }
    },
    [fixFormula]
  );

  return { fixFormula, fixAllFormulas };
}
