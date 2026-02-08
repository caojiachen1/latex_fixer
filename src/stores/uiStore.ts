import { create } from 'zustand';

interface UIState {
  isLoading: boolean;
  loadingMessage: string;
  isSettingsOpen: boolean;
  searchQuery: string;
  currentPage: number;
  pageSize: number;
  fixingFormulaIds: Set<string>;
  isMarkdownVisible: boolean;
  sidebarWidth: number;
  markdownWidth: number;

  setLoading: (loading: boolean, message?: string) => void;
  setSettingsOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  addFixingFormula: (id: string) => void;
  removeFixingFormula: (id: string) => void;
  setMarkdownVisible: (visible: boolean) => void;
  setSidebarWidth: (width: number) => void;
  setMarkdownWidth: (width: number) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isLoading: false,
  loadingMessage: '',
  isSettingsOpen: false,
  searchQuery: '',
  currentPage: 1,
  pageSize: 20,
  fixingFormulaIds: new Set(),
  isMarkdownVisible: true,
  sidebarWidth: 220,
  markdownWidth: 500,

  setLoading: (loading, message = '') =>
    set({ isLoading: loading, loadingMessage: message }),

  setSettingsOpen: (open) => set({ isSettingsOpen: open }),

  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),

  setCurrentPage: (page) => set({ currentPage: page }),

  addFixingFormula: (id) =>
    set((state) => {
      const next = new Set(state.fixingFormulaIds);
      next.add(id);
      return { fixingFormulaIds: next };
    }),

  removeFixingFormula: (id) =>
    set((state) => {
      const next = new Set(state.fixingFormulaIds);
      next.delete(id);
      return { fixingFormulaIds: next };
    }),

  setMarkdownVisible: (visible) => set({ isMarkdownVisible: visible }),

  setSidebarWidth: (width) => set({ sidebarWidth: Math.max(150, Math.min(width, 500)) }),

  setMarkdownWidth: (width) => set({ markdownWidth: Math.max(200, Math.min(width, 1000)) }),
}));
