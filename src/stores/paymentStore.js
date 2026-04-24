import { create } from 'zustand';
import { fetchPaymentMethods } from '../api/paymentService';

const usePaymentStore = create((set, get) => ({
  methods: [],
  status: 'idle', // 'idle' | 'loading' | 'success' | 'error'

  fetchMethods: async () => {
    if (get().status === 'loading') return;
    if (get().methods.length > 0) {
      set({ status: 'success' });
      return;
    }
    set({ status: 'loading' });
    try {
      const methods = await fetchPaymentMethods();
      set({ methods, status: 'success' });
    } catch {
      set({ status: 'error' });
    }
  },

  deleteMethod: (id) =>
    set((state) => {
      const removed = state.methods.find((m) => m.id === id);
      let methods = state.methods.filter((m) => m.id !== id);
      if (removed?.isDefault && methods.length > 0) {
        methods = methods.map((m, i) => ({ ...m, isDefault: i === 0 }));
      }
      return { methods };
    }),

  setDefault: (id) =>
    set((state) => ({
      methods: state.methods.map((m) => ({ ...m, isDefault: m.id === id })),
    })),
}));

export default usePaymentStore;
