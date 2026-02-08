import React, { useCallback, useState } from 'react';
import {
  Card,
  Button,
  Badge,
  Spinner,
  tokens,
} from '@fluentui/react-components';
import {
  WrenchRegular,
  CheckmarkRegular,
  DismissRegular,
} from '@fluentui/react-icons';
import { FormulaFixDiff } from './FormulaFixDiff';
import { useDocumentStore } from '../../stores/documentStore';
import { useUIStore } from '../../stores/uiStore';
import { useLLMFix } from '../../hooks/useLLMFix';
import type { Formula } from '../../services/latex/types';

interface Props {
  formula: Formula;
}

export const FormulaErrorCard: React.FC<Props> = ({ formula }) => {
  const fixes = useDocumentStore((s) => s.fixes);
  const acceptFix = useDocumentStore((s) => s.acceptFix);
  const rejectFix = useDocumentStore((s) => s.rejectFix);
  const fixingFormulaIds = useUIStore((s) => s.fixingFormulaIds);
  const { fixFormula } = useLLMFix();
  const [error, setError] = useState<string | null>(null);

  const fix = fixes[formula.id];
  const isFixing = fixingFormulaIds.has(formula.id);

  const handleFix = useCallback(async () => {
    setError(null);
    try {
      await fixFormula(formula);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fix failed');
    }
  }, [fixFormula, formula]);

  const delimiterLabel = {
    'inline-dollar': 'Inline $',
    'block-dollar': 'Block $$',
    'inline-paren': 'Inline \\(',
    'block-bracket': 'Block \\[',
  }[formula.delimiterType];

  return (
    <Card className="error-card" size="small">
      <div
        className="error-card-header"
        style={{ color: tokens.colorNeutralForeground3 }}
      >
        <span>
          Line {formula.lineNumber} &middot; {delimiterLabel}
        </span>
        {fix && (
          <Badge
            appearance="filled"
            color={
              fix.status === 'accepted'
                ? 'success'
                : fix.status === 'rejected'
                  ? 'danger'
                  : 'informative'
            }
          >
            {fix.status}
          </Badge>
        )}
      </div>

      <div className="error-card-body">
        <div
          className="formula-display"
          style={{ backgroundColor: tokens.colorNeutralBackground3 }}
        >
          {formula.raw}
        </div>
        {formula.errorMessage && (
          <div
            className="error-message"
            style={{
              backgroundColor: tokens.colorPaletteRedBackground1,
              color: tokens.colorPaletteRedForeground1,
            }}
          >
            {formula.errorMessage}
          </div>
        )}
      </div>

      {fix && <FormulaFixDiff formula={formula} fix={fix} />}

      {error && (
        <div
          className="error-message"
          style={{
            margin: '0 12px',
            backgroundColor: tokens.colorPaletteRedBackground1,
            color: tokens.colorPaletteRedForeground1,
          }}
        >
          {error}
        </div>
      )}

      <div className="error-card-actions">
        {!fix && !isFixing && (
          <Button
            size="small"
            appearance="primary"
            icon={<WrenchRegular />}
            onClick={handleFix}
          >
            Fix with LLM
          </Button>
        )}

        {isFixing && (
          <Button size="small" appearance="subtle" disabled>
            <Spinner size="tiny" /> Fixing...
          </Button>
        )}

        {fix && fix.status === 'pending' && (
          <>
            <Button
              size="small"
              appearance="primary"
              icon={<CheckmarkRegular />}
              onClick={() => acceptFix(formula.id)}
            >
              Accept
            </Button>
            <Button
              size="small"
              appearance="secondary"
              icon={<DismissRegular />}
              onClick={() => rejectFix(formula.id)}
            >
              Reject
            </Button>
          </>
        )}

        {fix && fix.status !== 'pending' && (
          <Button
            size="small"
            appearance="subtle"
            icon={<WrenchRegular />}
            onClick={handleFix}
          >
            Re-fix with LLM
          </Button>
        )}
      </div>
    </Card>
  );
};
