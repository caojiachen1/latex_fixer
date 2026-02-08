import React, { useMemo, useState } from 'react';
import { tokens, ToggleButton } from '@fluentui/react-components';
import { EyeRegular, CodeRegular } from '@fluentui/react-icons';
import { KaTeXRenderer } from '../preview/KaTeXRenderer';
import { useDocumentStore } from '../../stores/documentStore';

export const MarkdownViewer: React.FC = () => {
  const originalContent = useDocumentStore((s) => s.originalContent);
  const errors = useDocumentStore((s) => s.errors);
  const fixes = useDocumentStore((s) => s.fixes);
  const [showPreview, setShowPreview] = useState(false);

  const highlightedContent = useMemo(() => {
    if (!originalContent || errors.length === 0) {
      return [<span key="all">{originalContent}</span>];
    }

    // Sort errors by offset ascending
    const sortedErrors = [...errors].sort(
      (a, b) => a.startOffset - b.startOffset
    );

    const parts: React.ReactNode[] = [];
    let lastEnd = 0;

    sortedErrors.forEach((error) => {
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
          className={className}
          title={error.errorMessage || 'LaTeX error'}
        >
          {originalContent.slice(error.startOffset, error.endOffset)}
        </span>
      );

      lastEnd = error.endOffset;
    });

    // Remaining text
    if (lastEnd < originalContent.length) {
      parts.push(
        <span key={`text-${lastEnd}`}>
          {originalContent.slice(lastEnd)}
        </span>
      );
    }

    return parts;
  }, [originalContent, errors, fixes]);

  const previewContent = useMemo(() => {
    if (!originalContent || !showPreview) return null;
    return renderMarkdownWithFormulas(originalContent);
  }, [originalContent, showPreview]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div
        className="markdown-viewer-toolbar"
        style={{
          padding: '4px 8px',
          borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
          display: 'flex',
          justifyContent: 'flex-end',
          backgroundColor: tokens.colorNeutralBackground2,
        }}
      >
        <ToggleButton
          size="small"
          appearance="subtle"
          checked={showPreview}
          icon={showPreview ? <CodeRegular /> : <EyeRegular />}
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? 'Source' : 'Preview'}
        </ToggleButton>
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

function renderMarkdownWithFormulas(markdown: string): React.ReactNode[] {
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

    // Block $$ formula
    if (markdown.startsWith('$$', i)) {
      if (i > textStart) {
        parts.push(<span key={key++}>{markdown.slice(textStart, i)}</span>);
      }
      const end = markdown.indexOf('$$', i + 2);
      if (end !== -1) {
        const raw = markdown.slice(i + 2, end);
        parts.push(
          <div key={key++} style={{ margin: '12px 0', textAlign: 'center' }}>
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
          <div key={key++} style={{ margin: '12px 0', textAlign: 'center' }}>
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
        parts.push(<KaTeXRenderer key={key++} latex={raw} />);
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
        parts.push(<KaTeXRenderer key={key++} latex={raw} />);
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
