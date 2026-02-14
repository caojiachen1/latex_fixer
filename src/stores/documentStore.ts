import { create } from 'zustand';
import type { Formula, FormulaFix } from '../services/latex/types';

interface DocumentState {
  // File
  filePath: string | null;
  originalContent: string;
  currentContent: string;

  // Load metadata
  loadId: number;

  // Parsed formulas
  formulas: Formula[];
  errors: Formula[];

  // Fixes (keyed by formula ID)
  fixes: Record<string, FormulaFix>;

  // Actions
  loadDocument: (path: string, content: string) => void;
  setFormulas: (formulas: Formula[]) => void;
  addFix: (formulaId: string, fix: FormulaFix) => void;
  acceptFix: (formulaId: string) => void;
  rejectFix: (formulaId: string) => void;
  acceptAllFixes: () => void;
  rejectAllFixes: () => void;
  applyAcceptedFixes: () => void;
  reset: () => void;
}

export const useDocumentStore = create<DocumentState>()((set, get) => ({
  filePath: null,
  originalContent: '',
  currentContent: '',
  formulas: [],
  errors: [],
  fixes: {},
  loadId: 0,

  loadDocument: (path, content) =>
    set((state) => ({
      filePath: path,
      originalContent: content,
      currentContent: content,
      formulas: [],
      errors: [],
      fixes: {},
      loadId: state.loadId + 1,
    })),

  setFormulas: (formulas) =>
    set({
      formulas,
      errors: formulas.filter((f) => !f.isValid),
    }),

  addFix: (formulaId, fix) =>
    set((state) => ({
      fixes: { ...state.fixes, [formulaId]: fix },
    })),

  acceptFix: (formulaId) =>
    set((state) => {
      const fix = state.fixes[formulaId];
      if (!fix) return state;
      return {
        fixes: {
          ...state.fixes,
          [formulaId]: { ...fix, status: 'accepted' },
        },
      };
    }),

  rejectFix: (formulaId) =>
    set((state) => {
      const fix = state.fixes[formulaId];
      if (!fix) return state;
      return {
        fixes: {
          ...state.fixes,
          [formulaId]: { ...fix, status: 'rejected' },
        },
      };
    }),

  acceptAllFixes: () =>
    set((state) => {
      const updated: Record<string, FormulaFix> = {};
      for (const [id, fix] of Object.entries(state.fixes)) {
        updated[id] = fix.status === 'pending' ? { ...fix, status: 'accepted' } : fix;
      }
      return { fixes: updated };
    }),

  rejectAllFixes: () =>
    set((state) => {
      const updated: Record<string, FormulaFix> = {};
      for (const [id, fix] of Object.entries(state.fixes)) {
        updated[id] = fix.status === 'pending' ? { ...fix, status: 'rejected' } : fix;
      }
      return { fixes: updated };
    }),

  applyAcceptedFixes: () => {
    const state = get();
    const acceptedFixes: { formula: Formula; fix: FormulaFix }[] = [];

    for (const error of state.errors) {
      const fix = state.fixes[error.id];
      if (fix && fix.status === 'accepted') {
        acceptedFixes.push({ formula: error, fix });
      }
    }

    // Sort by offset descending so replacements don't shift positions
    acceptedFixes.sort((a, b) => b.formula.startOffset - a.formula.startOffset);

    let content = state.originalContent;
    for (const { formula, fix } of acceptedFixes) {
      content =
        content.slice(0, formula.startOffset) +
        fix.fixedWithDelimiters +
        content.slice(formula.endOffset);
    }

    set({ currentContent: content });
  },

  reset: () =>
    set({
      filePath: null,
      originalContent: '',
      currentContent: '',
      formulas: [],
      errors: [],
      fixes: {},
      loadId: 0,
    }),
}));
