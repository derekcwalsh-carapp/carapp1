import client from './client.js';

export const fetchSaved = (vehicleId) =>
  client
    .get('/v1/saved', { params: vehicleId ? { vehicleId } : undefined })
    .then((r) => r.data.data);

export const saveProduct = (productId) =>
  client.post(`/v1/saved/${productId}`).then((r) => r.data.data);

export const unsaveProduct = (productId) =>
  client.delete(`/v1/saved/${productId}`).then((r) => r.data.data);
