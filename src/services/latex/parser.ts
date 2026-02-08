import type { Formula, DelimiterType } from './types';

interface ScanState {
  inCodeBlock: boolean;
  inInlineCode: boolean;
}

export function extractFormulas(markdown: string): Formula[] {
  const formulas: Formula[] = [];
  const len = markdown.length;
  let i = 0;
  let formulaIndex = 0;
  const state: ScanState = { inCodeBlock: false, inInlineCode: false };

  while (i < len) {
    // Check for code fences (```)
    if (markdown.startsWith('```', i)) {
      if (state.inCodeBlock) {
        state.inCodeBlock = false;
        i += 3;
        continue;
      } else if (!state.inInlineCode) {
        state.inCodeBlock = true;
        i += 3;
        continue;
      }
    }

    // Skip everything inside code blocks
    if (state.inCodeBlock) {
      i++;
      continue;
    }

    // Check for inline code (`)
    if (markdown[i] === '`' && !markdown.startsWith('```', i)) {
      state.inInlineCode = !state.inInlineCode;
      i++;
      continue;
    }

    // Skip everything inside inline code
    if (state.inInlineCode) {
      i++;
      continue;
    }

    // Check for escaped characters
    if (markdown[i] === '\\' && i + 1 < len) {
      const next = markdown[i + 1];

      // \[ ... \] block formula
      if (next === '[') {
        const result = scanUntil(markdown, i + 2, '\\]');
        if (result !== null) {
          const raw = markdown.slice(i + 2, result);
          formulas.push(createFormula(
            formulaIndex++, raw, markdown.slice(i, result + 2),
            'block-bracket', i, result + 2, markdown
          ));
          i = result + 2;
          continue;
        }
      }

      // \( ... \) inline formula
      if (next === '(') {
        const result = scanUntil(markdown, i + 2, '\\)');
        if (result !== null) {
          const raw = markdown.slice(i + 2, result);
          formulas.push(createFormula(
            formulaIndex++, raw, markdown.slice(i, result + 2),
            'inline-paren', i, result + 2, markdown
          ));
          i = result + 2;
          continue;
        }
      }

      // Escaped dollar sign \$ — skip
      if (next === '$') {
        i += 2;
        continue;
      }

      // Other escaped chars
      i += 2;
      continue;
    }

    // Check for $$ (block formula) — must check before single $
    if (markdown.startsWith('$$', i)) {
      const start = i;
      const searchFrom = i + 2;
      const end = markdown.indexOf('$$', searchFrom);
      if (end !== -1) {
        const raw = markdown.slice(searchFrom, end);
        formulas.push(createFormula(
          formulaIndex++, raw, markdown.slice(start, end + 2),
          'block-dollar', start, end + 2, markdown
        ));
        i = end + 2;
        continue;
      }
    }

    // Check for single $ (inline formula)
    if (markdown[i] === '$') {
      const start = i;
      const searchFrom = i + 1;
      // Find closing $ that is not escaped
      let j = searchFrom;
      while (j < len) {
        if (markdown[j] === '$' && markdown[j - 1] !== '\\') {
          break;
        }
        j++;
      }
      if (j < len) {
        const raw = markdown.slice(searchFrom, j);
        // Skip empty formulas and things that look like currency ($5 $10)
        if (raw.length > 0 && !raw.match(/^\d/)) {
          formulas.push(createFormula(
            formulaIndex++, raw, markdown.slice(start, j + 1),
            'inline-dollar', start, j + 1, markdown
          ));
        }
        i = j + 1;
        continue;
      }
    }

    i++;
  }

  return formulas;
}

function scanUntil(text: string, from: number, delimiter: string): number | null {
  const idx = text.indexOf(delimiter, from);
  return idx === -1 ? null : idx;
}

function createFormula(
  index: number,
  raw: string,
  rawWithDelimiters: string,
  delimiterType: DelimiterType,
  startOffset: number,
  endOffset: number,
  fullText: string
): Formula {
  const lineNumber = fullText.slice(0, startOffset).split('\n').length;
  return {
    id: `formula-${index}`,
    raw: raw.trim(),
    rawWithDelimiters,
    delimiterType,
    startOffset,
    endOffset,
    lineNumber,
    isValid: true,
    errorMessage: null,
  };
}
