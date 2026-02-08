import type { LLMClient } from './types';
import { LMStudioClient } from './lmStudioClient';
import { OllamaClient } from './ollamaClient';
import { OpenAIClient } from './openaiClient';
import { useSettingsStore } from '../../stores/settingsStore';

export type LLMProvider = 'lm-studio' | 'ollama' | 'openai';

export function createLLMClient(): LLMClient {
  const settings = useSettingsStore.getState();

  switch (settings.llmProvider) {
    case 'lm-studio':
      return new LMStudioClient({
        baseUrl: settings.lmStudioUrl,
        model: settings.lmStudioModel,
      });
    case 'ollama':
      return new OllamaClient({
        baseUrl: settings.ollamaUrl,
        model: settings.ollamaModel,
      });
    case 'openai':
      return new OpenAIClient({
        baseUrl: settings.openaiBaseUrl,
        apiKey: settings.openaiApiKey,
        model: settings.openaiModel,
      });
  }
}
