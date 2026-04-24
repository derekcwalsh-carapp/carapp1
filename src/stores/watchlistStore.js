import { create } from 'zustand';
import {
  fetchWatchlist as apiFetch,
  addToWatchlist as apiAdd,
  removeFromWatchlist as apiRemove,
} from '../api/watchlistService';

const useWatchlistStore = create((set, get) => ({
  watchedItems: [],
  productsCache: {},
  status: 'idle',

  fetchWatchlist: async () => {
    set({ status: 'loading' });
    try {
      const raw = await apiFetch();
      const productsCache = {};
      const watchedItems = raw.map(({ product, ...item }) => {
        if (product) productsCache[item.productId] = product;
        return item;
      });
      set({ watchedItems, productsCache, status: 'success' });
    } catch {
      set({ status: 'error' });
    }
  },

  addToWatchlist: async (productId, targetPriceCents) => {
    await apiAdd(productId, targetPriceCents);
    get().fetchWatchlist();
  },

  removeFromWatchlist: async (productId) => {
    set((s) => ({
      watchedItems: s.watchedItems.filter((i) => i.productId !== productId),
    }));
    apiRemove(productId);
  },

  setTargetPrice: (productId, priceCents) => {
    set((s) => ({
      watchedItems: s.watchedItems.map((i) =>
        i.productId === productId ? { ...i, targetPriceCents: priceCents } : i
      ),
    }));
  },
}));

export default useWatchlistStore;
