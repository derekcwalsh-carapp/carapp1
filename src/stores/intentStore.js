import { create } from 'zustand';

const useIntentStore = create((set) => ({
  type: 'replacement',
  preference: 'oem_style',
  setType: (type) => set({ type }),
  setPreference: (preference) => set({ preference }),
  reset: () => set({ type: 'replacement', preference: 'oem_style' }),
}));

export default useIntentStore;
