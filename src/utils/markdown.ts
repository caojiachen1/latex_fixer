import type { Formula, FormulaFix, DelimiterType } from '../services/latex/types';

/**
 * Build the fixed formula string with its original delimiters.
 */
export function wrapWithDelimiters(fixedRaw: string, delimiterType: DelimiterType): string {
  switch (delimiterType) {
    case 'inline-dollar':
      return `$${fixedRaw}$`;
    case 'block-dollar':
      return `$$${fixedRaw}$$`;
    case 'inline-paren':
      return `\\(${fixedRaw}\\)`;
    case 'block-bracket':
      return `\\[${fixedRaw}\\]`;
  }
}

/**
 * Apply accepted fixes to the original markdown content.
 * Processes from last offset to first to preserve positions.
 */
export function applyFixes(
  originalContent: string,
  errors: Formula[],
  fixes: Record<string, FormulaFix>
): string {
  const acceptedFixes: { formula: Formula; fix: FormulaFix }[] = [];

  for (const error of errors) {
    const fix = fixes[error.id];
    if (fix && fix.status === 'accepted') {
      acceptedFixes.push({ formula: error, fix });
    }
  }

  // Sort by offset descending
  acceptedFixes.sort((a, b) => b.formula.startOffset - a.formula.startOffset);

  let content = originalContent;
  for (const { formula, fix } of acceptedFixes) {
    content =
      content.slice(0, formula.startOffset) +
      fix.fixedWithDelimiters +
      content.slice(formula.endOffset);
  }

  return content;
}

/**
 * Generate a default output file name from the input path.
 */
export function getOutputFileName(inputPath: string): string {
  const lastDot = inputPath.lastIndexOf('.');
  const lastSlash = Math.max(inputPath.lastIndexOf('/'), inputPath.lastIndexOf('\\'));
  if (lastDot > lastSlash) {
    return inputPath.slice(0, lastDot) + '_fixed' + inputPath.slice(lastDot);
  }
  return inputPath + '_fixed';
}
