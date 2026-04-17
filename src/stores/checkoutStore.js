import { create } from 'zustand';
import { createOrder } from '../api/ordersService';

const MOCK_ADDRESS = {
  name: 'Mike Sullivan',
  line1: '1420 Oak Street',
  city: 'Austin',
  state: 'TX',
  zip: '78704',
};

const MOCK_PAYMENT = { type: 'visa', last4: '4242' };

const useCheckoutStore = create((set, get) => ({
  address: MOCK_ADDRESS,
  paymentMethod: MOCK_PAYMENT,
  placing: false,
  order: null,

  placeOrder: async (cart) => {
    if (get().placing) return;
    set({ placing: true, order: null });
    try {
      const order = await createOrder(cart, get().address, get().paymentMethod);
      set({ order, placing: false });
    } catch {
      set({ placing: false });
    }
  },

  reset: () => set({ placing: false, order: null }),
}));

export default useCheckoutStore;
