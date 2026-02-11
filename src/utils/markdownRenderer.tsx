import React from 'react';
import { tokens } from '@fluentui/react-components';
import { KaTeXRenderer } from '../components/preview/KaTeXRenderer';

export interface RendererOptions {
  errors?: any[];
  fixes?: Record<string, any>;
  lazyLoad?: boolean;
}

export function renderMarkdownWithFormulas(
  markdown: string,
  options: RendererOptions = {}
): React.ReactNode[] {
  const { errors = [], fixes = {}, lazyLoad = false } = options;
  const parts: React.ReactNode[] = [];
  const len = markdown.length;
  let i = 0;
  let textStart = 0;
  let key = 0;

  const errorByStart = new Map<number, { error: any; index: number }>();
  for (let idx = 0; idx < errors.length; idx++) {
    const error = errors[idx];
    if (typeof error?.startOffset === 'number') {
      errorByStart.set(error.startOffset, { error, index: idx });
    }
  }

  while (i < len) {
    if (markdown.startsWith('```', i)) {
      const end = markdown.indexOf('```', i + 3);
      if (end !== -1) {
        i = end + 3;
        continue;
      }
    }

    const errorEntry = errorByStart.get(i);
    const error = errorEntry ? errorEntry.error : undefined;
    const errorIndex = errorEntry ? errorEntry.index : -1;
    const fix = error ? fixes[error.id] : null;
    const isFixed = fix?.status === 'accepted';
    const className = error ? (isFixed ? 'formula-fixed' : 'formula-error') : undefined;
    const id = error ? `error-${error.id}` : undefined;
    const title = error ? (error.errorMessage || 'LaTeX error') : undefined;

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
              <span
                style={{
                  position: 'absolute',
                  left: '-2.2em',
                  top: 8,
                  backgroundColor: tokens.colorPaletteRedBackground1,
                  color: tokens.colorNeutralForegroundOnBrand,
                  fontSize: '0.8em',
                  padding: '0 6px',
                  borderRadius: 4,
                  pointerEvents: 'none',
                }}
              >
                #{errorIndex + 1}
              </span>
            )}
            <KaTeXRenderer latex={raw} displayMode lazyLoad={lazyLoad} />
          </div>
        );
        i = end + 2;
        textStart = i;
        continue;
      }
    }

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
              <span
                style={{
                  position: 'absolute',
                  left: '-2.2em',
                  top: 8,
                  backgroundColor: tokens.colorPaletteRedBackground1,
                  color: tokens.colorNeutralForegroundOnBrand,
                  fontSize: '0.8em',
                  padding: '0 6px',
                  borderRadius: 4,
                  pointerEvents: 'none',
                }}
              >
                #{errorIndex + 1}
              </span>
            )}
            <KaTeXRenderer latex={raw} displayMode lazyLoad={lazyLoad} />
          </div>
        );
        i = end + 2;
        textStart = i;
        continue;
      }
    }

    if (markdown.startsWith('\\(', i)) {
      if (i > textStart) {
        parts.push(<span key={key++}>{markdown.slice(textStart, i)}</span>);
      }
      const end = markdown.indexOf('\\)', i + 2);
      if (end !== -1) {
        const raw = markdown.slice(i + 2, end);
        const content = <KaTeXRenderer latex={raw} lazyLoad={lazyLoad} />;
        if (error) {
          parts.push(
            <span
              key={key++}
              id={id}
              className={className}
              title={title}
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
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                #{errorIndex + 1}
              </span>
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

    if (markdown[i] === '$' && (i === 0 || markdown[i - 1] !== '\\')) {
      const end = markdown.indexOf('$', i + 1);
      if (end !== -1 && end > i + 1) {
        if (i > textStart) {
          parts.push(<span key={key++}>{markdown.slice(textStart, i)}</span>);
        }
        const raw = markdown.slice(i + 1, end);
        const content = <KaTeXRenderer latex={raw} lazyLoad={lazyLoad} />;
        if (error) {
          parts.push(
            <span
              key={key++}
              id={id}
              className={className}
              title={title}
              style={{ position: 'relative', display: 'inline-block', paddingLeft: '0.6em', overflow: 'visible' }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '0.1em',
                  left: '-1.2em',
                  backgroundColor: tokens.colorPaletteRedBackground1,
                  color: tokens.colorNeutralForegroundOnBrand,
                  fontSize: '0.7em',
                  padding: '0 4px',
                  borderRadius: 4,
                  pointerEvents: 'none',
                }}
              >
                #{errorIndex + 1}
              </span>
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

  if (textStart < len) {
    parts.push(<span key={key++}>{markdown.slice(textStart)}</span>);
  }

  return parts;
}
