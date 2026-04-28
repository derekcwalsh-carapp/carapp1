import client from './client.js';

export const fetchAddresses = () =>
  client.get('/v1/addresses').then((r) => r.data.data);

export const createAddress = (address) =>
  client.post('/v1/addresses', address).then((r) => r.data.data);

export const updateAddress = (id, address) =>
  client.put(`/v1/addresses/${id}`, address).then((r) => r.data.data);

export const deleteAddress = (id) =>
  client.delete(`/v1/addresses/${id}`).then((r) => r.data.data);

export const setDefaultAddress = (id) =>
  client.patch(`/v1/addresses/${id}/default`).then((r) => r.data.data);
