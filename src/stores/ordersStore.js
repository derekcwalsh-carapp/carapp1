import { create } from 'zustand';
import { fetchOrders as fetchOrdersApi, fetchOrder as fetchOrderApi } from '../api/ordersService';

const useOrdersStore = create((set, get) => ({
  orders: [],
  orderCache: {},
  status: 'idle',

  fetchOrders: async (filterStatus, cursor) => {
    set({ status: 'loading' });
    try {
      const orders = await fetchOrdersApi(filterStatus, cursor);
      set({ orders, status: 'success' });
    } catch {
      set({ status: 'error' });
    }
  },

  fetchOrder: async (id) => {
    if (!id) return null;
    const cached = get().orderCache[id];
    if (cached) return cached;
    try {
      const order = await fetchOrderApi(id);
      set((s) => ({ orderCache: { ...s.orderCache, [id]: order } }));
      return order;
    } catch {
      return null;
    }
  },

  byId: (id) => {
    if (!id) return null;
    return get().orderCache[id] ?? get().orders.find((o) => o.id === id) ?? null;
  },
}));

export default useOrdersStore;
