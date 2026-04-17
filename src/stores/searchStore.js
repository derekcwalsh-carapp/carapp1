import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@carlens/recent_queries';

const useSearchStore = create((set, get) => ({
  query: '',
  recentQueries: [],

  setQuery: (query) => set({ query }),

  addRecent: async (q) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    const prev = get().recentQueries.filter((r) => r !== trimmed);
    const next = [trimmed, ...prev].slice(0, 10);
    set({ recentQueries: next });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  },

  removeRecent: async (q) => {
    const next = get().recentQueries.filter((r) => r !== q);
    set({ recentQueries: next });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  },

  clearRecent: async () => {
    set({ recentQueries: [] });
    await AsyncStorage.removeItem(STORAGE_KEY);
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) set({ recentQueries: JSON.parse(raw) });
    } catch (_) {}
  },
}));

export default useSearchStore;
