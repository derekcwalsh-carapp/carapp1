import { create } from 'zustand';

const DEMO_SAVED = [
  {
    id: 'sv1',
    supplier: 'Holley',
    title: 'Holley 600 CFM Carburetor',
    price: 389,
    imageUri: 'https://picsum.photos/seed/holley600cfm/400/400',
    fitmentLabel: 'confirmed',
    vehicleId: 'v1',
  },
  {
    id: 'sv2',
    supplier: 'Speed Pro',
    title: 'Chrome Valve Covers',
    price: 145,
    imageUri: 'https://picsum.photos/seed/chromevalve/400/400',
    fitmentLabel: 'confirmed',
    vehicleId: 'v1',
  },
  {
    id: 'sv3',
    supplier: 'Chevrolet',
    title: 'Original Bowtie Emblem',
    price: 52,
    imageUri: 'https://picsum.photos/seed/bowtieemblem/400/400',
    fitmentLabel: 'confirmed',
    vehicleId: 'v2',
  },
  {
    id: 'sv4',
    supplier: 'Classic Industries',
    title: 'Tail Light Lens Set',
    price: 98,
    imageUri: 'https://picsum.photos/seed/taillightset/400/400',
    fitmentLabel: 'confirmed',
    vehicleId: 'v2',
  },
];

const useSavedStore = create((set, get) => ({
  savedItems: DEMO_SAVED,

  // product: full product object when adding, string id when removing is also accepted
  // vehicleId: the active vehicle id at the time of saving
  toggleSave: (product, vehicleId) => {
    const { savedItems } = get();
    const id = typeof product === 'string' ? product : product?.id;
    const exists = savedItems.some((p) => p.id === id);
    if (exists) {
      set({ savedItems: savedItems.filter((p) => p.id !== id) });
    } else if (product && typeof product === 'object') {
      const snapshot = vehicleId ? { ...product, vehicleId } : product;
      set({ savedItems: [...savedItems, snapshot] });
    }
  },

  isSaved: (id) => get().savedItems.some((p) => p.id === id),
}));

export default useSavedStore;
