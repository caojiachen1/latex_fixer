import React, { useMemo } from 'react';
import { tokens } from '@fluentui/react-components';
import { useDocumentStore } from '../../stores/documentStore';

export const MarkdownViewer: React.FC = () => {
  const originalContent = useDocumentStore((s) => s.originalContent);
  const errors = useDocumentStore((s) => s.errors);
  const fixes = useDocumentStore((s) => s.fixes);

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

  return (
    <div
      className="markdown-viewer"
      style={{ backgroundColor: tokens.colorNeutralBackground1 }}
    >
      {highlightedContent}
    </div>
  );
};
