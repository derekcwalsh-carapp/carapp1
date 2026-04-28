import client from './client.js';

export async function fetchAddresses() {
  const res = await client.get('/v1/addresses');
  return res.data.data;
}

export async function fetchPaymentMethods() {
  const res = await client.get('/v1/payment-methods');
  return res.data.data;
}

export async function createCheckout(addressId, paymentMethodId) {
  const res = await client.post('/v1/checkout', {
    addressId,
    paymentMethodId,
  });
  return res.data.data;
}
