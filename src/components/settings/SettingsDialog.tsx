import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  Input,
  Label,
  RadioGroup,
  Radio,
  Field,
  Combobox,
  Option,
  Spinner,
  MessageBar,
  MessageBarTitle,
  MessageBarBody,
  tokens,
} from '@fluentui/react-components';
import { DismissRegular, ArrowClockwiseRegular } from '@fluentui/react-icons';
import { useSettingsStore } from '../../stores/settingsStore';
import { useUIStore } from '../../stores/uiStore';
import { createLLMClient } from '../../services/llm/llmClientFactory';
import type { LLMProvider } from '../../services/llm/llmClientFactory';

export const SettingsDialog: React.FC = () => {
  const settings = useSettingsStore();
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const setLLMProvider = useSettingsStore((s) => s.setLLMProvider);
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen);

  const [testing, setTesting] = useState(false);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleFetchModels = useCallback(async () => {
    setFetchingModels(true);
    try {
      const client = createLLMClient();
      const models = await client.listModels();
      setAvailableModels(models);
    } catch (err) {
      console.error('Failed to fetch models:', err);
      setAvailableModels([]);
    } finally {
      setFetchingModels(false);
    }
  }, []);

  // Fetch models when provider changes
  React.useEffect(() => {
    // For OpenAI, only fetch if we have an API key (or if it's a custom URL that might not need one)
    if (settings.llmProvider === 'openai' && !settings.openaiApiKey && settings.openaiBaseUrl === 'https://api.openai.com') {
      setAvailableModels([]);
      return;
    }
    handleFetchModels();
  }, [settings.llmProvider, handleFetchModels, settings.openaiApiKey, settings.openaiBaseUrl, settings.ollamaUrl, settings.lmStudioUrl]);

  const handleTestConnection = useCallback(async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const client = createLLMClient();
      const ok = await client.testConnection();
      setTestResult({
        success: ok,
        message: ok
          ? `Connected to ${client.providerName} successfully!`
          : `Failed to connect to ${client.providerName}`,
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: `Connection error: ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setTesting(false);
    }
  }, []);

  return (
    <Dialog open onOpenChange={(_, data) => !data.open && setSettingsOpen(false)}>
      <DialogSurface>
        <DialogTitle
          action={
            <Button
              appearance="subtle"
              icon={<DismissRegular />}
              onClick={() => setSettingsOpen(false)}
              style={{ position: 'relative', top: '-30px' }}
            />
          }
        >
          Settings
        </DialogTitle>

        <DialogBody>
          <DialogContent>
            <div className="settings-form">
              <Field label="LLM Provider">
                <RadioGroup
                  value={settings.llmProvider}
                  onChange={(_, data) =>
                    setLLMProvider(data.value as LLMProvider)
                  }
                >
                  <Radio value="openai" label="OpenAI API" />
                  <Radio value="lm-studio" label="LM Studio" />
                  <Radio value="ollama" label="Ollama" />
                </RadioGroup>
              </Field>

              {settings.llmProvider === 'openai' && (
                <>
                  <div className="settings-field">
                    <Label htmlFor="openai-base-url">Base URL</Label>
                    <Input
                      id="openai-base-url"
                      value={settings.openaiBaseUrl}
                      onChange={(_, data) =>
                        updateSettings({ openaiBaseUrl: data.value })
                      }
                      placeholder="https://api.openai.com"
                    />
                  </div>
                  <div className="settings-field">
                    <Label htmlFor="openai-key">API Key</Label>
                    <Input
                      id="openai-key"
                      type="password"
                      value={settings.openaiApiKey}
                      onChange={(_, data) =>
                        updateSettings({ openaiApiKey: data.value })
                      }
                      placeholder="sk-..."
                    />
                  </div>
                  <div className="settings-field">
                    <Label htmlFor="openai-model">Model</Label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Combobox
                        id="openai-model"
                        value={settings.openaiModel}
                        onOptionSelect={(_, data) =>
                          updateSettings({ openaiModel: data.optionValue })
                        }
                        onChange={(e) =>
                          updateSettings({ openaiModel: e.target.value })
                        }
                        placeholder="gpt-4o"
                        style={{ flex: 1, minWidth: 'auto' }}
                      >
                        {availableModels.map((m) => (
                          <Option key={m} value={m}>
                            {m}
                          </Option>
                        ))}
                      </Combobox>
                      <Button
                        icon={fetchingModels ? <Spinner size="tiny" /> : <ArrowClockwiseRegular />}
                        onClick={handleFetchModels}
                        disabled={fetchingModels}
                        title="Refresh models"
                      />
                    </div>
                  </div>
                </>
              )}

              {settings.llmProvider === 'lm-studio' && (
                <>
                  <div className="settings-field">
                    <Label htmlFor="lms-url">Server URL</Label>
                    <Input
                      id="lms-url"
                      value={settings.lmStudioUrl}
                      onChange={(_, data) =>
                        updateSettings({ lmStudioUrl: data.value })
                      }
                      placeholder="http://localhost:1234"
                    />
                  </div>
                  <div className="settings-field">
                    <Label htmlFor="lms-model">Model</Label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Combobox
                        id="lms-model"
                        value={settings.lmStudioModel}
                        onOptionSelect={(_, data) =>
                          updateSettings({ lmStudioModel: data.optionValue })
                        }
                        onChange={(e) =>
                          updateSettings({ lmStudioModel: e.target.value })
                        }
                        placeholder="Model name"
                        style={{ flex: 1, minWidth: 'auto' }}
                      >
                        {availableModels.map((m) => (
                          <Option key={m} value={m}>
                            {m}
                          </Option>
                        ))}
                      </Combobox>
                      <Button
                        icon={fetchingModels ? <Spinner size="tiny" /> : <ArrowClockwiseRegular />}
                        onClick={handleFetchModels}
                        disabled={fetchingModels}
                        title="Refresh models"
                      />
                    </div>
                  </div>
                </>
              )}

              {settings.llmProvider === 'ollama' && (
                <>
                  <div className="settings-field">
                    <Label htmlFor="ollama-url">Server URL</Label>
                    <Input
                      id="ollama-url"
                      value={settings.ollamaUrl}
                      onChange={(_, data) =>
                        updateSettings({ ollamaUrl: data.value })
                      }
                      placeholder="http://localhost:11434"
                    />
                  </div>
                  <div className="settings-field">
                    <Label htmlFor="ollama-model">Model</Label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Combobox
                        id="ollama-model"
                        value={settings.ollamaModel}
                        onOptionSelect={(_, data) =>
                          updateSettings({ ollamaModel: data.optionValue })
                        }
                        onChange={(e) =>
                          updateSettings({ ollamaModel: e.target.value })
                        }
                        placeholder="e.g. llama3"
                        style={{ flex: 1, minWidth: 'auto' }}
                      >
                        {availableModels.map((m) => (
                          <Option key={m} value={m}>
                            {m}
                          </Option>
                        ))}
                      </Combobox>
                      <Button
                        icon={fetchingModels ? <Spinner size="tiny" /> : <ArrowClockwiseRegular />}
                        onClick={handleFetchModels}
                        disabled={fetchingModels}
                        title="Refresh models"
                      />
                    </div>
                  </div>
                </>
              )}

              <Button
                appearance="secondary"
                onClick={handleTestConnection}
                disabled={testing}
              >
                {testing ? (
                  <>
                    <Spinner size="tiny" /> Testing...
                  </>
                ) : (
                  'Test Connection'
                )}
              </Button>

              {testResult && (
                <MessageBar
                  intent={testResult.success ? 'success' : 'error'}
                  style={{ borderRadius: tokens.borderRadiusMedium }}
                >
                  <MessageBarBody>
                    <MessageBarTitle>
                      {testResult.success ? 'Success' : 'Error'}
                    </MessageBarTitle>
                    {testResult.message}
                  </MessageBarBody>
                </MessageBar>
              )}
            </div>
          </DialogContent>
        </DialogBody>
        
        <DialogActions style={{ marginTop: '20px' }}>
          <Button appearance="primary" onClick={() => setSettingsOpen(false)}>
            Done
          </Button>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
};
