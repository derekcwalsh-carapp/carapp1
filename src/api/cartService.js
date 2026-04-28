import client from './client.js';

export async function fetchCart() {
  const res = await client.get('/v1/cart');
  return res.data.data;
}

export async function addToCart(productId, quantity, acknowledgedRequiresMod = false) {
  const res = await client.post('/v1/cart/items', {
    productId,
    quantity,
    acknowledgedRequiresMod,
  });
  return res.data.data;
}

export async function updateCartItem(id, quantity) {
  const res = await client.put(`/v1/cart/items/${id}`, { quantity });
  return res.data.data;
}

export async function removeCartItem(id) {
  const res = await client.delete(`/v1/cart/items/${id}`);
  return res.data.data;
}
