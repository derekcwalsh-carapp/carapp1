import { Linking } from 'react-native';
import { create } from 'zustand';
import {
  fetchSubscription as fetchSubscriptionApi,
  subscribeToPlan as subscribeToPlanApi,
  createCheckoutSession,
  cancelSubscription as cancelSubscriptionApi,
  fetchInvoices as fetchInvoicesApi,
  openPortal as openPortalApi,
  changeBillingCycle as changeBillingCycleApi,
} from '../api/subscriptionService';

const initialSubscriptionState = {
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
};

const useSubscriptionStore = create((set, get) => ({
  ...initialSubscriptionState,

  reset: () => set({ ...initialSubscriptionState }),

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

  subscribe: async (tier, cycle) => {
    const result = await subscribeToPlanApi(tier, cycle);
    if (!result.requiresAction) {
      await get().fetchSubscription();
    }
    return result;
  },

  startCheckout: async (tier, cycle) => {
    const { url } = await createCheckoutSession(tier, cycle);
    if (url) await Linking.openURL(url);
  },

  cancelSubscription: async () => {
    await cancelSubscriptionApi();
    await get().fetchSubscription();
  },

  changeBillingCycle: async (cycle) => {
    const result = await changeBillingCycleApi(cycle);
    if (!result.requiresAction) {
      await get().fetchSubscription();
    }
    return result;
  },

  openPortal: () => openPortalApi(),

  fetchInvoices: async () => {
    const rows = await fetchInvoicesApi();
    set({ invoices: rows ?? [] });
    return rows ?? [];
  },
}));

export default useSubscriptionStore;
