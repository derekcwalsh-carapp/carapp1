import client from './client.js';

export function normalizeOrderSummary(api) {
  if (!api) return api;
  return {
    ...api,
    total: typeof api.total === 'number' ? api.total : (api.totalCents ?? 0) / 100,
    items: (api.items ?? []).map((it) => ({
      ...it,
      thumbnailUri: it.thumbnailUri ?? it.imageUri,
    })),
  };
}

export function normalizeOrderDetail(api) {
  if (!api) return api;
  const ship = api.shippingAddress ?? api.shipAddress ?? {};
  return {
    ...api,
    shippingAddress: {
      name: ship.name,
      line1: ship.line1,
      line2: ship.line2,
      city: ship.city,
      state: ship.state,
      zip: ship.zip,
      country: ship.country,
    },
    subtotal:
      typeof api.subtotal === 'number' ? api.subtotal : (api.subtotalCents ?? 0) / 100,
    shipping:
      typeof api.shipping === 'number' ? api.shipping : (api.shippingCents ?? 0) / 100,
    tax: typeof api.tax === 'number' ? api.tax : (api.taxCents ?? 0) / 100,
    total: typeof api.total === 'number' ? api.total : (api.totalCents ?? 0) / 100,
    items: (api.items ?? []).map((i) => ({
      ...i,
      thumbnailUri: i.thumbnailUri ?? i.imageUri,
      price:
        typeof i.price === 'number'
          ? i.price
          : i.priceCents != null
            ? i.priceCents / 100
            : 0,
    })),
  };
}

export const fetchOrders = (status, cursor) =>
  client
    .get('/v1/orders', { params: { status, cursor } })
    .then((r) => (r.data.data || []).map(normalizeOrderSummary));

export const fetchOrder = (id) =>
  client.get(`/v1/orders/${id}`).then((r) => normalizeOrderDetail(r.data.data));

export const createOrder = (cart, address, payment) =>
  client
    .post('/v1/checkout', {
      addressId: address?.id,
      paymentMethodId: payment?.id,
    })
    .then((r) => r.data.data);
