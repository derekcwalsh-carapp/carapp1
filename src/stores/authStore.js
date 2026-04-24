import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEY = '@carlens/auth';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,

  signIn: async (provider) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const user = {
      id: '1',
      provider,
      name: 'Mike Sullivan',
      email: 'mike@example.com',
      avatarUri: null,
    };
    const token = 'mock-token';
    set({ user, token });
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ user, token }));
  },

  signOut: async () => {
    set({ user: null, token: null });
    await AsyncStorage.removeItem(AUTH_KEY);
  },

  updateProfile: async (fields) => {
    // TODO: replace with real PATCH /me API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    const { user, token } = get();
    if (!user) return;
    const next = { ...user, ...fields };
    set({ user: next });
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ user: next, token }));
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
