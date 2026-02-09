import React from 'react';
import ReactDOM from 'react-dom/client';
import { FluentProvider, webLightTheme, webDarkTheme } from '@fluentui/react-components';
import { useSettingsStore } from './stores/settingsStore';
import App from './App';
import 'katex/dist/katex.min.css';
import './App.css';

// 禁用 web 视图的右键菜单（防止在应用内弹出默认上下文菜单）
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
