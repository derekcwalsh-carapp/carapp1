import { Linking } from 'react-native';
import { create } from 'zustand';
import {
  fetchSubscription as fetchSubscriptionApi,
  createCheckoutSession,
  cancelSubscription as cancelSubscriptionApi,
  fetchInvoices as fetchInvoicesApi,
  openPortal as openPortalApi,
} from '../api/subscriptionService';

const useSubscriptionStore = create((set, get) => ({
  tier: 'free',
  billingCycle: null,
  lookupsUsed: 0,
  lookupsLimit: 5,
  vehicleLimit: 1,
  status: 'active',
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  invoices: [],
  subscriptionLoadStatus: 'idle',

  setBillingCycle: (cycle) => set({ billingCycle: cycle }),

  fetchSubscription: async () => {
    set({ subscriptionLoadStatus: 'loading' });
    try {
      const data = await fetchSubscriptionApi();
      set({
        tier: data.tier ?? 'free',
        billingCycle: data.billingCycle ?? null,
        lookupsUsed: data.lookupsUsed ?? 0,
        lookupsLimit: data.lookupsLimit ?? 5,
        vehicleLimit: data.vehiclesLimit ?? data.vehicleLimit ?? 1,
        status: data.status ?? 'active',
        currentPeriodEnd: data.currentPeriodEnd ?? null,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? false,
        subscriptionLoadStatus: 'success',
      });
    } catch {
      set({ subscriptionLoadStatus: 'error' });
    }
  },

  startCheckout: async (tier, cycle) => {
    const { url } = await createCheckoutSession(tier, cycle);
    if (url) await Linking.openURL(url);
  },

  cancelSubscription: async () => {
    await cancelSubscriptionApi();
    await get().fetchSubscription();
  },

  openPortal: () => openPortalApi(),

  fetchInvoices: async () => {
    const rows = await fetchInvoicesApi();
    set({ invoices: rows ?? [] });
    return rows ?? [];
  },
}));

export default useSubscriptionStore;
