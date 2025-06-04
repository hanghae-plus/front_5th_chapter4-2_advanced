import { create } from "zustand";

type SearchInfo = {
  tableId: string;
  day?: string;
  time?: number;
} | null;

interface SearchState {
  searchInfo: SearchInfo;
  setSearchInfo: (info: SearchInfo) => void;
  resetSearchInfo: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  searchInfo: null,
  setSearchInfo: (info) => set({ searchInfo: info }),
  resetSearchInfo: () => set({ searchInfo: null }),
}));