import React, { useState, useEffect } from 'react';
import {
  Button,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  MenuSplitGroup,
  MenuItemCheckbox,
  Tooltip,
  tokens
} from '@fluentui/react-components';
import {
  Dismiss24Regular,
  Subtract24Regular,
  SquareMultiple24Regular,
  Square24Regular,
  PanelLeft24Regular,
  PanelRight24Regular,
  PanelLeftContract24Regular,
  PanelRightContract24Regular
} from '@fluentui/react-icons';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useUIStore } from '../../stores/uiStore';
import { useFileOperations } from '../../hooks/useFileOperations';
import { useSettingsStore } from '../../stores/settingsStore';
import './TitleBar.css';

export const TitleBar: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const { 
    isLeftPanelVisible, 
    isRightPanelVisible, 
    setLeftPanelVisible, 
    setRightPanelVisible, 
    setSettingsOpen,
    setAboutOpen
  } = useUIStore();
  const { openFile, exportFile } = useFileOperations();
  const { theme, toggleTheme } = useSettingsStore();
  const appWindow = getCurrentWindow();

  useEffect(() => {
    const checkMaximized = async () => {
      const maximized = await appWindow.isMaximized();
      setIsMaximized(maximized);
    };

    checkMaximized();

    const unlistenPromise = appWindow.onResized(() => {
      checkMaximized();
    });

    return () => {
      unlistenPromise.then(unlisten => unlisten());
    };
  }, [appWindow]);

  const handleMinimize = async () => {
    await appWindow.minimize();
  };

  const handleMaximize = async () => {
    await appWindow.toggleMaximize();
  };

  const handleClose = async () => {
    await appWindow.close();
  };

  const handleToggleTheme = () => {
    toggleTheme();
  };

  return (
    <div className="title-bar">
      <div className="title-bar-left">
        {/* App Icon */}
        <div className="app-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4h16v16H4V4z" stroke={tokens.colorBrandForeground1} strokeWidth="2" fill="none"/>
            <text x="12" y="16" fontSize="12" fill={tokens.colorBrandForeground1} textAnchor="middle" fontFamily="serif" fontStyle="italic">Σ</text>
          </svg>
        </div>

        {/* Menu Bar */}
        <div className="menu-bar">
          {/* File Menu */}
          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <Button appearance="subtle" size="small" className="menu-button">
                File
              </Button>
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem onClick={openFile}>
                  Open File
                  <span className="menu-shortcut">Ctrl+O</span>
                </MenuItem>
                <MenuItem onClick={exportFile}>
                  Export Fixed Content
                  <span className="menu-shortcut">Ctrl+S</span>
                </MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>

          {/* View Menu */}
          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <Button appearance="subtle" size="small" className="menu-button">
                View
              </Button>
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <Menu>
                  <MenuTrigger disableButtonEnhancement>
                    <MenuItem>Appearance</MenuItem>
                  </MenuTrigger>
                  <MenuPopover>
                    <MenuList 
                      checkedValues={{
                        left: isLeftPanelVisible ? ['left'] : [],
                        right: isRightPanelVisible ? ['right'] : []
                      }}
                      onCheckedValueChange={(_, { name, checkedItems }) => {
                        const isChecked = checkedItems.length > 0;
                        if (name === 'left') setLeftPanelVisible(isChecked);
                        if (name === 'right') setRightPanelVisible(isChecked);
                      }}
                    >
                      <MenuItemCheckbox name="left" value="left">
                        Show Left Panel
                      </MenuItemCheckbox>
                      <MenuItemCheckbox name="right" value="right">
                        Show Right Panel
                      </MenuItemCheckbox>
                    </MenuList>
                  </MenuPopover>
                </Menu>
                <MenuItem onClick={handleToggleTheme}>
                  Switch to {theme === 'light' ? 'Dark' : 'Light'} Theme
                </MenuItem>
                <MenuItem onClick={() => setSettingsOpen(true)}>
                  Settings
                  <span className="menu-shortcut">Ctrl+,</span>
                </MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>

          {/* Help Menu */}
          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <Button appearance="subtle" size="small" className="menu-button">
                Help
              </Button>
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem onClick={() => setAboutOpen(true)}>About LaTeX Fixer</MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
        </div>
      </div>

      <div className="title-bar-center">
        LaTeX Fixer
      </div>

      <div className="title-bar-right">
        {/* Panel Toggle Buttons */}
        <div className="panel-toggle-buttons">
          <Tooltip content={isLeftPanelVisible ? "Hide Left Panel" : "Show Left Panel"} relationship="description">
            <Button
              appearance="subtle"
              size="small"
              className="panel-toggle-button"
              icon={isLeftPanelVisible ? <PanelLeftContract24Regular /> : <PanelLeft24Regular />}
              onClick={() => setLeftPanelVisible(!isLeftPanelVisible)}
            />
          </Tooltip>
          <Tooltip content={isRightPanelVisible ? "Hide Right Panel" : "Show Right Panel"} relationship="description">
            <Button
              appearance="subtle"
              size="small"
              className="panel-toggle-button"
              icon={isRightPanelVisible ? <PanelRightContract24Regular /> : <PanelRight24Regular />}
              onClick={() => setRightPanelVisible(!isRightPanelVisible)}
            />
          </Tooltip>
        </div>

        {/* Window Controls */}
        <div className="window-controls">
          <Tooltip content="Minimize" relationship="description">
            <Button
              appearance="subtle"
              size="small"
              className="window-control-button"
              icon={<Subtract24Regular />}
              onClick={handleMinimize}
            />
          </Tooltip>
          <Tooltip content={isMaximized ? "Restore" : "Maximize"} relationship="description">
            <Button
              appearance="subtle"
              size="small"
              className="window-control-button"
              id="maximize-button"
              icon={isMaximized ? <SquareMultiple24Regular /> : <Square24Regular />}
              onClick={handleMaximize}
            />
          </Tooltip>
          <Tooltip content="Close" relationship="description">
            <Button
              appearance="subtle"
              size="small"
              className="window-control-button window-control-close"
              icon={<Dismiss24Regular />}
              onClick={handleClose}
            />
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
