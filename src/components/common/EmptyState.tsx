import React from 'react';
import { Button, tokens } from '@fluentui/react-components';
import { DocumentRegular } from '@fluentui/react-icons';
import { useFileOperations } from '../../hooks/useFileOperations';

export const EmptyState: React.FC = () => {
  const { openFile } = useFileOperations();

  return (
    <div className="empty-state">
      <DocumentRegular
        className="empty-state-icon"
        style={{ color: tokens.colorNeutralForeground3 }}
      />
      <p style={{ color: tokens.colorNeutralForeground3, fontSize: 16 }}>
        Open a Markdown file or drag it here to get started
      </p>
      <Button appearance="primary" size="large" onClick={openFile}>
        Open File
      </Button>
      <p
        style={{
          color: tokens.colorNeutralForeground4,
          fontSize: 13,
          maxWidth: 400,
          textAlign: 'center',
        }}
      >
        LaTeX Fixer detects broken formulas in your Markdown files and uses LLM
        to suggest fixes compatible with KaTeX.
      </p>
    </div>
  );
};
