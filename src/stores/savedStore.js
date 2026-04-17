import { create } from 'zustand';

const useSavedStore = create((set, get) => ({
  savedIds: [],

  toggleSave: (id) => {
    const { savedIds } = get();
    set({
      savedIds: savedIds.includes(id)
        ? savedIds.filter((s) => s !== id)
        : [...savedIds, id],
    });
  },

  isSaved: (id) => get().savedIds.includes(id),
}));

export default useSavedStore;
