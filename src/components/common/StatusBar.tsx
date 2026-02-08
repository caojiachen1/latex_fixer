import React from 'react';
import { tokens } from '@fluentui/react-components';
import {
  DocumentRegular,
  ErrorCircleRegular,
  CheckmarkCircleRegular,
  ClockRegular,
} from '@fluentui/react-icons';
import { useDocumentStore } from '../../stores/documentStore';

export const StatusBar: React.FC = () => {
  const filePath = useDocumentStore((s) => s.filePath);
  const formulas = useDocumentStore((s) => s.formulas);
  const errors = useDocumentStore((s) => s.errors);
  const fixes = useDocumentStore((s) => s.fixes);

  const acceptedCount = Object.values(fixes).filter(
    (f) => f.status === 'accepted'
  ).length;
  const pendingCount = Object.values(fixes).filter(
    (f) => f.status === 'pending'
  ).length;

  const fileName = filePath
    ? filePath.split(/[/\\]/).pop()
    : 'No file';

  return (
    <div
      className="status-bar"
      style={{
        backgroundColor: tokens.colorNeutralBackground2,
        color: tokens.colorNeutralForeground3,
      }}
    >
      <div className="status-bar-item">
        <DocumentRegular fontSize={14} />
        <span>{fileName}</span>
      </div>
      <div className="status-bar-item">
        <span>{formulas.length} formulas</span>
      </div>
      <div className="status-bar-item" style={{ color: errors.length > 0 ? tokens.colorPaletteRedForeground1 : undefined }}>
        <ErrorCircleRegular fontSize={14} />
        <span>{errors.length} errors</span>
      </div>
      {acceptedCount > 0 && (
        <div className="status-bar-item" style={{ color: tokens.colorPaletteGreenForeground1 }}>
          <CheckmarkCircleRegular fontSize={14} />
          <span>{acceptedCount} accepted</span>
        </div>
      )}
      {pendingCount > 0 && (
        <div className="status-bar-item">
          <ClockRegular fontSize={14} />
          <span>{pendingCount} pending</span>
        </div>
      )}
    </div>
  );
};
