import { create } from 'zustand';

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

const useCartStore = create((set, get) => ({
  items: [],
  itemCount: 0,
  subtotal: 0,
  tax: 0,
  total: 0,

  addItem: (product, qty = 1) => {
    const items = get().items;
    const existing = items.find((i) => i.id === product.id);
    const newItems = existing
      ? items.map((i) => (i.id === product.id ? { ...i, qty: i.qty + qty } : i))
      : [...items, { ...product, qty }];
    set({ items: newItems, ...recompute(newItems) });
  },

  removeItem: (id) => {
    const newItems = get().items.filter((i) => i.id !== id);
    set({ items: newItems, ...recompute(newItems) });
  },

  updateQty: (id, qty) => {
    if (qty <= 0) { get().removeItem(id); return; }
    const newItems = get().items.map((i) => (i.id === id ? { ...i, qty } : i));
    set({ items: newItems, ...recompute(newItems) });
  },

  clear: () => set({ items: [], ...recompute([]) }),
}));

export default useCartStore;
