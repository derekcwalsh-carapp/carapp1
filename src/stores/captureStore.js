import { create } from 'zustand';

const useCaptureStore = create((set) => ({
  photoUri: null,
  crop: null,
  setPhoto: (uri) => set({ photoUri: uri }),
  setCrop: (crop) => set({ crop }),
  reset: () => set({ photoUri: null, crop: null }),
}));

export default useCaptureStore;
