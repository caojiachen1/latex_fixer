import React, { useCallback } from 'react';
import {
  Button,
  Tooltip,
  Divider,
  tokens,
} from '@fluentui/react-components';
import {
  DocumentRegular,
  ArrowExportRegular,
  SettingsRegular,
  WeatherMoonRegular,
  WeatherSunnyRegular,
  TextDescriptionRegular,
} from '@fluentui/react-icons';
import { useFileOperations } from '../../hooks/useFileOperations';
import { useDocumentStore } from '../../stores/documentStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useUIStore } from '../../stores/uiStore';

export const Sidebar: React.FC = () => {
  const { openFile, exportFile } = useFileOperations();
  const filePath = useDocumentStore((s) => s.filePath);
  const applyAcceptedFixes = useDocumentStore((s) => s.applyAcceptedFixes);
  const theme = useSettingsStore((s) => s.theme);
  const toggleTheme = useSettingsStore((s) => s.toggleTheme);
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen);
  const isMarkdownVisible = useUIStore((s) => s.isMarkdownVisible);
  const setMarkdownVisible = useUIStore((s) => s.setMarkdownVisible);


  const handleExport = useCallback(async () => {
    applyAcceptedFixes();
    // Small delay to let state update
    await new Promise((r) => setTimeout(r, 50));
    await exportFile();
  }, [applyAcceptedFixes, exportFile]);

  return (
    <div className="sidebar" style={{ backgroundColor: tokens.colorNeutralBackground2 }}>
      <h1 className="sidebar-title">LaTeX Fixer</h1>

      <Divider />

      <div className="sidebar-section">
        <Tooltip content="Open Markdown file (Ctrl+O)" relationship="label">
          <Button
            appearance="subtle"
            icon={<DocumentRegular />}
            onClick={openFile}
            style={{ justifyContent: 'flex-start' }}
          >
            Open File
          </Button>
        </Tooltip>

        <Tooltip content="Export fixed Markdown (Ctrl+S)" relationship="label">
          <Button
            appearance="subtle"
            icon={<ArrowExportRegular />}
            onClick={handleExport}
            disabled={!filePath}
            style={{ justifyContent: 'flex-start' }}
          >
            Export Fixed
          </Button>
        </Tooltip>

        <Tooltip content={isMarkdownVisible ? "Hide Markdown Viewer" : "Show Markdown Viewer"} relationship="label">
          <Button
            appearance="subtle"
            icon={<TextDescriptionRegular />}
            onClick={() => setMarkdownVisible(!isMarkdownVisible)}
            disabled={!filePath}
            style={{ 
              justifyContent: 'flex-start',
              backgroundColor: isMarkdownVisible ? tokens.colorNeutralBackground1Selected : undefined 
            }}
          >
            {isMarkdownVisible ? "Hide Editor" : "Show Editor"}
          </Button>
        </Tooltip>
      </div>

      <div className="sidebar-spacer" />

      <Divider />

      <div className="sidebar-section">
        <Tooltip content="Settings" relationship="label">
          <Button
            appearance="subtle"
            icon={<SettingsRegular />}
            onClick={() => setSettingsOpen(true)}
            style={{ justifyContent: 'flex-start' }}
          >
            Settings
          </Button>
        </Tooltip>

        <Tooltip
          content={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          relationship="label"
        >
          <Button
            appearance="subtle"
            icon={theme === 'light' ? <WeatherMoonRegular /> : <WeatherSunnyRegular />}
            onClick={toggleTheme}
            style={{ justifyContent: 'flex-start' }}
          >
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};
