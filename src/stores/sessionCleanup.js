import usePaymentStore from './paymentStore';
import useSubscriptionStore from './subscriptionStore';
import useAddressStore from './addressStore';

/**
 * Clears user-scoped in-memory cache when the authenticated session changes.
 * Prevents cross-account data leakage (payment methods, subscription snapshot, addresses).
 */
export function clearSensitiveStores() {
  usePaymentStore.getState().reset();
  useSubscriptionStore.getState().reset();
  useAddressStore.getState().reset();
}
