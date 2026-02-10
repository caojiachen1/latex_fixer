import React from 'react';
import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogBody,
  DialogActions,
  Button,
  Text,
  makeStyles,
  tokens} from '@fluentui/react-components';
import { useUIStore } from '../../stores/uiStore';

const useStyles = makeStyles({
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    padding: '20px 0',
  },
  logo: {
    width: '64px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    fontSize: '32px',
    fontWeight: 'bold',
    fontFamily: 'serif',
    fontStyle: 'italic',
  },
  version: {
    color: tokens.colorNeutralForeground3,
  },
  description: {
    textAlign: 'center',
    maxWidth: '300px',
  },
  footer: {
    marginTop: '8px',
    fontSize: '12px',
    color: tokens.colorNeutralForeground4,
  }
});

export const AboutDialog: React.FC = () => {
  const { isAboutOpen, setAboutOpen } = useUIStore();
  const styles = useStyles();

  return (
    <Dialog open={isAboutOpen} onOpenChange={(_, data) => setAboutOpen(data.open)}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>About LaTeX Fixer</DialogTitle>
          <DialogContent className={styles.content}>
            <div className={styles.logo}>Σ</div>
            <Text size={600} weight="semibold">LaTeX Fixer</Text>
            <Text className={styles.version}>Version 1.0.0</Text>
            <Text className={styles.description}>
              An AI-powered tool to help you find and fix LaTeX formula errors in your documents.
            </Text>
          </DialogContent>
          <DialogActions>
            <Button appearance="primary" onClick={() => setAboutOpen(false)}>Close</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
