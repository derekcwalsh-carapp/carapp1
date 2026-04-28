import client from './client.js';

export const fetchWatchlist = () =>
  client.get('/v1/watchlist').then((r) => r.data.data);

export const addToWatchlist = (productId, targetPriceCents) =>
  client
    .post(`/v1/watchlist/${productId}`, { targetPriceCents })
    .then((r) => r.data.data);

export const removeFromWatchlist = (productId) =>
  client.delete(`/v1/watchlist/${productId}`).then((r) => r.data.data);

export const updateTargetPrice = (productId, targetPriceCents) =>
  client
    .patch(`/v1/watchlist/${productId}`, { targetPriceCents })
    .then((r) => r.data.data);
