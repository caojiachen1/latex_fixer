import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { tokens, ToggleButton, Button, Tooltip } from '@fluentui/react-components';
import { EyeRegular, CodeRegular, DismissRegular, ArrowUpRegular, ArrowDownRegular } from '@fluentui/react-icons';
import { KaTeXRenderer } from '../preview/KaTeXRenderer';
import { useDocumentStore } from '../../stores/documentStore';
import { useUIStore } from '../../stores/uiStore';

export const MarkdownViewer: React.FC = () => {
  const originalContent = useDocumentStore((s) => s.originalContent);
  const errors = useDocumentStore((s) => s.errors);
  const fixes = useDocumentStore((s) => s.fixes);
  const resetDocument = useDocumentStore((s) => s.reset);
  const setSelectedErrorId = useUIStore((s) => s.setSelectedErrorId);
  const selectedErrorId = useUIStore((s) => s.selectedErrorId);
  const [showPreview, setShowPreview] = useState(false);
  const [currentErrorIndex, setCurrentErrorIndex] = useState(-1);

  const sortedErrors = useMemo(() => {
    return [...errors].sort((a, b) => a.startOffset - b.startOffset);
  }, [errors]);

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
      if (direction === 'next') {
        nextIndex = (currentErrorIndex + 1) % sortedErrors.length;
      } else {
        nextIndex = (currentErrorIndex - 1 + sortedErrors.length) % sortedErrors.length;
      }
    }

    setCurrentErrorIndex(nextIndex);
    const error = sortedErrors[nextIndex];
    
    // Update global selected state to sync with right error list
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
      // Text before this error
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

    return parts;
  }, [originalContent, errors, fixes]);

  const previewContent = useMemo(() => {
    if (!originalContent || !showPreview) return null;
    return renderMarkdownWithFormulas(originalContent, errors, fixes);
  }, [originalContent, showPreview, errors, fixes]);

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
        <div
          className="preview-pane"
          style={{ backgroundColor: tokens.colorNeutralBackground1 }}
        >
          {previewContent}
        </div>
      ) : (
        <div
          className="markdown-viewer"
          style={{ backgroundColor: tokens.colorNeutralBackground1 }}
        >
          {highlightedContent}
        </div>
      )}
    </div>
  );
};

