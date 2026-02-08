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
    <div className="fix-diff">
      <div className="fix-diff-column">
        <div className="fix-diff-label" style={{ color: tokens.colorPaletteRedForeground1 }}>
          Original
        </div>
        <div
          className="fix-diff-render"
          style={{ backgroundColor: tokens.colorPaletteRedBackground1 }}
        >
          <KaTeXRenderer latex={formula.raw} displayMode={displayMode} />
        </div>
        <div
          className="fix-diff-raw"
          style={{ backgroundColor: tokens.colorNeutralBackground3 }}
        >
          {formula.raw}
        </div>
      </div>

      <div className="fix-diff-column">
        <div
          className="fix-diff-label"
          style={{
            color: fix.fixedIsValid
              ? tokens.colorPaletteGreenForeground1
              : tokens.colorPaletteYellowForeground1,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          Fixed
          {!fix.fixedIsValid && (
            <Badge appearance="filled" color="warning" size="small">
              Still has errors
            </Badge>
          )}
        </div>
        <div
          className="fix-diff-render"
          style={{
            backgroundColor: fix.fixedIsValid
              ? tokens.colorPaletteGreenBackground1
              : tokens.colorPaletteYellowBackground1,
          }}
        >
          <KaTeXRenderer latex={fix.fixedRaw} displayMode={displayMode} />
        </div>
        <div
          className="fix-diff-raw"
          style={{ backgroundColor: tokens.colorNeutralBackground3 }}
        >
          {fix.fixedRaw}
        </div>
      </div>
    </div>
  );
};
