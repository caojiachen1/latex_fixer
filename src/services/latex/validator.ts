import katex from 'katex';
import type { Formula } from './types';

export function validateFormula(formula: Formula): Formula {
  const displayMode =
    formula.delimiterType === 'block-dollar' ||
    formula.delimiterType === 'block-bracket';

  try {
    katex.renderToString(formula.raw, {
      throwOnError: true,
      displayMode,
    });
    return { ...formula, isValid: true, errorMessage: null };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return { ...formula, isValid: false, errorMessage: message };
  }
}

export function validateAllFormulas(formulas: Formula[]): Formula[] {
  return formulas.map(validateFormula);
}

export function validateLatexString(
  latex: string,
  displayMode: boolean = false
): { isValid: boolean; errorMessage: string | null; html: string | null } {
  try {
    const html = katex.renderToString(latex, {
      throwOnError: true,
      displayMode,
    });
    return { isValid: true, errorMessage: null, html };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return { isValid: false, errorMessage: message, html: null };
  }
}
