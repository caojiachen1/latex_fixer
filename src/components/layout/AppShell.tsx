import React, { useCallback, useRef } from 'react';
import { TitleBar } from './TitleBar';
import { EmptyState } from '../common/EmptyState';
import { MarkdownViewer } from '../editor/MarkdownViewer';
import { FormulaErrorList } from '../editor/FormulaErrorList';
import { StatusBar } from '../common/StatusBar';
import { LoadingOverlay } from '../common/LoadingOverlay';
import { SettingsDialog } from '../settings/SettingsDialog';
import { AboutDialog } from '../settings/AboutDialog';
import { useDocumentStore } from '../../stores/documentStore';
import { useUIStore } from '../../stores/uiStore';

export const AppShell: React.FC = () => {
  const filePath = useDocumentStore((s) => s.filePath);
  const isLoading = useUIStore((s) => s.isLoading);
  const isSettingsOpen = useUIStore((s) => s.isSettingsOpen);
  const isAboutOpen = useUIStore((s) => s.isAboutOpen);
  const isMarkdownVisible = useUIStore((s) => s.isMarkdownVisible);
  const isLeftPanelVisible = useUIStore((s) => s.isLeftPanelVisible);
  const isRightPanelVisible = useUIStore((s) => s.isRightPanelVisible);
  const markdownWidth = useUIStore((s) => s.markdownWidth);
  const setMarkdownWidth = useUIStore((s) => s.setMarkdownWidth);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMarkdownResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = markdownWidth;
    // disable text selection while dragging
    const prevUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = 'none';

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      // clear any accidental selection during drag
      window.getSelection()?.removeAllRanges();
      setMarkdownWidth(startWidth + delta);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = prevUserSelect;
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'col-resize';
  }, [markdownWidth, setMarkdownWidth]);

  return (
    <div className="app-container" ref={containerRef}>
      <TitleBar />

      <div className="main-content">
        {filePath ? (
          <>
            <div className="content-area">
              {isMarkdownVisible && isLeftPanelVisible && (
                <div 
                  className="left-panel" 
                  style={isRightPanelVisible ? { width: markdownWidth, flex: 'none' } : { flex: 1 }}
                >
                  <MarkdownViewer />
                </div>
              )}
              
              {isMarkdownVisible && isLeftPanelVisible && isRightPanelVisible && (
                <div className="resizer" onMouseDown={handleMarkdownResize} />
              )}

              {isRightPanelVisible && (
                <div className="right-panel" style={{ flex: 1, minWidth: 200 }}>
                  <FormulaErrorList />
                </div>
              )}
            </div>
            <StatusBar />
          </>
        ) : (
          <EmptyState />
        )}
      </div>
      {isLoading && <LoadingOverlay />}
      {isSettingsOpen && <SettingsDialog />}
      {isAboutOpen && <AboutDialog />}
    </div>
  );
};
