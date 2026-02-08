import React from 'react';
import { Spinner, tokens } from '@fluentui/react-components';
import { useUIStore } from '../../stores/uiStore';

export const LoadingOverlay: React.FC = () => {
  const loadingMessage = useUIStore((s) => s.loadingMessage);

  return (
    <div className="loading-overlay">
      <Spinner size="large" />
      {loadingMessage && (
        <span style={{ color: tokens.colorNeutralForegroundOnBrand, fontSize: 14 }}>
          {loadingMessage}
        </span>
      )}
    </div>
  );
};
