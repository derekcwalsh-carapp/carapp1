import { Linking } from 'react-native';
import client from './client.js';

export const fetchSubscription = () =>
  client.get('/v1/subscription').then((r) => r.data.data);

export const subscribeToPlan = (tier, cycle) =>
  client.post('/v1/subscription/subscribe', { tier, cycle }).then((r) => r.data.data);

export const createCheckoutSession = (tier, cycle) =>
  client.post('/v1/subscription/checkout', { tier, cycle }).then((r) => r.data.data);

export const cancelSubscription = () =>
  client.post('/v1/subscription/cancel').then((r) => r.data.data);

export const fetchInvoices = () =>
  client.get('/v1/subscription/invoices').then((r) => r.data.data);

export const changeBillingCycle = (cycle) =>
  client.post('/v1/subscription/switch-cycle', { cycle }).then((r) => r.data.data);

export const openPortal = () =>
  client.post('/v1/subscription/portal').then((r) => {
    const url = r.data.data?.url;
    if (url) return Linking.openURL(url);
    return Promise.resolve();
  });
