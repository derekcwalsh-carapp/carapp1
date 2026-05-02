import { create } from 'zustand';
import {
  fetchPaymentMethods,
  deletePaymentMethod,
  setDefaultPaymentMethod,
} from '../api/paymentService';

const usePaymentStore = create((set, get) => ({
  methods: [],
  status: 'idle', // 'idle' | 'loading' | 'success' | 'error'

  /** Call on sign-out and before attaching a new session — never retain prior user's payment data in memory. */
  reset: () => set({ methods: [], status: 'idle' }),

  fetchMethods: async () => {
    if (get().status === 'loading') return;
    set({ status: 'loading' });
    try {
      const methods = await fetchPaymentMethods();
      set({ methods, status: 'success' });
    } catch {
      set({ status: 'error' });
    }
  },

  addMethod: (pm) =>
    set((state) => ({
      methods: [...state.methods, pm],
    })),

  deleteMethod: async (id) => {
    await deletePaymentMethod(id);
    set((state) => {
      const removed = state.methods.find((m) => m.id === id);
      let methods = state.methods.filter((m) => m.id !== id);
      if (removed?.isDefault && methods.length > 0) {
        methods = methods.map((m, i) => ({ ...m, isDefault: i === 0 }));
      }
      return { methods };
    });
  },

  setDefault: async (id) => {
    await setDefaultPaymentMethod(id);
    set((state) => ({
      methods: state.methods.map((m) => ({ ...m, isDefault: m.id === id })),
    }));
  },
}));

export default usePaymentStore;
