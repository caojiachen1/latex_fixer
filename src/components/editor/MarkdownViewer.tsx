import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { tokens, ToggleButton, Button, Tooltip } from '@fluentui/react-components';
import { EyeRegular, CodeRegular, DismissRegular, ArrowUpRegular, ArrowDownRegular } from '@fluentui/react-icons';
import { useDocumentStore } from '../../stores/documentStore';
import { useUIStore } from '../../stores/uiStore';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { renderMarkdownWithFormulas } from '../../utils/markdownRenderer';

export const MarkdownViewer: React.FC = () => {
  const originalContent = useDocumentStore((s) => s.originalContent);
  const errors = useDocumentStore((s) => s.errors);
  const fixes = useDocumentStore((s) => s.fixes);
  const resetDocument = useDocumentStore((s) => s.reset);
  const setSelectedErrorId = useUIStore((s) => s.setSelectedErrorId);
  const selectedErrorId = useUIStore((s) => s.selectedErrorId);
  const [showPreview, setShowPreview] = useState(false);
  const [currentErrorIndex, setCurrentErrorIndex] = useState(-1);

  const sortedErrors = useMemo(() => [...errors].sort((a, b) => a.startOffset - b.startOffset), [errors]);

  const scrollElementIntoView = useCallback((element: HTMLElement | null) => {
    if (!element) return;

    const container = element.closest('.markdown-viewer, .preview-pane') as HTMLElement | null;
    if (!container) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    const padding = 8;
    const elementRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const relativeTop = elementRect.top - containerRect.top + container.scrollTop;
    const relativeBottom = relativeTop + element.offsetHeight;
    const viewTop = container.scrollTop + padding;
    const viewBottom = container.scrollTop + container.clientHeight - padding;

    if (relativeTop < viewTop) {
      container.scrollTo({
        top: Math.max(0, relativeTop - padding),
        behavior: 'smooth',
      });
    } else if (relativeBottom > viewBottom) {
      container.scrollTo({
        top: Math.min(container.scrollHeight - container.clientHeight, relativeBottom - container.clientHeight + padding),
        behavior: 'smooth',
      });
    }
  }, []);

  useEffect(() => {
    if (!selectedErrorId) return;

    const index = sortedErrors.findIndex((e) => e.id === selectedErrorId);
    if (index !== -1) {
      setCurrentErrorIndex(index);
    }

    const element = document.getElementById(`error-${selectedErrorId}`);
    scrollElementIntoView(element as HTMLElement | null);
  }, [selectedErrorId, sortedErrors, scrollElementIntoView]);

  const handleJumpToError = (direction: 'next' | 'prev') => {
    if (sortedErrors.length === 0) return;

    let nextIndex;
    if (currentErrorIndex === -1) {
      nextIndex = direction === 'next' ? 0 : sortedErrors.length - 1;
    } else {
      nextIndex = direction === 'next'
        ? (currentErrorIndex + 1) % sortedErrors.length
        : (currentErrorIndex - 1 + sortedErrors.length) % sortedErrors.length;
    }

    setCurrentErrorIndex(nextIndex);
    const error = sortedErrors[nextIndex];
    setSelectedErrorId(error.id);

    const element = document.getElementById(`error-${error.id}`);
    scrollElementIntoView(element as HTMLElement | null);
  };

  const handleCloseFile = () => {
    resetDocument();
    setSelectedErrorId(null);
  };

  const highlightedContent = useMemo(() => {
    if (!originalContent || errors.length === 0) {
      return [<span key="all">{originalContent}</span>];
    }

    const parts: React.ReactNode[] = [];
    let lastEnd = 0;

    sortedErrors.forEach((error, index) => {
      if (error.startOffset > lastEnd) {
        parts.push(
          <span key={`text-${lastEnd}`}>
            {originalContent.slice(lastEnd, error.startOffset)}
          </span>
        );
      }

      const fix = fixes[error.id];
      const className = fix?.status === 'accepted' ? 'formula-fixed' : 'formula-error';

      parts.push(
        <span
          key={`error-${error.id}`}
          id={`error-${error.id}`}
          className={className}
          title={error.errorMessage || 'LaTeX error'}
          style={{ position: 'relative', display: 'inline-block', paddingLeft: '0.4em', overflow: 'visible' }}
        >
          <span
            style={{
              position: 'absolute',
              top: '0.1em',
              left: '-2.0em',
              backgroundColor: tokens.colorPaletteRedBackground1,
              color: tokens.colorNeutralForegroundOnBrand,
              fontSize: '0.7em',
              padding: '0 4px',
              borderRadius: '4px',
              zIndex: 1,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            #{index + 1}
          </span>
          {originalContent.slice(error.startOffset, error.endOffset)}
        </span>
      );

      lastEnd = error.endOffset;
    });

    if (lastEnd < originalContent.length) {
      parts.push(<span key={`tail-${lastEnd}`}>{originalContent.slice(lastEnd)}</span>);
    }

    return parts;
  }, [originalContent, errors, fixes, sortedErrors]);

  const debouncedContent = useDebouncedValue(originalContent, showPreview ? 200 : 0);

  const previewContent = useMemo(() => {
    if (!debouncedContent || !showPreview) return null;
    return renderMarkdownWithFormulas(debouncedContent, {
      errors,
      fixes,
      lazyLoad: showPreview,
    });
  }, [debouncedContent, showPreview, errors, fixes]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div
        className="markdown-viewer-toolbar"
        style={{
          padding: '4px 8px',
          borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: tokens.colorNeutralBackground2,
        }}
      >
        <span style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '4px' }}>EDITOR</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <Button
            size="small"
            appearance="subtle"
            icon={<ArrowUpRegular />}
            onClick={() => handleJumpToError('prev')}
            disabled={errors.length === 0}
            title="Previous Error"
          />
          <Button
            size="small"
            appearance="subtle"
            icon={<ArrowDownRegular />}
            onClick={() => handleJumpToError('next')}
            disabled={errors.length === 0}
            title="Next Error"
          />
          <ToggleButton
            size="small"
            appearance="subtle"
            checked={showPreview}
            icon={showPreview ? <CodeRegular /> : <EyeRegular />}
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? 'Source' : 'Preview'}
          </ToggleButton>
          <Tooltip content="Close file" relationship="label">
            <Button
              size="small"
              appearance="subtle"
              icon={<DismissRegular />}
              onClick={handleCloseFile}
            />
          </Tooltip>
        </div>
      </div>
      {showPreview ? (
        <div className="preview-pane" style={{ backgroundColor: tokens.colorNeutralBackground1 }}>
          {previewContent}
        </div>
      ) : (
        <div className="markdown-viewer" style={{ backgroundColor: tokens.colorNeutralBackground1 }}>
          {highlightedContent}
        </div>
      )}
    </div>
  );
};