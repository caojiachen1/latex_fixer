import type { LLMClient, LLMConfig, FixFormulaRequest, FixFormulaResponse } from './types';
import { SYSTEM_PROMPT, buildUserPrompt } from './prompts';
import { proxyLLMRequest } from '../tauri/commands';

export class OllamaClient implements LLMClient {
  readonly providerName = 'Ollama';

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
      stream: false,
    });

    const responseText = await proxyLLMRequest(
      `${this.config.baseUrl}/api/chat`,
      'POST',
      body,
      { 'Content-Type': 'application/json' }
    );

    const data = JSON.parse(responseText);
    return {
      fixedLatex: cleanLLMOutput(data.message.content),
      model: data.model ?? this.config.model,
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      await proxyLLMRequest(
        `${this.config.baseUrl}/api/tags`,
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
  // Strip <think>...</think> chain-of-thought content
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  cleaned = cleaned.replace(/^```(?:latex|tex)?\n?/i, '').replace(/\n?```$/i, '');
  cleaned = cleaned.replace(/^\$\$\s*/, '').replace(/\s*\$\$$/, '');
  cleaned = cleaned.replace(/^\$\s*/, '').replace(/\s*\$$/, '');
  cleaned = cleaned.replace(/^\\\(\s*/, '').replace(/\s*\\\)$/, '');
  cleaned = cleaned.replace(/^\\\[\s*/, '').replace(/\s*\\\]$/, '');
  return cleaned.trim();
}
