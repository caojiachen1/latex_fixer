import React from 'react';
import { tokens, Badge } from '@fluentui/react-components';
import { KaTeXRenderer } from '../preview/KaTeXRenderer';
import type { Formula, FormulaFix } from '../../services/latex/types';

interface Props {
  formula: Formula;
  fix: FormulaFix;
}

export const FormulaFixDiff: React.FC<Props> = ({ formula, fix }) => {
  const displayMode =
    formula.delimiterType === 'block-dollar' ||
    formula.delimiterType === 'block-bracket';

  return (
    <div className="fix-diff" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="fix-diff-row" style={{ display: 'flex', gap: 8 }}>
        <div className="fix-diff-column" style={{ flex: 1 }}>
          <div className="fix-diff-label" style={{ color: tokens.colorPaletteRedForeground1, fontWeight: 'bold', marginBottom: 4 }}>
            Original
          </div>
          <div
            className="fix-diff-render"
            style={{ 
              backgroundColor: tokens.colorPaletteRedBackground1, 
              padding: 8, 
              borderRadius: 4,
              minHeight: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <KaTeXRenderer latex={formula.raw} displayMode={displayMode} />
          </div>
        </div>

        <div className="fix-diff-column" style={{ flex: 1 }}>
          <div
            className="fix-diff-label"
            style={{
              color: fix.fixedIsValid
                ? tokens.colorPaletteGreenForeground1
                : tokens.colorPaletteYellowForeground1,
              fontWeight: 'bold',
              marginBottom: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>Fixed</span>
            {!fix.fixedIsValid && (
              <Badge appearance="filled" color="warning" size="small">
                Invalid
              </Badge>
            )}
          </div>
          <div
            className="fix-diff-render"
            style={{
              backgroundColor: fix.fixedIsValid
                ? tokens.colorPaletteGreenBackground1
                : tokens.colorPaletteYellowBackground1,
              padding: 8, 
              borderRadius: 4,
              minHeight: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <KaTeXRenderer latex={fix.fixedRaw} displayMode={displayMode} />
          </div>
        </div>
      </div>
      
      <div className="fix-diff-raw" style={{ 
        backgroundColor: tokens.colorNeutralBackground3, 
        padding: 8, 
        borderRadius: 4,
        fontFamily: 'monospace',
        fontSize: '12px',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all'
      }}>
        {fix.fixedRaw}
      </div>
    </div>
  );
};
