import { AssetPreview, AssetSource } from "@shared/types";
import { create } from "zustand";

interface SearchState {
  query: string;
  source: AssetSource;
  results: AssetPreview[];
  loading: boolean;
  error: Error | null;
  scroll: { x: number; y: number };
  setQuery: (query: string) => void;
  setSource: (source: AssetSource) => void;
  setResults: (results: AssetPreview[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setScroll: (scroll: { x: number; y: number }) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: "",
  source: "kenney.nl",
  results: [],
  loading: false,
  error: null,
  scroll: { x: 0, y: 0 },

  setQuery: (query) => set({ query }),
  setSource: (source) => set({ source }),
  setResults: (results) => set({ results }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setScroll: (scroll) => set({ scroll })
}));
