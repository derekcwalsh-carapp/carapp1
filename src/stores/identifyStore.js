import { create } from 'zustand';
import { identifyPart } from '../api/identifyService';

const useIdentifyStore = create((set) => ({
  session: null,
  status: 'idle',
  result: null,
  error: null,

  startIdentify: async (photoUri, vehicle, crop) => {
    set({ status: 'loading', result: null, error: null, session: { photoUri, vehicle } });
    try {
      const result = await identifyPart(photoUri, vehicle, crop);
      set((state) => ({
        status: 'success',
        result,
        session: state.session
          ? { ...state.session, id: result.sessionId }
          : { photoUri, vehicle, id: result.sessionId },
      }));
    } catch (err) {
      set({ status: 'error', error: err?.message ?? 'Unknown error' });
    }
  },

  resolveWith: (partName) =>
    set((state) => ({ result: { ...state.result, partName } })),

  reset: () => set({ session: null, status: 'idle', result: null, error: null }),
}));

export default useIdentifyStore;
