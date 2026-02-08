import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LLMProvider } from '../services/llm/llmClientFactory';

interface SettingsState {
  // LLM provider selection
  llmProvider: LLMProvider;

  // LM Studio
  lmStudioUrl: string;
  lmStudioModel: string;

  // Ollama
  ollamaUrl: string;
  ollamaModel: string;

  // OpenAI
  openaiBaseUrl: string;
  openaiApiKey: string;
  openaiModel: string;

  // UI
  theme: 'light' | 'dark';

  // Actions
  setLLMProvider: (provider: LLMProvider) => void;
  updateSettings: (partial: Partial<Omit<SettingsState, 'setLLMProvider' | 'updateSettings' | 'toggleTheme'>>) => void;
  toggleTheme: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      llmProvider: 'openai',

      lmStudioUrl: 'http://localhost:1234',
      lmStudioModel: '',

      ollamaUrl: 'http://localhost:11434',
      ollamaModel: '',

      openaiBaseUrl: 'https://api.openai.com',
      openaiApiKey: '',
      openaiModel: 'gpt-4o',

      theme: 'light',

      setLLMProvider: (provider) => set({ llmProvider: provider }),
      updateSettings: (partial) => set(partial),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
    }),
    {
      name: 'latex-fixer-settings',
      partialize: (state) => ({
        llmProvider: state.llmProvider,
        lmStudioUrl: state.lmStudioUrl,
        lmStudioModel: state.lmStudioModel,
        ollamaUrl: state.ollamaUrl,
        ollamaModel: state.ollamaModel,
        openaiBaseUrl: state.openaiBaseUrl,
        openaiApiKey: state.openaiApiKey,
        openaiModel: state.openaiModel,
        theme: state.theme,
      }),
    }
  )
);
