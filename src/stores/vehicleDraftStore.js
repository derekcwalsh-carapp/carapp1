import { create } from 'zustand';

const useVehicleDraftStore = create((set) => ({
  year: null,
  make: null,
  model: null,
  trim: null,
  engine: null,
  transmission: null,
  modsNotes: '',

  setField: (field, value) => set({ [field]: value }),

  reset: () =>
    set({
      year: null,
      make: null,
      model: null,
      trim: null,
      engine: null,
      transmission: null,
      modsNotes: '',
    }),
}));

export default useVehicleDraftStore;
