import React, { useCallback, useRef } from 'react';
import { Sidebar } from './Sidebar';
import { EmptyState } from '../common/EmptyState';
import { MarkdownViewer } from '../editor/MarkdownViewer';
import { FormulaErrorList } from '../editor/FormulaErrorList';
import { StatusBar } from '../common/StatusBar';
import { LoadingOverlay } from '../common/LoadingOverlay';
import { SettingsDialog } from '../settings/SettingsDialog';
import { useDocumentStore } from '../../stores/documentStore';
import { useUIStore } from '../../stores/uiStore';
import { tokens } from '@fluentui/react-components';

export const AppShell: React.FC = () => {
  const filePath = useDocumentStore((s) => s.filePath);
  const isLoading = useUIStore((s) => s.isLoading);
  const isSettingsOpen = useUIStore((s) => s.isSettingsOpen);
  const isMarkdownVisible = useUIStore((s) => s.isMarkdownVisible);
  const sidebarWidth = useUIStore((s) => s.sidebarWidth);
  const markdownWidth = useUIStore((s) => s.markdownWidth);
  const setSidebarWidth = useUIStore((s) => s.setSidebarWidth);
  const setMarkdownWidth = useUIStore((s) => s.setMarkdownWidth);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleSidebarResize = useCallback((e: React.MouseEvent) => {
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      setSidebarWidth(startWidth + delta);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'default';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'col-resize';
  }, [sidebarWidth, setSidebarWidth]);

  const handleMarkdownResize = useCallback((e: React.MouseEvent) => {
    const startX = e.clientX;
    const startWidth = markdownWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      setMarkdownWidth(startWidth + delta);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'default';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'col-resize';
  }, [markdownWidth, setMarkdownWidth]);

  return (
    <div className="app-container" ref={containerRef}>
      <div style={{ width: sidebarWidth, minWidth: sidebarWidth, display: 'flex' }}>
        <Sidebar />
      </div>
      
      <div className="resizer" onMouseDown={handleSidebarResize} />

      <div className="main-content">
        {filePath ? (
          <>
            <div className="content-area">
              {isMarkdownVisible && (
                <>
                  <div className="left-panel" style={{ width: markdownWidth, flex: 'none' }}>
                    <MarkdownViewer />
                  </div>
                  <div className="resizer" onMouseDown={handleMarkdownResize} />
                </>
              )}
              <div className="right-panel" style={{ flex: 1, minWidth: 200 }}>
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
