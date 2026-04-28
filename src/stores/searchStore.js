import { create } from 'zustand';
import {
  fetchRecentSearches as fetchRecentFromApi,
  deleteRecentSearch as deleteRecentApi,
  clearRecentSearches as clearRecentApi,
} from '../api/searchService';

const useSearchStore = create((set, get) => ({
  query: '',
  recentQueries: [],

  setQuery: (query) => set({ query }),

  addRecent: (q) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    const prev = get().recentQueries.filter((r) => r !== trimmed);
    const next = [trimmed, ...prev].slice(0, 10);
    set({ recentQueries: next });
  },

  removeRecent: async (q) => {
    try {
      await deleteRecentApi(q);
    } catch (_) {
      /* ignore */
    }
    const next = get().recentQueries.filter((r) => r !== q);
    set({ recentQueries: next });
  },

  clearRecent: async () => {
    try {
      await clearRecentApi();
    } catch (_) {
      /* ignore */
    }
    set({ recentQueries: [] });
  },

  hydrate: async () => {
    try {
      const rows = await fetchRecentFromApi();
      const queries = Array.isArray(rows)
        ? rows
            .map((r) => (typeof r === 'string' ? r : r?.query))
            .filter(Boolean)
            .slice(0, 10)
        : [];
      set({ recentQueries: queries });
    } catch (_) {
      set({ recentQueries: [] });
    }
  },
}));

export default useSearchStore;
