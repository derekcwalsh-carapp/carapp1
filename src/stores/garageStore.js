import { create } from 'zustand';

const useGarageStore = create((set) => ({
  vehicles: [
    {
      id: 'v1',
      year: 1970,
      make: 'Chevrolet',
      model: 'Chevelle SS',
      trim: '454 V8 · 4-speed Manual',
      imageSource: require('../../assets/onboarding/slide1.png'),
    },
    {
      id: 'v2',
      year: 1968,
      make: 'Ford',
      model: 'Mustang Fastback',
      trim: '289 V8 · Automatic',
      imageSource: require('../../assets/onboarding/slide2.png'),
    },
  ],
  activeVehicleId: 'v1',

  addVehicle: (vehicle) =>
    set((state) => ({ vehicles: [...state.vehicles, vehicle] })),

  updateVehicle: (id, updates) =>
    set((state) => ({
      vehicles: state.vehicles.map((v) => (v.id === id ? { ...v, ...updates } : v)),
    })),

  deleteVehicle: (id) =>
    set((state) => ({
      vehicles: state.vehicles.filter((v) => v.id !== id),
      activeVehicleId: state.activeVehicleId === id ? null : state.activeVehicleId,
    })),

  setActive: (id) => set({ activeVehicleId: id }),
}));

export default useGarageStore;