function renderMarkdownWithFormulas(
  markdown: string,
  errors: any[] = [],
  fixes: Record<string, any> = {}
): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const len = markdown.length;
  let i = 0;
  let textStart = 0;
  let key = 0;

  while (i < len) {
    // Skip code blocks
    if (markdown.startsWith('```', i)) {
      const end = markdown.indexOf('```', i + 3);
      if (end !== -1) {
        i = end + 3;
        continue;
      }
    }

    // Check for error at current position
    const error = errors.find(e => e.startOffset === i);
    const fix = error ? fixes[error.id] : null;
    const isFixed = fix?.status === 'accepted';
    const className = error ? (isFixed ? 'formula-fixed' : 'formula-error') : undefined;
    const id = error ? `error-${error.id}` : undefined;
    const title = error ? (error.errorMessage || 'LaTeX error') : undefined;

    // compute index for this error (if any)
    const errorIndex = error ? errors.findIndex(e => e.startOffset === error.startOffset) : -1;

    // Block $$ formula
    if (markdown.startsWith('$$', i)) {
      if (i > textStart) {
        parts.push(<span key={key++}>{markdown.slice(textStart, i)}</span>);
      }
      const end = markdown.indexOf('$$', i + 2);
      if (end !== -1) {
        const raw = markdown.slice(i + 2, end);
        parts.push(
          <div 
            key={key++} 
            id={id}
            className={className}
            title={title}
            style={{ margin: '12px 0', textAlign: 'center', position: 'relative', paddingLeft: errorIndex !== -1 ? '1.2em' : undefined, overflow: 'visible' }}
          >
                  {errorIndex !== -1 && (
                    <span style={{ position: 'absolute', left: '-2.2em', top: 8, backgroundColor: tokens.colorPaletteRedBackground1, color: tokens.colorNeutralForegroundOnBrand, fontSize: '0.8em', padding: '0 6px', borderRadius: 4, pointerEvents: 'none' }}>#{errorIndex + 1}</span>
                  )}
            <KaTeXRenderer latex={raw} displayMode />
          </div>
        );
        i = end + 2;
        textStart = i;
        continue;
      }
    }

    // Block \[...\]
    if (markdown.startsWith('\\[', i)) {
      if (i > textStart) {
        parts.push(<span key={key++}>{markdown.slice(textStart, i)}</span>);
      }
      const end = markdown.indexOf('\\]', i + 2);
      if (end !== -1) {
        const raw = markdown.slice(i + 2, end);
        parts.push(
          <div 
              key={key++} 
              id={id}
              className={className}
              title={title}
              style={{ margin: '12px 0', textAlign: 'center', position: 'relative', paddingLeft: errorIndex !== -1 ? '1.2em' : undefined, overflow: 'visible' }}
            >
              {errorIndex !== -1 && (
                <span style={{ position: 'absolute', left: '-2.2em', top: 8, backgroundColor: tokens.colorPaletteRedBackground1, color: tokens.colorNeutralForegroundOnBrand, fontSize: '0.8em', padding: '0 6px', borderRadius: 4, pointerEvents: 'none' }}>#{errorIndex + 1}</span>
              )}
              <KaTeXRenderer latex={raw} displayMode />
            </div>
        );
        i = end + 2;
        textStart = i;
        continue;
      }
    }

    // Inline \(...\)
    if (markdown.startsWith('\\(', i)) {
      if (i > textStart) {
        parts.push(<span key={key++}>{markdown.slice(textStart, i)}</span>);
      }
      const end = markdown.indexOf('\\)', i + 2);
      if (end !== -1) {
        const raw = markdown.slice(i + 2, end);
        const content = <KaTeXRenderer latex={raw} />;
        if (error) {
          parts.push(
            <span key={key++} id={id} className={className} title={title} style={{ position: 'relative', display: 'inline-block', paddingLeft: '0.4em', overflow: 'visible' }}>
              <span style={{ position: 'absolute', top: '0.1em', left: '-2.0em', backgroundColor: tokens.colorPaletteRedBackground1, color: tokens.colorNeutralForegroundOnBrand, fontSize: '0.7em', padding: '0 4px', borderRadius: '4px', pointerEvents: 'none' }}>#{errorIndex + 1}</span>
              {content}
            </span>
          );
        } else {
          parts.push(<React.Fragment key={key++}>{content}</React.Fragment>);
        }
        i = end + 2;
        textStart = i;
        continue;
      }
    }

    // Inline $ formula
    if (markdown[i] === '$' && (i === 0 || markdown[i - 1] !== '\\')) {
      const end = markdown.indexOf('$', i + 1);
      if (end !== -1 && end > i + 1) {
        if (i > textStart) {
          parts.push(<span key={key++}>{markdown.slice(textStart, i)}</span>);
        }
        const raw = markdown.slice(i + 1, end);
        const content = <KaTeXRenderer latex={raw} />;
        if (error) {
          parts.push(
            <span key={key++} id={id} className={className} title={title} style={{ position: 'relative', display: 'inline-block', paddingLeft: '0.6em', overflow: 'visible' }}>
              <span style={{ position: 'absolute', top: '0.1em', left: '-1.2em', backgroundColor: tokens.colorPaletteRedBackground1, color: tokens.colorNeutralForegroundOnBrand, fontSize: '0.7em', padding: '0 4px', borderRadius: '4px', pointerEvents: 'none' }}>#{errorIndex + 1}</span>
              {content}
            </span>
          );
        } else {
          parts.push(<React.Fragment key={key++}>{content}</React.Fragment>);
        }
        i = end + 1;
        textStart = i;
        continue;
      }
    }

    i++;
  }

  // Remaining text
  if (textStart < len) {
    parts.push(<span key={key++}>{markdown.slice(textStart)}</span>);
  }

  return parts;
}
