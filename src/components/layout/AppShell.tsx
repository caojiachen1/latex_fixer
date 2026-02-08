import React from 'react';
import { Sidebar } from './Sidebar';
import { EmptyState } from '../common/EmptyState';
import { MarkdownViewer } from '../editor/MarkdownViewer';
import { FormulaErrorList } from '../editor/FormulaErrorList';
import { StatusBar } from '../common/StatusBar';
import { LoadingOverlay } from '../common/LoadingOverlay';
import { SettingsDialog } from '../settings/SettingsDialog';
import { useDocumentStore } from '../../stores/documentStore';
import { useUIStore } from '../../stores/uiStore';

export const AppShell: React.FC = () => {
  const filePath = useDocumentStore((s) => s.filePath);
  const isLoading = useUIStore((s) => s.isLoading);
  const isSettingsOpen = useUIStore((s) => s.isSettingsOpen);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        {filePath ? (
          <>
            <div className="content-area">
              <div className="left-panel">
                <MarkdownViewer />
              </div>
              <div className="right-panel">
                <FormulaErrorList />
              </div>
            </div>
            <StatusBar />
          </>
        ) : (
          <EmptyState />
        )}
      </div>
      {isLoading && <LoadingOverlay />}
      {isSettingsOpen && <SettingsDialog />}
    </div>
  );
};
