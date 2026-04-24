import { create } from 'zustand';
import {
  fetchNotificationPreferences,
  updateNotificationPreference,
} from '../api/notificationService';

const DEFAULT_PREFERENCES = {
  orderUpdates: true,
  identifyComplete: true,
  lookupWarning: true,
  subscriptionEmail: true,
  priceDropEmail: true,
  marketingEmail: true,
};

const useNotificationStore = create((set, get) => ({
  preferences: DEFAULT_PREFERENCES,
  status: 'idle',

  fetchPreferences: async () => {
    set({ status: 'loading' });
    try {
      const preferences = await fetchNotificationPreferences();
      set({ preferences, status: 'ready' });
    } catch (_) {
      set({ status: 'error' });
    }
  },

  updatePreference: async (key, value) => {
    const previous = get().preferences;
    set({ preferences: { ...previous, [key]: value } });
    try {
      await updateNotificationPreference(key, value);
    } catch (_) {
      set({ preferences: previous });
    }
  },
}));

export default useNotificationStore;
