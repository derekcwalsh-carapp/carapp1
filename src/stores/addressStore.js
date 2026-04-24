import { create } from 'zustand';
import { fetchAddresses } from '../api/addressService';

const useAddressStore = create((set, get) => ({
  addresses: [],
  status: 'idle', // 'idle' | 'loading' | 'success' | 'error'

  fetchAddresses: async () => {
    if (get().status === 'loading') return;
    if (get().addresses.length > 0) {
      set({ status: 'success' });
      return;
    }
    set({ status: 'loading' });
    try {
      const addresses = await fetchAddresses();
      set({ addresses, status: 'success' });
    } catch {
      set({ status: 'error' });
    }
  },

  addAddress: (address) =>
    set((state) => {
      const id = `a${Date.now()}`;
      const isFirst = state.addresses.length === 0;
      const newAddress = { ...address, id, isDefault: address.isDefault || isFirst };
      const addresses = newAddress.isDefault
        ? [newAddress, ...state.addresses.map((a) => ({ ...a, isDefault: false }))]
        : [...state.addresses, newAddress];
      return { addresses };
    }),

  updateAddress: (id, address) =>
    set((state) => {
      const becomesDefault = !!address.isDefault;
      const addresses = state.addresses.map((a) => {
        if (a.id === id) return { ...a, ...address, id };
        return becomesDefault ? { ...a, isDefault: false } : a;
      });
      return { addresses };
    }),

  deleteAddress: (id) =>
    set((state) => {
      const removed = state.addresses.find((a) => a.id === id);
      let addresses = state.addresses.filter((a) => a.id !== id);
      if (removed?.isDefault && addresses.length > 0) {
        addresses = addresses.map((a, i) => ({ ...a, isDefault: i === 0 }));
      }
      return { addresses };
    }),

  setDefault: (id) =>
    set((state) => ({
      addresses: state.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
    })),
}));

export default useAddressStore;
