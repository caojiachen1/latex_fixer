import React, { useCallback, useState } from 'react';
import {
  Card,
  Button,
  Badge,
  Spinner,
  Textarea,
  tokens,
} from '@fluentui/react-components';
import {
  WrenchRegular,
  CheckmarkRegular,
  DismissRegular,
  EditRegular,
  SaveRegular,
} from '@fluentui/react-icons';
import { FormulaFixDiff } from './FormulaFixDiff';
import { useDocumentStore } from '../../stores/documentStore';
import { useUIStore } from '../../stores/uiStore';
import { useLLMFix } from '../../hooks/useLLMFix';
import { validateLatexString } from '../../services/latex/validator';
import { wrapWithDelimiters } from '../../utils/markdown';
import type { Formula, FormulaFix } from '../../services/latex/types';

interface Props {
  formula: Formula;
  index: number;
}

export const FormulaErrorCard: React.FC<Props> = ({ formula, index }) => {
  const fixes = useDocumentStore((s) => s.fixes);
  const addFix = useDocumentStore((s) => s.addFix);
  const acceptFix = useDocumentStore((s) => s.acceptFix);
  const rejectFix = useDocumentStore((s) => s.rejectFix);
  const fixingFormulaIds = useUIStore((s) => s.fixingFormulaIds);
  const { fixFormula } = useLLMFix();
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editedLatex, setEditedLatex] = useState('');

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

  const startEditing = () => {
    setEditedLatex(fix ? fix.fixedRaw : formula.raw);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setError(null);
  };

  const saveManualEdit = () => {
    try {
      const displayMode =
        formula.delimiterType === 'block-dollar' ||
        formula.delimiterType === 'block-bracket';
      const validation = validateLatexString(editedLatex, displayMode);

      const newFix: FormulaFix = {
        formulaId: formula.id,
        originalRaw: formula.raw,
        fixedRaw: editedLatex,
        fixedWithDelimiters: wrapWithDelimiters(
          editedLatex,
          formula.delimiterType
        ),
        fixedIsValid: validation.isValid,
        fixedErrorMessage: validation.errorMessage,
        status: 'pending',
        llmProvider: 'User',
        llmModel: 'Manual Edit',
      };

      addFix(formula.id, newFix);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  };

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
        style={{ color: tokens.colorNeutralForeground3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <span>
          #{index} &middot; Line {formula.lineNumber} &middot; {delimiterLabel}
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          {fix && !isEditing && (
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
          {!isEditing && (
            <Button
              size="small"
              appearance="transparent"
              icon={<EditRegular />}
              onClick={startEditing}
              title="Manual Edit"
            />
          )}
        </div>
      </div>

      <div className="error-card-body">
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Textarea
              value={editedLatex}
              onChange={(_, data) => setEditedLatex(data.value)}
              rows={3}
              style={{ fontFamily: 'monospace', width: '100%' }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button
                size="small"
                appearance="secondary"
                icon={<DismissRegular />}
                onClick={cancelEditing}
              >
                Cancel
              </Button>
              <Button
                size="small"
                appearance="primary"
                icon={<SaveRegular />}
                onClick={saveManualEdit}
              >
                Apply
              </Button>
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>

      {!isEditing && fix && <FormulaFixDiff formula={formula} fix={fix} />}

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
