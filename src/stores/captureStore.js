import { create } from 'zustand';

const useCaptureStore = create((set) => ({
  photoUri: null,
  setPhoto: (uri) => set({ photoUri: uri }),
  reset: () => set({ photoUri: null }),
}));

export default useCaptureStore;
