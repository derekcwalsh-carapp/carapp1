import { create } from 'zustand';
import * as cartService from '../api/cartService';
import { mapProduct } from '../api/productsService';

const TAX_RATE = 0.06;

const recompute = (items) => {
  const subtotal = items.reduce((sum, i) => sum + (i.price ?? 0) * i.qty, 0);
  const tax = subtotal * TAX_RATE;
  return {
    itemCount: items.reduce((sum, i) => sum + i.qty, 0),
    subtotal,
    tax,
    total: subtotal + tax,
  };
};

export function serverCartToLocalFormat(serverCart) {
  if (!serverCart) {
    return {
      cartId: null,
      items: [],
      itemCount: 0,
      subtotal: 0,
      tax: 0,
      total: 0,
    };
  }
  const items = (serverCart.items || []).map((item) => ({
    id: item.id,
    productId: item.productId,
    title: item.title,
    supplier: item.supplier,
    price: item.priceCents / 100,
    priceCents: item.priceCents,
    currency: item.currency,
    imageUri: item.imageUri,
    qty: item.quantity,
    fitmentLabel: item.fitmentLabel,
    fitmentNotes: item.fitmentNotes,
    acknowledgedRequiresMod: item.acknowledgedRequiresMod,
  }));
  return {
    cartId: serverCart.cartId,
    items,
    itemCount: items.reduce((sum, i) => sum + i.qty, 0),
    subtotal: serverCart.subtotalCents / 100,
    tax: serverCart.taxCents / 100,
    total: serverCart.totalCents / 100,
    shippingCents: serverCart.shippingCents,
  };
}

function applyServerCartPayload(data, set) {
  if (data?.requiresModConfirmation) return;
  const local = serverCartToLocalFormat(data);
  set({
    items: local.items,
    itemCount: local.itemCount,
    subtotal: local.subtotal,
    tax: local.tax,
    total: local.total,
    cartId: local.cartId,
    serverSynced: true,
    requiresModProduct: null,
  });
}

const useCartStore = create((set, get) => ({
  items: [],
  itemCount: 0,
  subtotal: 0,
  tax: 0,
  total: 0,
  cartId: null,
  serverSynced: false,
  requiresModProduct: null,

  syncCart: async () => {
    try {
      const data = await cartService.fetchCart();
      applyServerCartPayload(data, set);
    } catch {
      set({ serverSynced: false });
    }
  },

  addItem: async (product, qty = 1, acknowledgedRequiresMod = false) => {
    const mapped = mapProduct(product);
    const productId = mapped.productId ?? mapped.id;
    const items = get().items;
    const existing = items.find(
      (i) => i.productId === productId || (!i.productId && i.id === productId),
    );
    const optimisticItems = existing
      ? items.map((i) =>
          i.productId === productId || (!i.productId && i.id === productId)
            ? { ...i, qty: i.qty + qty }
            : i,
        )
      : [
          ...items,
          {
            ...mapped,
            id: productId,
            productId,
            qty,
          },
        ];
    set({ items: optimisticItems, ...recompute(optimisticItems), serverSynced: false });

    try {
      const data = await cartService.addToCart(productId, qty, acknowledgedRequiresMod);
      if (data.requiresModConfirmation) {
        await get().syncCart();
        set({ requiresModProduct: data.product });
        return;
      }
      applyServerCartPayload(data, set);
    } catch {
      await get().syncCart();
    }
  },

  removeItem: async (id) => {
    const prev = get().items;
    const newItems = prev.filter((i) => i.id !== id);
    set({ items: newItems, ...recompute(newItems), serverSynced: false });
    try {
      const data = await cartService.removeCartItem(id);
      applyServerCartPayload(data, set);
    } catch {
      set({ items: prev, ...recompute(prev) });
    }
  },

  updateQty: async (id, qty) => {
    if (qty <= 0) {
      await get().removeItem(id);
      return;
    }
    const prev = get().items;
    const newItems = prev.map((i) => (i.id === id ? { ...i, qty } : i));
    set({ items: newItems, ...recompute(newItems), serverSynced: false });
    try {
      const data = await cartService.updateCartItem(id, qty);
      applyServerCartPayload(data, set);
    } catch {
      set({ items: prev, ...recompute(prev) });
    }
  },

  clear: () =>
    set({
      items: [],
      itemCount: 0,
      subtotal: 0,
      tax: 0,
      total: 0,
      cartId: null,
      serverSynced: false,
      requiresModProduct: null,
    }),
}));

export default useCartStore;
