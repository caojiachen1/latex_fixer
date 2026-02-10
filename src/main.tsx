import React from 'react';
import ReactDOM from 'react-dom/client';
import { FluentProvider, webLightTheme, webDarkTheme } from '@fluentui/react-components';
import { useSettingsStore } from './stores/settingsStore';
import App from './App';
import 'katex/dist/katex.min.css';
import './App.css';

// Disable the right-click context menu in the webview (to prevent default context menu from appearing inside the app)
window.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

const Root: React.FC = () => {
  const theme = useSettingsStore((s) => s.theme);

  return (
    <FluentProvider theme={theme === 'dark' ? webDarkTheme : webLightTheme} style={{ height: '100%', background: 'transparent' }}>
      <App />
    </FluentProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
