import React, { useMemo } from 'react';
import {
  Input,
  Button,
  Badge,
  tokens,
} from '@fluentui/react-components';
import {
  SearchRegular,
  CheckmarkCircleRegular,
  DismissCircleRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
} from '@fluentui/react-icons';
import { WrenchRegular } from '@fluentui/react-icons';
import { useLLMFix } from '../../hooks/useLLMFix';
import { FormulaErrorCard } from './FormulaErrorCard';
import { useDocumentStore } from '../../stores/documentStore';
import { useUIStore } from '../../stores/uiStore';

export const FormulaErrorList: React.FC = () => {
  const errors = useDocumentStore((s) => s.errors);
  const fixes = useDocumentStore((s) => s.fixes);
  const acceptAllFixes = useDocumentStore((s) => s.acceptAllFixes);
  const rejectAllFixes = useDocumentStore((s) => s.rejectAllFixes);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);
  const currentPage = useUIStore((s) => s.currentPage);
  const setCurrentPage = useUIStore((s) => s.setCurrentPage);
  const pageSize = useUIStore((s) => s.pageSize);

  const filteredErrors = useMemo(() => {
    if (!searchQuery) return errors;
    const query = searchQuery.toLowerCase();
    return errors.filter(
      (e) =>
        e.raw.toLowerCase().includes(query) ||
        (e.errorMessage && e.errorMessage.toLowerCase().includes(query))
    );
  }, [errors, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredErrors.length / pageSize));
  const paginatedErrors = filteredErrors.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const pendingFixCount = Object.values(fixes).filter(
    (f) => f.status === 'pending'
  ).length;
  const acceptedCount = Object.values(fixes).filter(
    (f) => f.status === 'accepted'
  ).length;
  const { fixAllFormulas } = useLLMFix();
  const unfixedErrors = errors.filter((e) => !fixes[e.id]);

  if (errors.length === 0) {
    return (
      <div
        className="empty-state"
        style={{ color: tokens.colorNeutralForeground3 }}
      >
        <CheckmarkCircleRegular
          style={{ fontSize: 48, color: tokens.colorPaletteGreenForeground1 }}
        />
        <p>No LaTeX errors found!</p>
      </div>
    );
  }

  return (
    <>
      <div
        className="error-list-header"
        style={{ backgroundColor: tokens.colorNeutralBackground2 }}
      >
        <Input
          placeholder="Search formulas or errors..."
          contentBefore={<SearchRegular />}
          value={searchQuery}
          onChange={(_, data) => setSearchQuery(data.value)}
          size="small"
        />
        <div className="error-list-actions">
          <Badge appearance="filled" color="danger">
            {errors.length} errors
          </Badge>
          <Button
            size="small"
            appearance="subtle"
            icon={<WrenchRegular />}
            onClick={async () => await fixAllFormulas(unfixedErrors)}
            disabled={unfixedErrors.length === 0}
            style={{ marginLeft: 8 }}
          >
            Fix All ({unfixedErrors.length})
          </Button>
          {acceptedCount > 0 && (
            <Badge appearance="filled" color="success">
              {acceptedCount} accepted
            </Badge>
          )}
          {pendingFixCount > 0 && (
            <>
              <Button
                size="small"
                appearance="primary"
                icon={<CheckmarkCircleRegular />}
                onClick={acceptAllFixes}
              >
                Accept All
              </Button>
              <Button
                size="small"
                appearance="secondary"
                icon={<DismissCircleRegular />}
                onClick={rejectAllFixes}
              >
                Reject All
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="error-list-body">
        {paginatedErrors.map((error) => (
          <FormulaErrorCard key={error.id} formula={error} />
        ))}
      </div>

      {totalPages > 1 && (
        <div
          className="error-list-footer"
          style={{ backgroundColor: tokens.colorNeutralBackground2 }}
        >
          <Button
            size="small"
            appearance="subtle"
            icon={<ChevronLeftRegular />}
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          />
          <span>
            {currentPage} / {totalPages}
          </span>
          <Button
            size="small"
            appearance="subtle"
            icon={<ChevronRightRegular />}
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          />
        </div>
      )}
    </>
  );
};
