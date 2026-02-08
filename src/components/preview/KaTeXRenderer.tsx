import React, { useMemo } from 'react';
import katex from 'katex';
import { tokens } from '@fluentui/react-components';

interface Props {
  latex: string;
  displayMode?: boolean;
  className?: string;
}

export const KaTeXRenderer: React.FC<Props> = ({
  latex,
  displayMode = false,
  className,
}) => {
  const result = useMemo(() => {
    try {
      const html = katex.renderToString(latex, {
        throwOnError: false,
        displayMode,
      });
      return { html, error: false };
    } catch {
      return { html: latex, error: true };
    }
  }, [latex, displayMode]);

  if (result.error) {
    return (
      <span
        className={className}
        style={{ color: tokens.colorPaletteRedForeground1, fontFamily: 'monospace' }}
      >
        {latex}
      </span>
    );
  }

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: result.html }}
    />
  );
};
