import { create } from 'zustand';
import { fetchOrders } from '../api/ordersService';

const useOrdersStore = create((set, get) => ({
  orders: [],
  status: 'idle', // 'idle' | 'loading' | 'success' | 'error'

  fetchOrders: async () => {
    if (get().status === 'loading') return;
    set({ status: 'loading' });
    try {
      const orders = await fetchOrders();
      set({ orders, status: 'success' });
    } catch {
      set({ status: 'error' });
    }
  },

  byId: (id) => get().orders.find((o) => o.id === id),
}));

export default useOrdersStore;
