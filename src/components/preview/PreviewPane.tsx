import React, { useMemo } from 'react';
import { tokens } from '@fluentui/react-components';
import { KaTeXRenderer } from './KaTeXRenderer';
import { useDocumentStore } from '../../stores/documentStore';

export const PreviewPane: React.FC = () => {
  const currentContent = useDocumentStore((s) => s.currentContent);

  const segments = useMemo(() => {
    if (!currentContent) return [];
    return renderMarkdownWithFormulas(currentContent);
  }, [currentContent]);

  return (
    <div className="preview-pane" style={{ backgroundColor: tokens.colorNeutralBackground1 }}>
      {segments}
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
      // Flush text before
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
