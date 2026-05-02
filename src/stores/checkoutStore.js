import { create } from 'zustand';
import { fetchProfile } from '../api/profileService';
import {
  fetchAddresses,
  fetchPaymentMethods,
  createCheckout,
} from '../api/checkoutService';

const useCheckoutStore = create((set, get) => ({
  address: null,
  paymentMethod: null,
  addresses: [],
  paymentMethods: [],
  checkoutLoadStatus: 'idle',
  checkoutError: null,
  placing: false,
  order: null,

  fetchCheckoutData: async () => {
    set({ checkoutLoadStatus: 'loading', checkoutError: null });
    try {
      const [, addresses, paymentMethods] = await Promise.all([
        fetchProfile(),
        fetchAddresses(),
        fetchPaymentMethods(),
      ]);
      const defaultAddr =
        addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;
      const defaultPm =
        paymentMethods.find((p) => p.isDefault) ?? paymentMethods[0] ?? null;
      set({
        addresses,
        paymentMethods,
        address: defaultAddr,
        paymentMethod: defaultPm,
        checkoutLoadStatus: 'success',
        checkoutError: null,
      });
    } catch (err) {
      set({
        checkoutLoadStatus: 'error',
        checkoutError: err?.message ?? 'Failed to load checkout',
      });
    }
  },

  placeOrder: async () => {
    const { address, paymentMethod } = get();
    if (!address?.id || !paymentMethod?.id) return;
    if (get().placing) return;
    set({ placing: true, order: null });
    try {
      const data = await createCheckout(address.id, paymentMethod.id);
      set({
        order: {
          id: data.orderId,
          orderNumber: data.orderNumber,
          status: data.status,
          totalCents: data.totalCents,
        },
        placing: false,
      });
    } catch {
      set({ placing: false });
    }
  },

  selectAddress: (addressId) =>
    set((state) => {
      const selected = state.addresses.find((a) => a.id === addressId) ?? null;
      return { address: selected };
    }),

  selectPaymentMethod: (paymentMethodId) =>
    set((state) => {
      const selected =
        state.paymentMethods.find((method) => method.id === paymentMethodId) ?? null;
      return { paymentMethod: selected };
    }),

  reset: () =>
    set({
      placing: false,
      order: null,
      checkoutLoadStatus: 'idle',
      checkoutError: null,
    }),
}));

export default useCheckoutStore;
