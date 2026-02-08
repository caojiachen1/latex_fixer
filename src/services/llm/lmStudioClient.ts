import type { LLMClient, LLMConfig, FixFormulaRequest, FixFormulaResponse } from './types';
import { SYSTEM_PROMPT, buildUserPrompt } from './prompts';
import { proxyLLMRequest } from '../tauri/commands';

export class LMStudioClient implements LLMClient {
  readonly providerName = 'LM Studio';

  constructor(private config: LLMConfig) {}

  async fixFormula(request: FixFormulaRequest): Promise<FixFormulaResponse> {
    const body = JSON.stringify({
      model: this.config.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: buildUserPrompt(
            request.originalLatex,
            request.errorMessage,
            request.context
          ),
        },
      ],
      temperature: 0.2,
      max_tokens: 512,
    });

    const responseText = await proxyLLMRequest(
      `${this.config.baseUrl}/v1/chat/completions`,
      'POST',
      body,
      { 'Content-Type': 'application/json' }
    );

    const data = JSON.parse(responseText);
    return {
      fixedLatex: cleanLLMOutput(data.choices[0].message.content),
      model: data.model ?? this.config.model,
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      await proxyLLMRequest(
        `${this.config.baseUrl}/v1/models`,
        'GET'
      );
      return true;
    } catch {
      return false;
    }
  }
}

function cleanLLMOutput(text: string): string {
  let cleaned = text.trim();
  // Remove markdown code fences if LLM wraps in ```
  cleaned = cleaned.replace(/^```(?:latex|tex)?\n?/i, '').replace(/\n?```$/i, '');
  // Remove surrounding delimiters if LLM includes them
  cleaned = cleaned.replace(/^\$\$\s*/, '').replace(/\s*\$\$$/, '');
  cleaned = cleaned.replace(/^\$\s*/, '').replace(/\s*\$$/, '');
  cleaned = cleaned.replace(/^\\\(\s*/, '').replace(/\s*\\\)$/, '');
  cleaned = cleaned.replace(/^\\\[\s*/, '').replace(/\s*\\\]$/, '');
  return cleaned.trim();
}
