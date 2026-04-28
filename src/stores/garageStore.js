import { create } from 'zustand';
import * as garageService from '../api/garageService';

const useGarageStore = create((set, get) => ({
  vehicles: [],
  activeVehicleId: null,
  status: 'idle',
  error: null,

  fetchVehicles: async () => {
    set({ status: 'loading', error: null });
    try {
      const list = await garageService.fetchVehicles();
      const active = list.find((v) => v.isActive)?.id ?? null;
      set({
        vehicles: list,
        activeVehicleId: active,
        status: 'idle',
        error: null,
      });
    } catch (e) {
      set({
        status: 'error',
        error: e?.response?.data?.message || e?.message || 'Could not load garage.',
      });
    }
  },

  hydrate: async () => {
    await get().fetchVehicles();
  },

  addVehicle: async (vehicleData) => {
    const created = await garageService.addVehicle(vehicleData);
    set((state) => {
      const others = state.vehicles.map((v) => ({
        ...v,
        isActive: created.isActive ? false : v.isActive,
      }));
      return {
        vehicles: [...others, created],
        activeVehicleId: created.isActive ? created.id : state.activeVehicleId,
      };
    });
    return created;
  },

  updateVehicle: async (id, updates) => {
    const updated = await garageService.updateVehicle(id, updates);
    set((state) => ({
      vehicles: state.vehicles.map((v) => (v.id === id ? updated : v)),
    }));
    return updated;
  },

  deleteVehicle: async (id) => {
    await garageService.deleteVehicle(id);
    await get().fetchVehicles();
  },

  setActive: async (id) => {
    const updated = await garageService.setActiveVehicle(id);
    set((state) => ({
      vehicles: state.vehicles.map((v) =>
        v.id === updated.id ? updated : { ...v, isActive: false }
      ),
      activeVehicleId: updated.id,
    }));
    return updated;
  },
}));

export default useGarageStore;
