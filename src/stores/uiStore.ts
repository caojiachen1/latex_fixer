import { create } from 'zustand';

interface UIState {
  isLoading: boolean;
  loadingMessage: string;
  isSettingsOpen: boolean;
  isAboutOpen: boolean;
  searchQuery: string;
  currentPage: number;
  pageSize: number;
  fixingFormulaIds: Set<string>;
  isMarkdownVisible: boolean;
  isLeftPanelVisible: boolean;
  isRightPanelVisible: boolean;
  sidebarWidth: number;
  markdownWidth: number;
  selectedErrorId: string | null;

  setLoading: (loading: boolean, message?: string) => void;
  setSettingsOpen: (open: boolean) => void;
  setAboutOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  addFixingFormula: (id: string) => void;
  removeFixingFormula: (id: string) => void;
  setMarkdownVisible: (visible: boolean) => void;
  setLeftPanelVisible: (visible: boolean) => void;
  setRightPanelVisible: (visible: boolean) => void;
  setSidebarWidth: (width: number) => void;
  setMarkdownWidth: (width: number) => void;
  setSelectedErrorId: (id: string | null) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isLoading: false,
  loadingMessage: '',
  isSettingsOpen: false,
  isAboutOpen: false,
  searchQuery: '',
  currentPage: 1,
  pageSize: 20,
  fixingFormulaIds: new Set(),
  isMarkdownVisible: true,
  isLeftPanelVisible: true,
  isRightPanelVisible: true,
  sidebarWidth: 220,
  markdownWidth: 500,
  selectedErrorId: null,

  setLoading: (loading, message = '') =>
    set({ isLoading: loading, loadingMessage: message }),

  setSettingsOpen: (open) => set({ isSettingsOpen: open }),

  setAboutOpen: (open) => set({ isAboutOpen: open }),

  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),

  setCurrentPage: (page) => set({ currentPage: page }),

  setSelectedErrorId: (id) => set({ selectedErrorId: id }),

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

  setLeftPanelVisible: (visible) => set({ isLeftPanelVisible: visible }),

  setRightPanelVisible: (visible) => set({ isRightPanelVisible: visible }),

  setSidebarWidth: (width) => set({ sidebarWidth: Math.max(150, Math.min(width, 500)) }),

  setMarkdownWidth: (width) => set({ markdownWidth: Math.max(200, Math.min(width, 1000)) }),
}));
