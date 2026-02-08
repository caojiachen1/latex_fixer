export type DelimiterType = 'inline-dollar' | 'block-dollar' | 'inline-paren' | 'block-bracket';

export interface Formula {
  id: string;
  raw: string;
  rawWithDelimiters: string;
  delimiterType: DelimiterType;
  startOffset: number;
  endOffset: number;
  lineNumber: number;
  isValid: boolean;
  errorMessage: string | null;
}

export type FixStatus = 'pending' | 'accepted' | 'rejected';

export interface FormulaFix {
  formulaId: string;
  originalRaw: string;
  fixedRaw: string;
  fixedWithDelimiters: string;
  fixedIsValid: boolean;
  fixedErrorMessage: string | null;
  status: FixStatus;
  llmProvider: string;
  llmModel: string;
}
