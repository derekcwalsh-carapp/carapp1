import { create } from 'zustand';

const useGarageStore = create((set) => ({
  vehicles: [],
  activeVehicleId: null,

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
