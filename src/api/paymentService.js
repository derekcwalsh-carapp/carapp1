import client from './client.js';

export const fetchPaymentMethods = () =>
  client.get('/v1/payment-methods').then((r) => r.data.data);

export const deletePaymentMethod = (id) =>
  client.delete(`/v1/payment-methods/${id}`).then((r) => r.data.data);

export const setDefaultPaymentMethod = (id) =>
  client.patch(`/v1/payment-methods/${id}/default`).then((r) => r.data.data);

export const createSetupIntent = () =>
  client.post('/v1/payment-methods/setup').then((r) => r.data.data);
