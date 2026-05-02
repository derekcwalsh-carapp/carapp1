import { create } from 'zustand';
import {
  fetchAddresses as fetchAddressesApi,
  createAddress as createAddressApi,
  updateAddress as updateAddressApi,
  deleteAddress as deleteAddressApi,
  setDefaultAddress as setDefaultAddressApi,
} from '../api/addressService';

const useAddressStore = create((set, get) => ({
  addresses: [],
  status: 'idle', // 'idle' | 'loading' | 'success' | 'error'

  reset: () => set({ addresses: [], status: 'idle' }),

  fetchAddresses: async () => {
    if (get().status === 'loading') return;
    set({ status: 'loading' });
    try {
      const addresses = await fetchAddressesApi();
      set({ addresses, status: 'success' });
    } catch {
      set({ status: 'error' });
      throw new Error('Could not load addresses.');
    }
  },

  addAddress: async (address) => {
    const created = await createAddressApi(address);
    set((state) => {
      const addresses = created.isDefault
        ? [created, ...state.addresses.map((a) => ({ ...a, isDefault: false }))]
        : [...state.addresses, created];
      return { addresses };
    });
    return created;
  },

  updateAddress: async (id, address) => {
    const updated = await updateAddressApi(id, address);
    set((state) => {
      const addresses = state.addresses.map((a) => {
        if (a.id === id) return updated;
        return updated.isDefault ? { ...a, isDefault: false } : a;
      });
      return { addresses };
    });
    return updated;
  },

  deleteAddress: async (id) => {
    await deleteAddressApi(id);
    set((state) => {
      const removed = state.addresses.find((a) => a.id === id);
      let addresses = state.addresses.filter((a) => a.id !== id);
      if (removed?.isDefault && addresses.length > 0) {
        addresses = addresses.map((a, i) => ({ ...a, isDefault: i === 0 }));
      }
      return { addresses };
    });
  },

  setDefault: async (id) => {
    const updated = await setDefaultAddressApi(id);
    set((state) => ({
      addresses: state.addresses.map((a) => ({ ...a, isDefault: a.id === updated.id })),
    }));
    return updated;
  },
}));

export default useAddressStore;
