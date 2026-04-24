import { create } from 'zustand';
import {
  createCheckoutSession,
  cancelSubscription as apiCancelSubscription,
} from '../api/subscriptionService';

const useSubscriptionStore = create((set) => ({
  tier: 'enthusiast',
  billingCycle: 'monthly',
  lookupsUsed: 32,
  lookupsLimit: 50,
  vehicleLimit: 5,
  status: 'active',
  currentPeriodEnd: '2026-05-15',

  setBillingCycle: (cycle) => set({ billingCycle: cycle }),

  startCheckout: (tier, cycle) => createCheckoutSession(tier, cycle),

  cancelSubscription: () =>
    apiCancelSubscription().then(() => set({ status: 'cancelled' })),

  openPortal: () => console.log('[CarLens] Opening Stripe Customer Portal'),
}));

export default useSubscriptionStore;
