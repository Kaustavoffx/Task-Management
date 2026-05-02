import { create } from 'zustand';

interface UiState {
  viewMode: 'table' | 'kanban';
  setViewMode: (mode: 'table' | 'kanban') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  viewMode: 'kanban', // Default to Kanban
  setViewMode: (mode) => set({ viewMode: mode }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
