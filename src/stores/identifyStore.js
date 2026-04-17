import { create } from 'zustand';
import { identifyPart } from '../api/identifyService';

const useIdentifyStore = create((set) => ({
  session: null,
  status: 'idle',
  result: null,
  error: null,

  startIdentify: async (photoUri, vehicle) => {
    set({ status: 'loading', result: null, error: null, session: { photoUri, vehicle } });
    try {
      const result = await identifyPart(photoUri, vehicle);
      set({ status: 'success', result });
    } catch (err) {
      set({ status: 'error', error: err?.message ?? 'Unknown error' });
    }
  },

  reset: () => set({ session: null, status: 'idle', result: null, error: null }),
}));

export default useIdentifyStore;
