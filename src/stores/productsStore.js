import { create } from 'zustand';
import { fetchGroupedResults } from '../api/productsService';

const useProductsStore = create((set, get) => ({
  groups: {},
  status: 'idle',

  fetchForSession: async (sessionId, vehicleId, intent) => {
    set({ status: 'loading', groups: {} });
    try {
      const groups = await fetchGroupedResults({ sessionId, vehicleId, intent });
      set({ status: 'success', groups });
    } catch {
      set({ status: 'error', groups: {} });
    }
  },

  byId: (id) => {
    const { groups } = get();
    for (const group of Object.values(groups)) {
      const found = group.products?.find((p) => p.id === id);
      if (found) return found;
    }
    return null;
  },
}));

export default useProductsStore;
