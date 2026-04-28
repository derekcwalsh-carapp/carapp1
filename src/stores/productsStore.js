import { create } from 'zustand';
import {
  fetchGroupedResults,
  fetchProduct as fetchProductApi,
  mapProduct,
} from '../api/productsService';

const useProductsStore = create((set, get) => ({
  groups: {},
  status: 'idle',
  cache: {},

  fetchForSession: async (sessionId, vehicleId, intentOptions = {}) => {
    set({ status: 'loading', groups: {} });
    try {
      const params = {
        sessionId,
        vehicleId,
        intent: intentOptions.intent,
        preference: intentOptions.preference,
      };
      const groups = await fetchGroupedResults(params);
      set((state) => {
        const cache = { ...state.cache };
        for (const g of Object.values(groups)) {
          for (const p of g.products || []) {
            if (p?.id) cache[p.id] = mapProduct(p);
          }
        }
        return { status: 'success', groups, cache };
      });
    } catch {
      set({ status: 'error', groups: {} });
    }
  },

  byId: (id) => {
    if (!id) return null;
    return get().cache[id] ?? null;
  },

  fetchProduct: async (id, options = {}) => {
    if (!id) return null;
    const cached = get().cache[id];
    if (cached) return cached;
    try {
      const data = await fetchProductApi(id, options);
      set((s) => ({ cache: { ...s.cache, [id]: data } }));
      return data;
    } catch {
      return null;
    }
  },
}));

export default useProductsStore;
