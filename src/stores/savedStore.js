import { create } from 'zustand';
import * as savedService from '../api/savedService';

/** Flatten API saved row into a product-shaped object for ProductCard / navigation */
function flattenSaved(entry) {
  const p = entry.product || {};
  const productId = p.id ?? entry.productId;
  return {
    id: productId,
    savedItemId: entry.id,
    productId,
    title: p.title,
    supplier: p.supplier,
    price:
      typeof p.price === 'number'
        ? p.price
        : p.priceCents != null
          ? p.priceCents / 100
          : undefined,
    priceCents: p.priceCents,
    imageUri: p.imageUri,
    fitmentLabel: p.fitmentLabel,
    rating: p.rating,
    vehicleId: entry.vehicleId,
    createdAt: entry.createdAt,
  };
}

const useSavedStore = create((set, get) => ({
  savedItems: [],
  status: 'idle',

  fetchSavedItems: async (vehicleId) => {
    set({ status: 'loading' });
    try {
      const rows = await savedService.fetchSaved(vehicleId);
      const savedItems = (rows ?? []).map(flattenSaved);
      set({ savedItems, status: 'success' });
    } catch {
      set({ status: 'error' });
    }
  },

  toggleSave: async (product, vehicleId) => {
    const id =
      typeof product === 'string' ? product : product?.id ?? product?.productId;
    if (!id) return;

    const { savedItems } = get();
    const exists = savedItems.some((p) => p.id === id);
    const prevSnapshot = savedItems;

    if (exists) {
      set({ savedItems: savedItems.filter((p) => p.id !== id) });
      try {
        await savedService.unsaveProduct(id);
        await get().fetchSavedItems();
      } catch {
        set({ savedItems: prevSnapshot });
      }
      return;
    }

    if (product && typeof product === 'object') {
      const optimistic = {
        id,
        productId: id,
        title: product.title,
        supplier: product.supplier,
        price: product.price,
        priceCents: product.priceCents,
        imageUri: product.imageUri,
        fitmentLabel: product.fitmentLabel,
        rating: product.rating,
        vehicleId,
      };
      set({ savedItems: [...savedItems, optimistic] });
      try {
        await savedService.saveProduct(id);
        await get().fetchSavedItems();
      } catch {
        set({ savedItems: prevSnapshot });
      }
    }
  },

  isSaved: (pid) => get().savedItems.some((p) => p.id === pid),
}));

export default useSavedStore;
