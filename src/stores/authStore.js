import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEY = '@carlens/auth';

const useAuthStore = create((set) => ({
  user: null,
  token: null,

  signIn: async (provider) => {
    // Replace with real OAuth flow per provider
    const user = { id: '1', provider };
    const token = 'mock-token';
    set({ user, token });
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ user, token }));
  },

  signOut: async () => {
    set({ user: null, token: null });
    await AsyncStorage.removeItem(AUTH_KEY);
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(AUTH_KEY);
      if (raw) {
        const { user, token } = JSON.parse(raw);
        set({ user, token });
      }
    } catch (_) {}
  },
}));

export default useAuthStore;
