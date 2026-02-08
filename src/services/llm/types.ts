export interface LLMClient {
  readonly providerName: string;
  fixFormula(request: FixFormulaRequest): Promise<FixFormulaResponse>;
  testConnection(): Promise<boolean>;
  listModels(): Promise<string[]>;
}

export interface FixFormulaRequest {
  originalLatex: string;
  errorMessage: string;
  context?: string;
  delimiterType: string;
}

export interface FixFormulaResponse {
  fixedLatex: string;
  explanation?: string;
  model: string;
}

export interface LLMConfig {
  baseUrl: string;
  apiKey?: string;
  model: string;
}
