import { create } from 'zustand';

const useUpgradeModalStore = create((set) => ({
  visible: false,
  feature: null,
  show: (feature) => set({ visible: true, feature }),
  hide: () => set({ visible: false }),
}));

export default useUpgradeModalStore;
